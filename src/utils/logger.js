// src/utils/logger.js

module.exports = async function log({ logType, message, details, origin, additionalInfo }) {
  try {
    if (!logType || !['Success', 'Error'].includes(logType)) {
      throw new Error(`Invalid logType: must be 'Success' or 'Error'`);
    }

    await strapi.entityService.create('api::log.log', {
      data: {
        logType,
        message,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        origin,
        additionalInfo,
      },
    });
  } catch (logErr) {
    strapi.log.error('Failed to write custom log entry:', logErr);
  }
};
