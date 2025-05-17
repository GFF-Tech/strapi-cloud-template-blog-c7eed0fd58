'use strict';
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::become-a-speaker.become-a-speaker', ({ strapi }) => ({
  async create(ctx) {
    const { files, body } = ctx.request;

    let data;
    try {
      data = JSON.parse(body.data);
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
        uploadedFiles.profilePhoto = uploadedProfilePhoto[0].id;
      }
    }

    // Upload bioProfile if provided
    if (files?.bioProfile) {
      const uploadedBioProfile = await strapi
        .plugin('upload')
        .service('upload')
        .upload({
          data: {}, 
          files: files.bioProfile,
        });
      if (uploadedBioProfile.length > 0) {
        uploadedFiles.bioProfile = uploadedBioProfile[0].id;
      }
    }

    // Attach uploaded media IDs to the data object before creating
    if (uploadedFiles.profilePhoto) {
      data.profilePhoto = uploadedFiles.profilePhoto;
    }
    if (uploadedFiles.bioProfile) {
      data.bioProfile = uploadedFiles.bioProfile;
    }

    // Now create the actual entry with media IDs
    const entry = await strapi.entityService.create('api::become-a-speaker.become-a-speaker', {
      data,
    });

    const sanitizedEntry = await this.sanitizeOutput(entry, ctx);
    return this.transformResponse(sanitizedEntry);
  },
}));
