'use strict';

module.exports = async (policyContext, config, { strapi }) => {

  const token = policyContext.request.headers['x-api-token'];
  const expectedToken = process.env.API_ACCESS_TOKEN;

  if (!token || token !== expectedToken) {
    return false;
  }

  return true;
}
