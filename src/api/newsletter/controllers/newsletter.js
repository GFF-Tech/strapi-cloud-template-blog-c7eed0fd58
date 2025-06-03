'use strict';

/**
 * newsletter controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const sendEmail = require('../../../utils/email');

module.exports = createCoreController('api::newsletter.newsletter', ({ strapi }) => ({
  async create(ctx) {
    // Step 1: Let Strapi create the entry
    const response = await super.create(ctx);
    const email = ctx.request.body.data?.email || '';
    // Step 2: Send email using SES
    try {
    //  console.log(email);
      await sendEmail({
        to: email,
        subject: 'Thank You for Subscribing to GFF Updates!',
        templateName: 'newsletter',
        replacements: {  },
      });

      // strapi.log.info(`Confirmation email sent to ${email}`);
    } catch (err) {
      strapi.log.error('Failed to send email:', err);
    }

    return response;
  }
}));
