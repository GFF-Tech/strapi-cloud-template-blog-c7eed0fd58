module.exports = () => ({
  "strapi-csv-import-export": {
    config: {
      authorizedExports: [
        "api::become-a-speaker.become-a-speaker",
        "api::express-interest.express-interest",
        "api::early-stage-pitch.early-stage-pitch",
        "api::newsletter.newsletter",
        "api::confirmed-speaker.confirmed-speaker",
        "api::hotel-information-form.hotel-information-form",
        "api::plan-your-stay.plan-your-stay"
      ],
      // authorizedImports: ["api::become-a-speaker.become-a-speaker"]
      seo: {
        enabled: true,
      },
      graphql: {
        enabled: true,
        config: {
          endpoint: '/graphql',
          shadowCRUD: true,
          playgroundAlways: true,
          depthLimit: 7,
          amountLimit: 100,
        },
      },
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
