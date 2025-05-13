'use strict';

/**
 * delegate controller
 */

// @ts-ignore
const {
  // @ts-ignore
  CognitoIdentityProviderClient,
  // @ts-ignore
  AdminCreateUserCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

// @ts-ignore
const { createCoreController } = require('@strapi/strapi').factories;

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
      const country = await strapi.entityService.findOne('api::country.country', data.country, {
        fields: ['countryCode'],
      });
  
      if (!country || !country.countryCode) {
        return ctx.badRequest('Invalid or missing country');
      }
  
      const formattedPhoneNumber = `${country.countryCode}${data.mobileNumber}`;
  
      let cognitoId = null;
  
      // If not facilitator, add to Cognito
      if (!data.isFacilitator) {
        const command = new AdminCreateUserCommand({
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          Username: data.officialEmailAddress,
          TemporaryPassword: 'Temp@123',
          DesiredDeliveryMediums: ['EMAIL'],
          UserAttributes: [
            { Name: 'email', Value: data.officialEmailAddress },
            { Name: 'phone_number', Value: formattedPhoneNumber },
            { Name: 'email_verified', Value: 'true' },
          ],
        });
  
        const response = await client.send(command);
        cognitoId =  response.User.Username;
      }
  
      const createdDelegate = await strapi.entityService.create('api::delegate.delegate', {
        data: {
          ...data,
          cognitoId,
        },
        populate: {
          country: { fields: ['country', 'countryCode'] },
          sector: { fields: ['name'] },
        },
      });
  
      return createdDelegate;
    } catch (error) {
      if (error.name === 'UsernameExistsException') {
        return ctx.conflict('Delegate already exists in Cognito');
      }
      console.error('Delegate creation error:', error);
      return ctx.internalServerError('Failed to create Delegate');
    }
  },  

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    if (!id || typeof id !== 'string') {
      return ctx.badRequest('Invalid ID');
    }

    try {
      const existing = await strapi.entityService.findOne('api::delegate.delegate', id);
      if (!existing) {
        return ctx.notFound('Delegate not found');
      }

      await strapi.entityService.update('api::delegate.delegate', id, {
        data: {
          ...data,
        },
      });

      const updated = await strapi.entityService.findOne('api::delegate.delegate', id);
      return updated;

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
}));
