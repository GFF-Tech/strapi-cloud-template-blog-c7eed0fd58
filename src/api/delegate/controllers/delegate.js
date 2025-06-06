'use strict';

/**
 * delegate controller
 */

// @ts-ignore
const {
  // @ts-ignore
  CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, ListUsersCommand,
  // @ts-ignore
  InitiateAuthCommand, RespondToAuthChallengeCommand, AdminUpdateUserAttributesCommand, AdminGetUserCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const facilitator = require('../../facilitator/controllers/facilitator');

// @ts-ignore
const { createCoreController } = require('@strapi/strapi').factories;
const sendEmail = require('../../../utils/email');
const { updateSalesforceParticipant } = require('../../../utils/salesforce');

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

module.exports = createCoreController('api::delegate.delegate', ({ strapi }) => ({
  async find(ctx) {
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    try {
      const result = await strapi.entityService.findOne('api::delegate.delegate', id);

      if (!result) {
        return ctx.notFound('Delegate not found');
      }

      return result;
    } catch (error) {
      console.log(error);
      return ctx.internalServerError('An error occurred while retrieving the delegate');
    }
  },

  async create(ctx) {
    const { data } = ctx.request.body;

    try {
      // 1. Extract passType from wcProductName (e.g. "Gold Pass 1" => "Gold")
      const passType = data.wcProductName.split(' ')[0];

      // 2. Find all delegates with same facilitatorId and passType
      const delegates = await strapi.entityService.findMany('api::delegate.delegate', {
        filters: {
          facilitatorId: data.facilitatorId,
          passType,
        },
      });

      // 3. Find first delegate with any empty required field
      let delegateToUpdate = null;
      console.log('Delegates found:', delegates.length);
      for (const d of delegates) {
        console.log({
          id: d.id,
          cognitoId: d.cognitoId,
          wcProductId: d.wcProductId,
          wcProductName: d.wcProductName,
          isFacilitator: d.isFacilitator,
          country: d.country,
        });
      }
      for (const d of delegates) {
        const hasMissingFields =
          !d.cognitoId ||
          !d.wcProductId ||
          !d.wcProductName ||
          typeof d.isFacilitator !== 'boolean';

        if (hasMissingFields) {
          delegateToUpdate = d;
          break;
        }
      }

      if (!delegateToUpdate) {
        // If none empty, return error (FE should prevent this)
        return ctx.conflict(`No available delegate slot for pass type: ${passType}`);
      }

      const updatedFields = {};

      // 4. Fill fields only if empty
      if (!delegateToUpdate.wcProductId) updatedFields.wcProductId = data.wcProductId;
      if (!delegateToUpdate.wcProductName) updatedFields.wcProductName = data.wcProductName;
      if (!delegateToUpdate.isFacilitator) updatedFields.isFacilitator = data.isFacilitator || false;
      if (!delegateToUpdate.country) updatedFields.country = data.country;
      if (!delegateToUpdate.sector) updatedFields.sector = data.sector || null;

      // 5. Create Cognito user if not facilitator and cognitoId missing
      let cognitoId = delegateToUpdate.cognitoId;
      if (!data.isFacilitator && !cognitoId) {
        const country = await strapi.entityService.findOne('api::country.country', data.country, {
          fields: ['country', 'countryCode'],
        });

        if (!country || !country.countryCode) {
          return ctx.badRequest('Invalid or missing country');
        }

        const formattedPhone = `${country.countryCode}${data.mobileNumber}`;

        try {
          const createCommand = new AdminCreateUserCommand({
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: data.officialEmailAddress,
            TemporaryPassword: 'Temp@123',
            MessageAction: 'SUPPRESS',
            DesiredDeliveryMediums: ['EMAIL'],
            UserAttributes: [
              { Name: 'email', Value: data.officialEmailAddress },
              { Name: 'phone_number', Value: formattedPhone },
              { Name: 'email_verified', Value: 'true' },
              { Name: 'custom:firstName', Value: data.firstName },
              { Name: 'custom:lastName', Value: data.lastName },
              { Name: 'custom:delegate', Value: 'true' },
              ...(data.companyName ? [{ Name: 'custom:companyName', Value: data.companyName }] : []),
            ],
          });

          const response = await client.send(createCommand);
          cognitoId = response.User.Username;

          // Set permanent password
          const passwordCommand = new AdminSetUserPasswordCommand({
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: data.officialEmailAddress,
            Password: 'Temp@123',
            Permanent: true,
          });

          await client.send(passwordCommand);
        } catch (error) {
          if (error.name === 'UsernameExistsException') {
            return ctx.conflict('Delegate already exists in Cognito');
          }
          throw error;
        }
      }

      updatedFields.cognitoId = cognitoId;

      // 6. Update delegate entry
      const updatedDelegate = await strapi.entityService.update(
        'api::delegate.delegate',
        delegateToUpdate.id,
        {
          data: updatedFields,
        }
      );

      // 8. Fetch full delegate record with relations
      const fullDelegate = await strapi.entityService.findOne('api::delegate.delegate', updatedDelegate.id, {
        populate: {
          country: { fields: ['country', 'countryCode'] },
          sector: { fields: ['name'] },
        },
      });

      // 9. Send verification email
      const firstName = data.firstName;
      const email = data.officialEmailAddress;
      const passTypeForEmail = passType;

      await sendEmail({
        to: email,
        subject: 'Thank You for Registering to GFF 2025!',
        templateName: 'verification',
        replacements: { passType: passTypeForEmail, firstName, confirmationId: fullDelegate.confirmationId },
      });

      const salesforcePayload = {
        upgrade: 'false',
        passType: passType,
        price: fullDelegate.price,
        confirmationId: fullDelegate.confirmationId,
        email: data.officialEmailAddress,
        mobilePhone: `${fullDelegate.country.countryCode}${data.mobileNumber}`,
        participantFirstName: data.firstName,
        participantLastName: data.lastName,
        company: data.companyName || 'ABC',
        sector: fullDelegate.sector.name || 'ABC', // you may need to fetch this from sector relation
        vertical: 'Engineer',
        level: 'Founder',
        GenderIdentity: 'Male',
        title: 'Engineer',
        linkdinProfile: 'ABC',
        twitterProfile: 'ABC',
        instagramProfile: 'ABC',
        personalEmail: data.officialEmailAddress
      };

      try {
        await updateSalesforceParticipant(salesforcePayload);
        strapi.log.info(`Salesforce updated for delegate ${fullDelegate.confirmationId}`);
      } catch (error) {
        strapi.log.error('Salesforce update failed:', error.message || error);
      }

      // 10. Return updated delegate with extra info
      return {
        ...fullDelegate,
        confirmationId: fullDelegate.confirmationId,
        firstName: data.firstName,
        lastName: data.lastName,
        officialEmailAddress: data.officialEmailAddress,
        mobileNumber: data.mobileNumber,
        companyName: data.companyName || null,
      };

    } catch (error) {
      console.error('Delegate creation failed:', error);
      return ctx.internalServerError('Failed to create delegate');
    }
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    if (!id || typeof id !== 'string') {
      return ctx.badRequest('Invalid ID');
    }

    try {
      const existing = await strapi.entityService.findOne('api::delegate.delegate', id, {
        populate: {
          country: { fields: ['country', 'countryCode'] },
          sector: { fields: ['name'] },
        },
      });
      if (!existing) {
        return ctx.notFound('Delegate not found');
      }

      // Only update in Cognito
      if (existing.cognitoId) {
        const updateCommand = new AdminUpdateUserAttributesCommand({
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          Username: existing.cognitoId,
          UserAttributes: [
            { Name: 'custom:firstName', Value: data.firstName },
            { Name: 'custom:lastName', Value: data.lastName },
          ],
        });

        await client.send(updateCommand);
      }

      const cognitoUser = await getCognitoUserBySub(existing.cognitoId);
      const email = cognitoUser?.email || '';
      const mobilePhone = cognitoUser?.phone_number || '';
      const companyName = cognitoUser?.companyName || '';

      const salesforcePayload = {
        upgrade: 'true',
        passType: existing.passType,
        price: existing.price,
        confirmationId: existing.confirmationId,
        email: email,
        mobilePhone: `${existing.country.countryCode}${mobilePhone}`,
        participantFirstName: data.firstName,
        participantLastName: data.lastName,
        company: companyName || 'ABC',
        sector: existing.sector.name || 'ABC', // you may need to fetch this from sector relation
        vertical: 'Engineer',
        level: 'Founder',
        GenderIdentity: 'Male',
        title: 'Engineer',
        linkdinProfile: 'ABC',
        twitterProfile: 'ABC',
        instagramProfile: 'ABC',
        personalEmail: data.officialEmailAddress
      };

      try {
        await updateSalesforceParticipant(salesforcePayload);
        strapi.log.info(`Salesforce updated for delegate ${existing.confirmationId}`);
      } catch (error) {
        strapi.log.error('Salesforce update failed:', error.message || error);
      }

      return { message: 'Delegate name updated in Cognito successfully' };

    } catch (error) {
      console.error('Update error:', error);
      return ctx.internalServerError('An error occurred while updating the delegate');
    }
  },

  async delete(ctx) {
    const { id } = ctx.params;

    const deletedDelegate = await strapi.entityService.delete('api::delegate.delegate', id);

    if (!deletedDelegate) {
      return ctx.notFound('Delegate not found');
    }

    return { message: 'Delegate deleted successfully' };
  },

  async login(ctx) {
    const { officialEmailAddress } = ctx.request.body;

    if (!officialEmailAddress) {
      return ctx.badRequest('Missing email');
    }

    try {
      // 1. Start Cognito Auth flow
      const command = new InitiateAuthCommand({
        AuthFlow: 'CUSTOM_AUTH',
        ClientId: process.env.COGNITO_CLIENT_ID,
        AuthParameters: {
          USERNAME: officialEmailAddress,
        },
      });

      const response = await client.send(command);

      // 2. Fetch the Cognito user to get their sub (ID)
      const getUserCommand = new AdminGetUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: officialEmailAddress,
      });

      const user = await client.send(getUserCommand);
      const cognitoId = user?.UserAttributes?.find(attr => attr.Name === 'sub')?.Value;

      if (!cognitoId) {
        return ctx.notFound('User not found in Cognito');
      }

      // 3. Check if delegate exists in Strapi using Cognito ID
      const delegate = await strapi.db.query('api::delegate.delegate').findOne({
        where: { cognitoId },
      });

      if (!delegate) {
        return ctx.notFound('Delegate not found');
      }

      // 4. Return session for OTP challenge
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
      const command = new RespondToAuthChallengeCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        ChallengeName: 'CUSTOM_CHALLENGE',
        Session: session,
        ChallengeResponses: {
          USERNAME: officialEmailAddress,
          ANSWER: otp,
        },
      });

      const response = await client.send(command);

      if (!response.AuthenticationResult) {
        return ctx.unauthorized('Authentication failed');
      }

      // Get user info from Cognito
      const getUserCommand = new AdminGetUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: officialEmailAddress,
      });

      const user = await client.send(getUserCommand);
      const attributes = user.UserAttributes;

      const getAttr = (name) => attributes.find((attr) => attr.Name === name)?.Value;

      const cognitoId = getAttr('sub');
      const email = getAttr('email');
      const phone = getAttr('phone_number');
      const firstName = getAttr('custom:firstName');
      const lastName = getAttr('custom:lastName');
      const companyName = getAttr('custom:companyName') || null;

      if (!cognitoId) {
        return ctx.notFound('Cognito user ID not found');
      }

      // Find delegate in Strapi using Cognito ID
      const delegate = await strapi.db.query('api::delegate.delegate').findOne({
        where: { cognitoId },
        populate: {
          sector: true,
          country: true,
        },
      });

      if (!delegate) {
        return ctx.notFound('Delegate not found');
      }

      // Strip country code from mobile number
      const countryCode = delegate.country?.countryCode || '';
      const mobileNumber = phone?.startsWith(countryCode)
        ? phone.slice(countryCode.length)
        : phone;

      return ctx.send({
        message: 'Login successful',
        idToken: response.AuthenticationResult?.IdToken,
        accessToken: response.AuthenticationResult?.AccessToken,
        refreshToken: response.AuthenticationResult?.RefreshToken,
        data: {
          cognitoId,
          officialEmailAddress: email,
          firstName,
          lastName,
          companyName,
          mobileNumber,
          ...delegate,
        },
      });

    } catch (error) {
      console.error('OTP verification failed:', error);
      return ctx.internalServerError('An unexpected error occurred');
    }
  },

}));

async function getCognitoUserBySub(sub) {
  if (!sub) return null;

  try {
    const listUsersCommand = new ListUsersCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Filter: `sub = "${sub}"`,
      Limit: 1,
    });

    const response = await client.send(listUsersCommand);

    if (!response.Users || response.Users.length === 0) return null;

    const user = response.Users[0];
    const attributes = {};
    for (const attr of user.Attributes) {
      attributes[attr.Name] = attr.Value;
    }

    return {
      sub: attributes.sub,
      email: attributes.email,
      phone_number: attributes.phone_number,
      firstName: attributes['custom:firstName'] || '',
      lastName: attributes['custom:lastName'] || '',
      companyName: attributes['custom:companyName'] || '',
    };
  } catch (err) {
    console.error('Failed to fetch Cognito user:', err);
    return null;
  }
}