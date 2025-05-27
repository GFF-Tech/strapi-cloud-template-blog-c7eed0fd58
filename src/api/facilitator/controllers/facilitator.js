'use strict';

// @ts-ignore
const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios');
const crypto = require('crypto');

const {
  // @ts-ignore
  CognitoIdentityProviderClient, SignUpCommand, ConfirmSignUpCommand, ResendConfirmationCodeCommand,
  // @ts-ignore
  InitiateAuthCommand, RespondToAuthChallengeCommand, GetUserCommand, AdminGetUserCommand
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
      const result = await strapi.entityService.findOne('api::facilitator.facilitator', id, {
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

      if (!result) {
        return ctx.notFound('Facilitator not found');
      }

      return result;
    } catch (error) {
      console.log(error);
      return ctx.internalServerError('An error occurred while retrieving the facilitator');
    }
  },

  async create(ctx) {
    const { data } = ctx.request.body;

    try {
      // 1. Fetch and validate country code
      const country = await strapi.entityService.findOne('api::country.country', data.country, {
        fields: ['countryCode'],
      });

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

      const response = await client.send(command);
      const cognitoId = response.UserSub;

      const createdFacilitator = await strapi.entityService.create('api::facilitator.facilitator', {
        data: {
          country: data.country,
          sector: data.sector || null,
          cognitoId,
        },
      });

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
      const errCode = error.name;

      if (errCode === 'UsernameExistsException') {
        return ctx.conflict('User already exists in Cognito');
      }

      console.error('Cognito SignUp error:', error);
      return ctx.internalServerError('Failed to create facilitator with Cognito');
    }
  },

  async verifyFacilitator(ctx) {
    const { officialEmailAddress, otp } = ctx.request.body;

    if (!officialEmailAddress || !otp) {
      return ctx.badRequest('Missing email or OTP');
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
      console.error('Cognito verify error:', error);
      return ctx.internalServerError('Verification failed');
    }
  },

  async resendFacilitatorOtp(ctx) {
    const { officialEmailAddress, session } = ctx.request.body;

    if (!officialEmailAddress) {
      return ctx.badRequest('Missing email address');
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
      console.error('Cognito resend error:', error);
      return ctx.internalServerError('Failed to resend OTP');
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
      return ctx.badRequest('Missing email');
    }

    try {
      // 1. Initiate custom auth challenge with Cognito
      const authCommand = new InitiateAuthCommand({
        AuthFlow: 'CUSTOM_AUTH',
        ClientId: process.env.COGNITO_CLIENT_ID,
        AuthParameters: {
          USERNAME: officialEmailAddress,
        },
      });

      const response = await client.send(authCommand);

      // 2. Fetch Cognito user to get the Cognito ID (sub)
      const adminGetUserCommand = new AdminGetUserCommand({
        Username: officialEmailAddress,
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
      });

      const userData = await client.send(adminGetUserCommand);
      const subAttr = userData.UserAttributes.find(attr => attr.Name === 'sub');
      const cognitoId = subAttr?.Value;

      if (!cognitoId) {
        return ctx.internalServerError('Cognito ID not found for user');
      }

      // 3. Fetch facilitator from Strapi using cognitoId
      const facilitator = await strapi.db.query('api::facilitator.facilitator').findOne({
        where: { cognitoId },
      });

      if (!facilitator) {
        return ctx.notFound('Facilitator not found');
      }

      return ctx.send({
        message: 'OTP sent to email',
        session: response.Session,
      });

    } catch (error) {
      console.error('Login error:', error);
      return ctx.internalServerError('Failed to process login');
    }
  },

  async verifyLoginOtp(ctx) {
    const { officialEmailAddress, otp, session } = ctx.request.body;
  
    if (!officialEmailAddress || !otp || !session) {
      return ctx.badRequest('Missing data');
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
        return ctx.unauthorized('Authentication failed');
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
        return ctx.notFound('Facilitator not found');
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
      return ctx.internalServerError('An unexpected error occurred');
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