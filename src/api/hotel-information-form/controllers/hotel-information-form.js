'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const sendEmail = require('../../../utils/email');

module.exports = createCoreController('api::hotel-information-form.hotel-information-form', ({ strapi }) => ({
  async create(ctx) {
    // Step 1: Let Strapi create the entry
    const response = await super.create(ctx);
    const email = ctx.request.body.data?.officialEmailAddress || '';
    const firstName = ctx.request.body.data?.firstName || '';
    const middleName = ctx.request.body.data?.middleName || '';
    const lastName = ctx.request.body.data?.lastName || '';
   
    try {
     await sendEmail({
       to: email,
       subject: 'Thank You for Submitting Your Hotel Information for GFF2025',
       templateName: 'hotel-information-form',
       replacements: { firstName, middleName, lastName },
     });

      strapi.log.info(`Confirmation email sent to ${email}`);
    } catch (err) {
      strapi.log.error('Failed to send email:', err);
    }

    return response;
  }
}));