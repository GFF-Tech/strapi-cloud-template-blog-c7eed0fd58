'use strict';

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    if (typeof data.isActive === 'undefined') {
      data.isActive = true;
    }
  },

  async afterCreate(event) {
    // const { result } = event;

    // if (result && result.id && !result.cognitoId) {
    //   const newCognitoId = `cognitoId${result.id}`;

    //   await strapi.db.entityManager.update('api::facilitator.facilitator', {
    //     where: { id: result.id },
    //     data: { cognitoId: newCognitoId },
    //   });
    // }
  }
};
