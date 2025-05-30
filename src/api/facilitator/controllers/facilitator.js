'use strict';

// @ts-ignore
const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios');
const crypto = require('crypto');

const {
  // @ts-ignore
  CognitoIdentityProviderClient, SignUpCommand, ConfirmSignUpCommand, ResendConfirmationCodeCommand,
  // @ts-ignore
  InitiateAuthCommand, RespondToAuthChallengeCommand, AdminDeleteUserCommand, AdminGetUserCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const { log } = require('console');


const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

module.exports = createCoreController('api::facilitator.facilitator', ({ strapi }) => ({

  async find(ctx) {
    try {
      const entities = await strapi.entityService.findMany('api::facilitator.facilitator', {
        populate: {
          gstDetails: true,
          sector: {
            fields: ['sector'],
          },
          country: {
            fields: ['country', 'countryCode'],
          },
        },
        filters: ctx.query.filters,
        sort: ctx.query.sort,
        pagination: ctx.query.pagination,
      });

      const count = await strapi.entityService.count('api::facilitator.facilitator', {
        filters: ctx.query.filters,
      });

      return {
        data: entities,
        meta: {
          pagination: {
            total: count,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching facilitators:', error);
      return ctx.internalServerError('Failed to fetch facilitators');
    }
  },

  async findOne(ctx) {
    const { id } = ctx.params;
  
    try {
      const facilitator = await strapi.db.query('api::facilitator.facilitator').findOne({
        where: { id },
        populate: {
          country: true,
          sector: true,
          delegates: {
            populate: ['sector', 'country'],
          },
        },
      });
  
      if (!facilitator) {
        return ctx.notFound('Facilitator not found');
      }
  
      // 1. Get Cognito user data for facilitator
      const userCommand = new AdminGetUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: facilitator.cognitoId,
      });
  
      const userResult = await client.send(userCommand);
  
      const attributes = {};
      userResult.UserAttributes.forEach(attr => {
        attributes[attr.Name] = attr.Value;
      });
  
      const cognitoId = attributes['sub'];
      const facilitatorFirstName = attributes['custom:firstName'];
      const facilitatorLastName = attributes['custom:lastName'];
      const facilitatorEmail = attributes['email'];
      const facilitatorPhone = attributes['phone_number'];
      const facilitatorCompany = attributes['custom:companyName'] || null;
  
      let mobileNumber = facilitatorPhone;
      if (facilitatorPhone && facilitator?.country?.countryCode) {
        const code = facilitator.country.countryCode.replace('+', '');
        mobileNumber = facilitatorPhone.replace(`+${code}`, '');
      }
  
      // 2. Enrich delegates
      const enrichedDelegates = [];
  
      for (const delegate of facilitator.delegates || []) {
        const cognitoDelegateId = delegate.cognitoId;
        let firstName = null;
        let lastName = null;
        let officialEmailAddress = null;
        let mobileNumber = null;
        let companyName = null;
  
        if (delegate.isFacilitator) {
          firstName = facilitatorFirstName;
          lastName = facilitatorLastName;
          officialEmailAddress = facilitatorEmail;
          companyName = facilitatorCompany;
  
          if (facilitatorPhone && delegate?.country?.countryCode) {
            const code = delegate.country.countryCode.replace('+', '');
            mobileNumber = facilitatorPhone.replace(`+${code}`, '');
          } else {
            mobileNumber = facilitatorPhone;
          }
  
        } else if (delegate.cognitoId) {
          try {
            const delegateUser = await client.send(new AdminGetUserCommand({
              UserPoolId: process.env.COGNITO_USER_POOL_ID,
              Username: delegate.cognitoId,
            }));
  
            const delegateAttrs = {};
            delegateUser.UserAttributes.forEach(attr => {
              delegateAttrs[attr.Name] = attr.Value;
            });
  
            firstName = delegateAttrs['custom:firstName'];
            lastName = delegateAttrs['custom:lastName'];
            officialEmailAddress = delegateAttrs['email'];
            mobileNumber = delegateAttrs['phone_number'];
            companyName = delegateAttrs['custom:companyName'] || null;
  
            if (mobileNumber && delegate?.country?.countryCode) {
              const code = delegate.country.countryCode.replace('+', '');
              mobileNumber = mobileNumber.replace(`+${code}`, '');
            }
  
          } catch (e) {
            console.warn(`Failed to fetch Cognito data for delegate ${delegate.cognitoId}:`, e.message);
          }
        }
  
        enrichedDelegates.push({
          ...delegate,
          firstName,
          lastName,
          officialEmailAddress,
          mobileNumber,
          companyName,
        });
      }
  
      // 3. Fetch WooCommerce order if present
      const wooOrderDetails = await fetchWooOrder(facilitator.wcOrderId);
  
      // 4. Return combined data
      return ctx.send({
        data: {
          cognitoId,
          officialEmailAddress: facilitatorEmail,
          mobileNumber,
          firstName: facilitatorFirstName,
          lastName: facilitatorLastName,
          companyName: facilitatorCompany,
          ...facilitator,
          delegates: enrichedDelegates,
          wooOrderDetails,
        },
      });
  
    } catch (error) {
      console.error('Find one facilitator failed:', error);
      return ctx.internalServerError('Failed to fetch facilitator');
    }
  },

  async create(ctx) {
    const { data } = ctx.request.body;
  
    try {
      // 1. Fetch and validate country code
      const country = await strapi.entityService.findOne('api::country.country', data.country, {
        fields: ['countryCode'],
      });
  
      if (!country || !country.countryCode) {
        return ctx.badRequest('Invalid or missing country code.');
      }
  
      // 2. Format phone number for Cognito
      const formattedPhoneNumber = `${country.countryCode}${data.mobileNumber}`;
  
      // 3. Sign up user in Cognito
      const command = new SignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: data.officialEmailAddress,
        Password: 'Temp@123',
        UserAttributes: [
          { Name: 'email', Value: data.officialEmailAddress },
          { Name: 'phone_number', Value: formattedPhoneNumber },
          { Name: 'custom:firstName', Value: data.firstName },
          { Name: 'custom:lastName', Value: data.lastName },
          { Name: 'custom:delegate', Value: 'false' },
          ...(data.companyName ? [{ Name: 'custom:companyName', Value: data.companyName }] : []),
        ],
      });
  
      let response;
      try {
        response = await client.send(command);
      } catch (error) {
        if (error.name === 'UsernameExistsException') {
          return ctx.conflict('A user with this email already exists.');
        }
  
        console.error('Cognito SignUp error:', error);
        return ctx.internalServerError(`Registration failed: ${error.message || 'Unknown error'}`);
      }
  
      const cognitoId = response.UserSub;
  
      // 4. Create facilitator entry
      let createdFacilitator;
      try {
        createdFacilitator = await strapi.entityService.create('api::facilitator.facilitator', {
          data: {
            country: data.country,
            sector: data.sector || null,
            cognitoId,
          },
        });
      } catch (error) {
        console.error('Failed to create facilitator:', error);
        return ctx.internalServerError('Failed to save user information to the system.');
      }
  
      // 5. Populate facilitator with relations
      const populatedFacilitator = await strapi.entityService.findOne(
        'api::facilitator.facilitator',
        createdFacilitator.id,
        {
          populate: {
            country: { fields: ['country', 'countryCode'] },
            sector: { fields: ['name'] },
          },
        }
      );
  
      return {
        ...populatedFacilitator,
        firstName: data.firstName,
        lastName: data.lastName,
        officialEmailAddress: data.officialEmailAddress,
        mobileNumber: data.mobileNumber,
        companyName: data.companyName,
        session: response.Session,
      };
  
    } catch (error) {
      console.error('Unexpected error in facilitator creation:', error);
      return ctx.internalServerError('An unexpected error occurred while registering.');
    }
  },

  async verifyFacilitator(ctx) {
    const { officialEmailAddress, otp } = ctx.request.body;

    if (!officialEmailAddress || !otp) {
      return ctx.badRequest('Email and OTP are required.');
    }

    try {
      // 1. Confirm signup in Cognito
      const confirmCommand = new ConfirmSignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: officialEmailAddress,
        ConfirmationCode: otp,
      });

      const confirmResponse = await client.send(confirmCommand);

      // 2. Get user from Cognito to extract Cognito ID (sub)
      const adminGetCommand = new AdminGetUserCommand({
        Username: officialEmailAddress,
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
      });

      const userData = await client.send(adminGetCommand);
      const subAttr = userData.UserAttributes.find(attr => attr.Name === 'sub');
      const cognitoId = subAttr?.Value;

      if (!cognitoId) {
        return ctx.internalServerError('Cognito ID not found for user');
      }

      // 3. Update facilitator in Strapi by cognitoId
      const existing = await strapi.db.query('api::facilitator.facilitator').findOne({
        where: { cognitoId },
      });

      if (existing) {
        await strapi.entityService.update('api::facilitator.facilitator', existing.id, {
          data: { isCognitoVerified: true },
        });
      }

      return {
        message: 'Facilitator verified successfully',
        data: confirmResponse,
      };

    } catch (error) {
      console.error('Cognito verification error:', error);

    if (error.name === 'CodeMismatchException') {
      return ctx.badRequest('The provided OTP is incorrect.');
    }

    if (error.name === 'ExpiredCodeException') {
      return ctx.badRequest('The OTP has expired. Please request a new one.');
    }

    return ctx.internalServerError('Verification failed due to an unexpected error.');
    }
  },

  async resendFacilitatorOtp(ctx) {
    const { officialEmailAddress, session } = ctx.request.body;

    if (!officialEmailAddress) {
      return ctx.badRequest('Email address is required.');
    }

    try {
      const command = new ResendConfirmationCodeCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: officialEmailAddress,
        Session: session,
      });

      const response = await client.send(command);

      return { message: 'OTP resent successfully', data: response };
    } catch (error) {
      console.error('Cognito OTP resend error:', error);

    if (error.name === 'UserNotFoundException') {
      return ctx.notFound('No user found with the provided email address.');
    }

    if (error.name === 'InvalidParameterException') {
      return ctx.badRequest('Cannot resend OTP at this stage. The user might already be confirmed.');
    }

    return ctx.internalServerError('Failed to resend OTP due to an unexpected error.');
    }
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    if (!id || typeof id !== 'string') {
      return ctx.badRequest('Invalid ID');
    }

    try {
      const existing = await strapi.entityService.findOne('api::facilitator.facilitator', id);
      if (!existing) {
        return ctx.notFound('Facilitator not found');
      }

      await strapi.entityService.update('api::facilitator.facilitator', id, {
        data: {
          ...data,
          gstDetails: data.gstDetails ?? null,
        }
      });

      const updated = await strapi.entityService.findOne('api::facilitator.facilitator', id, {
        populate: {
          gstDetails: true,
          country: {
            fields: ['country', 'countryCode'],
          },
          sector: {
            fields: ['name'],
          },
        },
      });

      return updated;

    } catch (error) {
      console.error('Update error:', error);
      return ctx.internalServerError('An error occurred while updating the facilitator');
    }
  },

  async delete(ctx) {
    const { id } = ctx.params;

    const deletedFacilitator = await strapi.entityService.delete('api::facilitator.facilitator', id);

    if (!deletedFacilitator) {
      return ctx.notFound('Facilitator not found');
    }

    return { message: 'Facilitator deleted successfully' };
  },

  async login(ctx) {
    const { officialEmailAddress } = ctx.request.body;
  
    if (!officialEmailAddress) {
      return ctx.badRequest('Email address is required.');
    }
  
    try {
      // 1. Fetch Cognito user details
      const userData = await client.send(new AdminGetUserCommand({
        Username: officialEmailAddress,
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
      }));
  
      const attributes = userData.UserAttributes;
      const subAttr = attributes.find(attr => attr.Name === 'sub');
      const delegateAttr = attributes.find(attr => attr.Name === 'custom:delegate');
      const userStatus = userData.UserStatus;
  
      const cognitoId = subAttr?.Value;
      const isDelegate = delegateAttr?.Value === 'true';
  
      if (!cognitoId) {
        return ctx.notFound('Email is not registered. Please register first.');
      }
  
      if (isDelegate) {
        return ctx.forbidden('This email is associated with a participant account. Please use the main contact email provided during registration to log in.');
      }
  
      // 2. Find facilitator in Strapi
      const facilitator = await strapi.db.query('api::facilitator.facilitator').findOne({
        where: { cognitoId },
      });

      if (!facilitator) {
        await client.send(new AdminDeleteUserCommand({
          Username: officialEmailAddress,
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
        }));
  
        return ctx.badRequest('Your registration was not completed. Please register again.');
      }
  
      // 3. If user is UNCONFIRMED and facilitator is partially registered, delete both
      if (userStatus === 'UNCONFIRMED' || facilitator?.passBought === false) {
        // Delete user from Cognito
        await client.send(new AdminDeleteUserCommand({
          Username: officialEmailAddress,
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
        }));
  
        // Delete user from Strapi
        await strapi.entityService.delete('api::facilitator.facilitator', facilitator.id);
  
        return ctx.badRequest('Your registration was not completed. Please register again.');
      }
  
      // 4. Proceed to send OTP using custom auth flow
      const authCommand = new InitiateAuthCommand({
        AuthFlow: 'CUSTOM_AUTH',
        ClientId: process.env.COGNITO_CLIENT_ID,
        AuthParameters: {
          USERNAME: officialEmailAddress,
        },
      });
  
      const response = await client.send(authCommand);
  
      return ctx.send({
        message: 'OTP sent to email',
        session: response.Session,
      });
  
    } catch (error) {
      console.error('Login error:', error);
  
      if (error.name === 'UserNotFoundException') {
        return ctx.notFound('Email is not registered. Please register first.');
      }
  
      return ctx.internalServerError('Failed to process login');
    }
  },  

  async verifyLoginOtp(ctx) {
    const { officialEmailAddress, otp, session } = ctx.request.body;
  
    if (!officialEmailAddress || !otp || !session) {
      return ctx.badRequest('Email, OTP, and session are required.');
    }
  
    try {
      // 1. Verify OTP with Cognito
      const challengeCommand = new RespondToAuthChallengeCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        ChallengeName: 'CUSTOM_CHALLENGE',
        Session: session,
        ChallengeResponses: {
          USERNAME: officialEmailAddress,
          ANSWER: otp,
        },
      });
  
      const response = await client.send(challengeCommand);
  
      if (!response.AuthenticationResult) {
        return ctx.unauthorized('OTP verification failed.');
      }
  
      // 2. Get user profile from Cognito
      const userCommand = new AdminGetUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: officialEmailAddress,
      });
  
      const userResult = await client.send(userCommand);
  
      const attributes = {};
      userResult.UserAttributes.forEach(attr => {
        attributes[attr.Name] = attr.Value;
      });
  
      const cognitoId = attributes['sub'];
      const facilitatorFirstName  = attributes['custom:firstName'];
      const facilitatorLastName  = attributes['custom:lastName'];
      const facilitatorEmail  = attributes['email'];
      const facilitatorPhone  = attributes['phone_number'];
      const facilitatorCompany  = attributes['custom:companyName'] || null;
  
      if (!cognitoId) {
        return ctx.internalServerError('Cognito ID missing');
      }
  
      // 3. Find facilitator in Strapi using Cognito ID
      const facilitator = await strapi.db.query('api::facilitator.facilitator').findOne({
        where: { cognitoId },
        populate: {
          country: true,
          sector: true,
          delegates: {
            populate: ['sector', 'country'],
          },
        },
      });
  
      if (!facilitator) {
        return ctx.notFound('User not found in the system.');
      }
  
      let mobileNumber = facilitatorPhone;
      if (facilitatorPhone && facilitator?.country?.countryCode) {
        const code = facilitator.country.countryCode.replace('+', '');
        mobileNumber = facilitatorPhone.replace(`+${code}`, '');
      }
  
      // 4. Enrich delegates with Cognito details
      const enrichedDelegates = [];
  
      for (const delegate of facilitator.delegates || []) {
        const cognitoDelegateId = delegate.cognitoId;
        let firstName = null;
        let lastName = null;
        let officialEmailAddress = null;
        let mobileNumber = null;
        let companyName = null;
  
        if (delegate.isFacilitator) {
          firstName = facilitatorFirstName;
          lastName = facilitatorLastName;
          officialEmailAddress = facilitatorEmail;
          companyName = facilitatorCompany;
      
          if (facilitatorPhone  && delegate?.country?.countryCode) {
            const code = delegate.country.countryCode.replace('+', '');
            mobileNumber = facilitatorPhone.replace(`+${code}`, '');
          } else {
            mobileNumber = facilitatorPhone;
          }
      
        } else if (delegate.cognitoId) {
          // If not isFacilitator, fetch from Cognito
          try {
            const delegateUser = await client.send(new AdminGetUserCommand({
              UserPoolId: process.env.COGNITO_USER_POOL_ID,
              Username: delegate.cognitoId,
            }));
      
            const delegateAttrs = {};
            delegateUser.UserAttributes.forEach(attr => {
              delegateAttrs[attr.Name] = attr.Value;
            });
      
            firstName = delegateAttrs['custom:firstName'];
            lastName = delegateAttrs['custom:lastName'];
            officialEmailAddress = delegateAttrs['email'];
            mobileNumber = delegateAttrs['phone_number'];
            companyName = delegateAttrs['custom:companyName'] || null;
      
            if (mobileNumber && delegate?.country?.countryCode) {
              const code = delegate.country.countryCode.replace('+', '');
              mobileNumber = mobileNumber.replace(`+${code}`, '');
            }
      
          } catch (e) {
            console.warn(`Failed to fetch Cognito data for delegate ${delegate.cognitoId}:`, e.message);
          }
        }
  
        enrichedDelegates.push({
          ...delegate,
          firstName,
          lastName,
          officialEmailAddress,
          mobileNumber,
          companyName,
        });
      }
  
      // 5. Fetch WooCommerce order if present
      const wooOrderDetails = await fetchWooOrder(facilitator.wcOrderId);
  
      // 6. Return combined Cognito + Strapi data
      return ctx.send({
        message: 'Login successful',
        idToken: response.AuthenticationResult?.IdToken,
        accessToken: response.AuthenticationResult?.AccessToken,
        refreshToken: response.AuthenticationResult?.RefreshToken,
        data: {
          cognitoId,
          officialEmailAddress: facilitatorEmail,
          mobileNumber,
          firstName: facilitatorFirstName,
          lastName: facilitatorLastName,
          companyName: facilitatorCompany,
          ...facilitator,
          delegates: enrichedDelegates,
          wooOrderDetails,
        },
      });
  
    } catch (error) {
      console.error('OTP verification failed:', error);
      return ctx.internalServerError('OTP verification failed due to an unexpected error.');
    }
  },

  // async wooOrderSync(ctx) {
  //   try {
  //     const wooOrder = ctx.request.body;
  //     const metaData = Array.isArray(wooOrder.meta_data) ? wooOrder.meta_data : [];
  //     const getMetaValue = (key) => metaData.find(m => m.key === key)?.value ?? null;

  //     const strapiUserId = getMetaValue('strapiUserId');

  //     if (!strapiUserId) {
  //       return ctx.send({ warning: 'Strapi user ID missing in order' });
  //     }

  //     const numericUserId = parseInt(strapiUserId, 10);
  //     if (isNaN(numericUserId)) {
  //        return ctx.send({ warning: 'Invalid Strapi user ID' });
  //     }

  //     const existingFacilitator = await strapi.entityService.findOne('api::facilitator.facilitator', numericUserId);

  //     if (!existingFacilitator) {
  //       return ctx.send({ warning: 'Facilitator not found' });
  //     }

  //     const totalAmount = getMetaValue('totalAmount');
  //     const gstDetails = {
  //       companyName: getMetaValue('companyName'),
  //       companyAddress: getMetaValue('companyAddress'),
  //       companyPOC: getMetaValue('companyPOC'),
  //       billingAddress: getMetaValue('billingAddress'),
  //       pincode: getMetaValue('pincode'),
  //     };

  //     // Update facilitator
  //     await strapi.entityService.update('api::facilitator.facilitator', numericUserId, {
  //       data: {
  //         wcOrderStatus: wooOrder.status,
  //         wcOrderId: String(wooOrder.id),
  //         totalAmount: totalAmount,
  //         gstDetails: gstDetails,
  //       },
  //     });

  //     return ctx.send({ message: 'Order synced and GST data saved successfully' });

  //   } catch (err) {
  //     // console.error('❌ Webhook error:', err);
  //     return ctx.send({ error: 'Internal error occurred. Logged for review.' });
  //   }
  // },

}));

async function fetchWooOrder(wcOrderId) {
  if (!wcOrderId) return { error: 'No order ID' };
  const baseURL = process.env.WC_BASE_URL;
  const username = process.env.WC_CONSUMER_KEY;
  const password = process.env.WC_CONSUMER_SECRET;

  try {
    const res = await axios.get(`${baseURL}/orders/${wcOrderId}`, {
      auth: {
        username,
        password
      },
    });
    return res.data;

  } catch (err) {
    return { error: 'WooCommerce order fetch failed', details: err.message };
  }
}