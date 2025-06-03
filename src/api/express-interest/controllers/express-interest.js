'use strict';

/**
 * express-interest controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const sendEmail = require('../../../utils/email');

module.exports = createCoreController('api::express-interest.express-interest', ({ strapi }) => ({
  async create(ctx) {
    // Step 1: Let Strapi create the entry
    const response = await super.create(ctx);
    const email = ctx.request.body.data?.email || '';
    const firstName = ctx.request.body.data?.firstName || '';
    const lastName = ctx.request.body.data?.lastName || '';
    // Step 2: Send email using SES
    try {
    //  console.log(email);
    //  await sendEmail({
    //    to: email,
    //    subject: 'Thank You for Expressing Your Interest in GFF 2025! ',
    //    templateName: 'express-interest',
    //    replacements: { firstName, lastName },
     // });

      // strapi.log.info(`Confirmation email sent to ${email}`);
    } catch (err) {
      strapi.log.error('Failed to send email:', err);
    }

    return response;
  }
}));
