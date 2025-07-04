'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const sendEmail = require('../../../utils/email');

module.exports = createCoreController('api::new-product-launch-form.new-product-launch-form', ({ strapi }) => ({
  async create(ctx) {
    // Step 1: Let Strapi create the entry
    const response = await super.create(ctx);
    const email = ctx.request.body.data?.officialEmailAddress || '';
    const name = ctx.request.body.data?.name || '';
    // const lastName = ctx.request.body.data?.lastName || '';
    // Step 2: Send email using SES
    // try {
    //  console.log(email);
    //  await sendEmail({
    //    to: email,
    //    subject: 'Thank You for your interest to book your stay for GFF 2025!',
    //    templateName: 'plan-your-stay-form',
    //    replacements: { firstName, lastName },
    //  });

    //   strapi.log.info(`Confirmation email sent to ${email}`);
    // } catch (err) {
    //   strapi.log.error('Failed to send email:', err);
    // }

    return response;
  }
}));