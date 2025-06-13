module.exports = () => ({
  "strapi-csv-import-export": {
          config: {
            authorizedExports: [
              "api::become-a-speaker.become-a-speaker",
              "api::express-interest.express-interest",
              "api::early-stage-pitch.early-stage-pitch",
              "api::newsletter.newsletter"
            ],
            // authorizedImports: ["api::become-a-speaker.become-a-speaker"]
  }
},
  upload: {
    config: {
      providerOptions: {
        allowedTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp', // ✅ allow .webp
          'image/svg+xml',
        ],
        optimization: false,
      },
    },
  },
});
