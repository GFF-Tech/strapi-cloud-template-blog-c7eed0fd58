'use strict';

/**
 * confirmed-speaker controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::confirmed-speaker.confirmed-speaker', ({ strapi }) => ({
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

    // Array to collect uploaded file IDs
    const uploadedFiles = {};

    // Upload profilePhoto if provided
    if (files?.profilePhoto) {
      const uploadedProfilePhoto = await strapi
        .plugin('upload')
        .service('upload')
        .upload({
          data: {}, // metadata
          files: files.profilePhoto,
        });
      // Uploaded returns array, get first id
      if (uploadedProfilePhoto.length > 0) {
        const profileFile = uploadedProfilePhoto[0];
        uploadedFiles.profilePhoto = profileFile.id;

        // ✅ Keep profilePhoto as is
        data.profilePhoto = profileFile.id;

        // ✅ NEW: store file URL in plain text field
        // data.profilePhotoUrl = `${baseUrl}${profileFile.url}`;
        data.profilePhotoUrl = profileFile.url;
      }
    }

    // Upload biodata if provided
    if (files?.biodata) {
      const uploadedbiodata = await strapi
        .plugin('upload')
        .service('upload')
        .upload({
          data: {},
          files: files.biodata,
        });
      if (uploadedbiodata.length > 0) {
        const biodataFile = uploadedbiodata[0];
        uploadedFiles.biodata = biodataFile.id;

        // ✅ Keep biodata as is
        data.biodata = biodataFile.id;

        // ✅ NEW: store file URL in plain text field
        // data.biodataUrl = `${baseUrl}${biodataFile.url}`;
         data.biodataUrl = biodataFile.url;
      }
    }

    // Attach uploaded media IDs to the data object before creating
    if (uploadedFiles.profilePhoto) {
      data.profilePhoto = uploadedFiles.profilePhoto;
    }
    if (uploadedFiles.biodata) {
      data.biodata = uploadedFiles.biodata;
    }

    // Now create the actual entry with media IDs
    const entry = await strapi.entityService.create('api::confirmed-speaker.confirmed-speaker', {
      data,
    });

    const sanitizedEntry = await this.sanitizeOutput(entry, ctx);
    return this.transformResponse(sanitizedEntry);
  },
}));
