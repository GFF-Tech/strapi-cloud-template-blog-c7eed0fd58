// src/utils/logger.js

module.exports = async function log({ logType, message, origin, additionalInfo, userType, referenceId, cognitoId }) {
  try {
    if (!logType || !['Success', 'Error'].includes(logType)) {
      throw new Error(`Invalid logType: must be 'Success' or 'Error'`);
    }

    await strapi.entityService.create('api::log.log', {
      data: {
        logType,
        message,
        origin,
        additionalInfo,
        userType,
        referenceId,
        cognitoId
      },
    });
  } catch (logErr) {
    strapi.log.error('Failed to write custom log entry:', logErr);
  }
};
