'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const sendEmail = require('../../../utils/email');

module.exports = createCoreController('api::new-product-launch-form.new-product-launch-form', ({ strapi }) => ({
  async create(ctx) {
    // Step 1: Let Strapi create the entry
    const response = await super.create(ctx);
    const email = ctx.request.body.data?.officialEmailAddress || '';
    const name = ctx.request.body.data?.name || '';
   
    try {
       await sendEmail({
       to: email,
       subject: 'Thank You for Your Product Launch Proposal ',
       templateName: 'new-product-launch-form',
       replacements: { name },
     });

      strapi.log.info(`Confirmation email sent to ${email}`);
    } catch (err) {
      strapi.log.error('Failed to send email:', err);
    }

    return response;
  }
}));