'use strict';

// @ts-ignore
const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios');

const {
  // @ts-ignore
  CognitoIdentityProviderClient,
  // @ts-ignore
  SignUpCommand,
  // @ts-ignore
  ConfirmSignUpCommand,
  // @ts-ignore
  ResendConfirmationCodeCommand,
  // @ts-ignore
  // @ts-ignore
  InitiateAuthCommand,
  // @ts-ignore
  RespondToAuthChallengeCommand
} = require('@aws-sdk/client-cognito-identity-provider');


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
      const country = await strapi.entityService.findOne('api::country.country', data.country, {
        fields: ['countryCode'],
      });

      if (!country || !country.countryCode) {
        return ctx.badRequest('Invalid or missing country');
      }

      const formattedPhoneNumber = `${country.countryCode}${data.mobileNumber}`;

      const command = new SignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: data.officialEmailAddress,
        Password: 'Temp@123',
        UserAttributes: [
          { Name: 'email', Value: data.officialEmailAddress },
          { Name: 'phone_number', Value: formattedPhoneNumber },
        ],
      });

      const response = await client.send(command);
      const cognitoId = response.UserSub;

      const createdFacilitator = await strapi.entityService.create('api::facilitator.facilitator', {
        data: {
          ...data,
          cognitoId,
        },
        populate: {
          country: {
            fields: ['country', 'countryCode'],
          },
          sector: {
            fields: ['name'],
          },
        },
      });

      return createdFacilitator;
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
      const command = new ConfirmSignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: officialEmailAddress,
        ConfirmationCode: otp,
      });

      const response = await client.send(command);

      const existing = await strapi.db.query('api::facilitator.facilitator').findOne({
        where: { officialEmailAddress },
      });

      if (existing) {
        await strapi.entityService.update('api::facilitator.facilitator', existing.id, {
          data: { isCognitoVerified: true },
        });
      }

      return { message: 'Facilitator verified successfully', data: response };
    } catch (error) {
      console.error('AWS SDK Cognito verify error:', error);
      return ctx.internalServerError('Verification failed');
    }
  },

  async resendFacilitatorOtp(ctx) {
    const { officialEmailAddress } = ctx.request.body;

    if (!officialEmailAddress) {
      return ctx.badRequest('Missing email address');
    }

    try {
      const command = new ResendConfirmationCodeCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: officialEmailAddress,
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

      // Commented out real Cognito logic
      
      // const command = new InitiateAuthCommand({
      //   AuthFlow: 'CUSTOM_AUTH',
      //   ClientId: process.env.COGNITO_CLIENT_ID,
      //   AuthParameters: {
      //     USERNAME: officialEmailAddress,
      //   },
      // });
  
      // const response = await client.send(command);

      const facilitator = await strapi.db.query('api::facilitator.facilitator').findOne({
        where: { officialEmailAddress }
      });
  
      if (!facilitator) {
        return ctx.notFound('Facilitator not found');
      }

      // return ctx.send({ message: 'OTP sent to email', session: response.Session });
     
      // Dummy session logic
      const dummySession = `dummy-session-${Date.now()}`;
      return ctx.send({ message: 'OTP sent to email', session: dummySession });
  
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
      // Dummy OTP validation
      if (otp !== '1234') {
        return ctx.unauthorized('Invalid OTP');
      }

      // const command = new RespondToAuthChallengeCommand({
      //   ClientId: process.env.COGNITO_CLIENT_ID,
      //   ChallengeName: 'CUSTOM_CHALLENGE',
      //   Session: session,
      //   ChallengeResponses: {
      //     USERNAME: officialEmailAddress,
      //     ANSWER: otp,
      //   },
      // });

      // const response = await client.send(command);

      // // Optional: store or return tokens
      // return {
      //   message: 'Login successful',
      //   idToken: response.AuthenticationResult?.IdToken,
      //   accessToken: response.AuthenticationResult?.AccessToken,
      //   refreshToken: response.AuthenticationResult?.RefreshToken,
      // };

      // if (!response.AuthenticationResult) {
      //   return ctx.unauthorized('Authentication failed');
      // }
  
      // Fetch facilitator and delegates using findOne
      const facilitator = await strapi.db.query('api::facilitator.facilitator').findOne({
        where: { officialEmailAddress },
        populate: {
          delegates: {
            populate: ['sector', 'country'],
          },
        },
      });
  
      if (!facilitator) {
        return ctx.notFound('Facilitator not found');
      }
  
      const wooOrderDetails = await fetchWooOrder(facilitator.wcOrderId);
  
      return ctx.send({
        message: 'Login successful',
        idToken: 'dummy-id-token',
        accessToken: 'dummy-access-token',
        refreshToken: 'dummy-refresh-token',
        // idToken: response.AuthenticationResult?.IdToken,
        // accessToken: response.AuthenticationResult?.AccessToken,
        // refreshToken: response.AuthenticationResult?.RefreshToken,
        data: {
          ...facilitator,
          wooOrderDetails,
        },
      });
  
    } catch (error) {
      console.error('OTP verification failed:', error);
      return ctx.internalServerError('An unexpected error occurred');
    }
  },

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