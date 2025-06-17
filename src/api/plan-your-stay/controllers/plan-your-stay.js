'use strict';
const { createCoreController } = require('@strapi/strapi').factories;
const sendEmail = require('../../../utils/email');

module.exports = createCoreController('api::plan-your-stay.plan-your-stay', ({ strapi }) => ({
  async create(ctx) {
    // Step 1: Let Strapi create the entry
    const response = await super.create(ctx);
    const email = ctx.request.body.data?.businessEmailAddress || '';
    const firstName = ctx.request.body.data?.firstName || '';
    const lastName = ctx.request.body.data?.lastName || '';
    // Step 2: Send email using SES
    // try {
    //  console.log(email);
    //  await sendEmail({
    //    to: email,
    //    subject: 'Thank You for Registering as a Speaker for GFF 2025 ',
    //    templateName: 'become-a-speaker',
    //    replacements: { firstName, lastName },
    //  });

    //   strapi.log.info(`Confirmation email sent to ${email}`);
    // } catch (err) {
    //   strapi.log.error('Failed to send email:', err);
    // }

    return response;
  }
}));
