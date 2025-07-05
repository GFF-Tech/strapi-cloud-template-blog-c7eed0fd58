'use strict';

/**
 * thought-leadership-report-form controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const sendEmail = require('../../../utils/email');

module.exports = createCoreController('api::thought-leadership-report-form.thought-leadership-report-form', ({ strapi }) => ({
  async create(ctx) {
    // const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
    const { files, body } = ctx.request;

    let data;
    try {
      console.log('body.data = ', body.data);
      data = JSON.parse(body.data);
      console.log('data = ', data);
    } catch (err) {
      return ctx.badRequest('Invalid JSON in `data` field');
    }

    const uploadedFiles = {};

     if (files?.finalDocument) {
      const uploadedFinalDocument = await strapi
        .plugin('upload')
        .service('upload')
        .upload({
          data: {}, // metadata
          files: files.finalDocument,
        });
      if (uploadedFinalDocument.length > 0) {
        const finalDocument = uploadedFinalDocument[0];
        uploadedFiles.finalDocument = finalDocument.id;

        data.finalDocument = finalDocument.id;

        data.finalDocumentUrl = finalDocument.url;
      }
    }

    if (uploadedFiles.finalDocument) {
      data.finalDocument = uploadedFiles.finalDocument;
    }

   const entry = await strapi.entityService.create('api::thought-leadership-report-form.thought-leadership-report-form', {
      data,
    });

     const email = data?.officialEmailAddress || '';
    const name = data?.name || '';
    // const lastName = data?.lastName || '';
    // Step 2: Send email using SES
    // try {
    //  console.log(email);
    //  await sendEmail({
    //    to: email,
    //    subject: 'Thank You for your interest to book your stay for GFF 2025!',
    //    templateName: 'plan-your-stay-form',
    //    replacements: { name },
    //  });

    //   strapi.log.info(`Confirmation email sent to ${email}`);
    // } catch (err) {
    //   strapi.log.error('Failed to send email:', err);
    // }

    const sanitizedEntry = await this.sanitizeOutput(entry, ctx);
    return this.transformResponse(sanitizedEntry);
  },
}));