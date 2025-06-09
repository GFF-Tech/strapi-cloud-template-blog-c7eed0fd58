module.exports = () => ({
    'strapi-import-export': {
    enabled: true,
    config: {
      // Plugin-specific configurations
    },
  },
   'drag-drop-content-types-strapi5': {
    enabled: true,
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
