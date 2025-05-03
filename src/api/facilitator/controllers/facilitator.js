'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios');

module.exports = createCoreController('api::facilitator.facilitator', ({ strapi }) => ({

  async find(ctx) {
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    try {
      const result = await strapi.entityService.findOne('api::facilitator.facilitator', id, {
        populate: ['gstDetails'],
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

      // Format phone number as E.164
      const formattedPhoneNumber = `${country.countryCode}${data.mobileNumber}`;

      // ISO 8601 timestamp for X-Amz-Date
      const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '') + 'Z';
      // Call Cognito SignUp
      const cognitoRes = await axios.post(
        process.env.COGNITO_URL,
        {
          ClientId: process.env.COGNITO_CLIENT_ID,
          Username: data.officialEmailAddress,
          Password: 'Temp@123', // optionally generate securely
          UserAttributes: [
            { Name: 'email', Value: data.officialEmailAddress },
            { Name: 'phone_number', Value: formattedPhoneNumber },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.SignUp',
            'X-Amz-Date': amzDate,
          },
        }
      );
  
      const cognitoId = cognitoRes.data.UserSub;
  
      // Create facilitator in Strapi DB
      const createdFacilitator = await strapi.entityService.create('api::facilitator.facilitator', {
        data: {
          ...data,
          cognitoId, // Save Cognito ID
        },
      });
  
      return createdFacilitator;
    } catch (error) {
      const errData = error.response?.data;
      if (errData?.__type === 'UsernameExistsException') {
        return ctx.conflict('User already exists in Cognito');
      }
      console.error('Cognito error:', errData || error.message);
      return ctx.internalServerError('Failed to create facilitator with Cognito');
    }
  },

  async verifyFacilitator(ctx) {
    const { officialEmailAddress, otp } = ctx.request.body;
  
    if (!officialEmailAddress || !otp) {
      return ctx.badRequest('Missing email or otp');
    }
  
    try {
      const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '') + 'Z';
  
      const response = await axios.post(
        process.env.COGNITO_URL,
        {
          ClientId: process.env.COGNITO_CLIENT_ID,
          Username: officialEmailAddress,
          ConfirmationCode: otp
        },
        {
          headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.ConfirmSignUp',
            'X-Amz-Date': amzDate,
          }
        }
      );

      const existing = await strapi.db.query('api::facilitator.facilitator').findOne({
        where: { officialEmailAddress: officialEmailAddress },
      });
  
      if (existing) {
        await strapi.entityService.update('api::facilitator.facilitator', existing.id, {
          data: { isCognitoVerified: true }
        });
      }
  
  
      return { message: 'Facilitator verified successfully', data: response.data };
  
    } catch (error) {
      const err = error.response?.data || error.message;
      console.error('Cognito verify error:', err);
      return ctx.internalServerError('Verification failed');
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
        populate: ['gstDetails'],
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

}));
