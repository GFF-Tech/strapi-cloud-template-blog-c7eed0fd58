'use strict';

/**
 * delegate controller
 */

// @ts-ignore
const {
  // @ts-ignore
  CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, ListUsersCommand,
  // @ts-ignore
  InitiateAuthCommand, RespondToAuthChallengeCommand, AdminUpdateUserAttributesCommand, AdminGetUserCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const facilitator = require('../../facilitator/controllers/facilitator');
const { uploadQRToStrapi } = require('../../../utils/qr');

// @ts-ignore
const { createCoreController } = require('@strapi/strapi').factories;
const sendEmail = require('../../../utils/email');
const log = require('../../../utils/logger');
const { updateSalesforceParticipant } = require('../../../utils/salesforce');

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

module.exports = createCoreController('api::delegate.delegate', ({ strapi }) => ({
  async find(ctx) {
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    try {
      const result = await strapi.entityService.findOne('api::delegate.delegate', id);

      if (!result) {
        return ctx.notFound('Delegate not found');
      }

      return result;
    } catch (error) {
      console.log(error);
      return ctx.internalServerError('An error occurred while retrieving the delegate');
    }
  },

  async create(ctx) {
    const { data } = ctx.request.body;

    try {
      // 1. Extract passType from wcProductName (e.g. "Gold Pass 1" => "Gold")
      const passType = data.wcProductName.split(' ')[0];

      // 2. Find all delegates with same facilitatorId and passType
      const delegates = await strapi.entityService.findMany('api::delegate.delegate', {
        filters: {
          facilitatorId: data.facilitatorId,
          passType,
        },
      });

      // 3. Find first delegate with any empty required field
      let delegateToUpdate = null;
      console.log('Delegates found:', delegates.length);
      for (const d of delegates) {
        console.log({
          id: d.id,
          cognitoId: d.cognitoId,
          wcProductId: d.wcProductId,
          wcProductName: d.wcProductName,
          isFacilitator: d.isFacilitator,
          country: d.country,
        });
      }
      for (const d of delegates) {
        const hasMissingFields =
          !d.wcProductId ||
          !d.wcProductName ||
          typeof d.isFacilitator !== 'boolean';
        (d.isFacilitator === false && !d.cognitoId);

        if (hasMissingFields) {
          delegateToUpdate = d;
          break;
        }
      }

      if (!delegateToUpdate) {
        // If none empty, return error (FE should prevent this)
        return ctx.conflict(`No available delegate slot for pass type: ${passType}`);
      }

      const updatedFields = {};

      // 4. Fill fields only if empty
      if (!delegateToUpdate.wcProductId) updatedFields.wcProductId = data.wcProductId;
      if (!delegateToUpdate.wcProductName) updatedFields.wcProductName = data.wcProductName;
      if (!delegateToUpdate.isFacilitator) updatedFields.isFacilitator = data.isFacilitator || false;
      if (!delegateToUpdate.country) updatedFields.country = data.country;
      if (!delegateToUpdate.pciFccMember) updatedFields.pciFccMember = data.pciFccMember;
      if (!delegateToUpdate.registerAsIndividual) updatedFields.registerAsIndividual = data.registerAsIndividual;
      if (!delegateToUpdate.sector) updatedFields.sector = data.sector || null;

      // 5. Create Cognito user if not facilitator and cognitoId missing
      let cognitoId = delegateToUpdate.cognitoId;
      if (!data.isFacilitator && !cognitoId) {
        const country = await strapi.entityService.findOne('api::country.country', data.country, {
          fields: ['country', 'countryCode'],
        });

        if (!country || !country.countryCode) {
          return ctx.badRequest('Invalid or missing country');
        }

        const formattedPhone = `${country.countryCode}${data.mobileNumber}`;

        try {
          const createCommand = new AdminCreateUserCommand({
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: data.officialEmailAddress,
            TemporaryPassword: 'Temp@123',
            MessageAction: 'SUPPRESS',
            DesiredDeliveryMediums: ['EMAIL'],
            UserAttributes: [
              { Name: 'email', Value: data.officialEmailAddress },
              { Name: 'phone_number', Value: formattedPhone },
              { Name: 'email_verified', Value: 'true' },
              { Name: 'custom:firstName', Value: data.firstName },
              { Name: 'custom:lastName', Value: data.lastName },
              { Name: 'custom:delegate', Value: 'true' },
              ...(data.companyName ? [{ Name: 'custom:companyName', Value: data.companyName }] : []),
            ],
          });

          const response = await client.send(createCommand);
          cognitoId = response.User.Username;

          // Set permanent password
          const passwordCommand = new AdminSetUserPasswordCommand({
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: data.officialEmailAddress,
            Password: 'Temp@123',
            Permanent: true,
          });

          await client.send(passwordCommand);
        } catch (error) {
          await log({
            logType: 'Error',
            message: 'Delegate Cognito user creation failed',
            origin: 'delegate.create',
            additionalInfo: {
              email: data.officialEmailAddress,
              errorMessage: error?.message || '',
              stack: error?.stack || ''
            },
            userType: 'Delegate',
            referenceId: null,
            cognitoId: ''
          });
          if (error.name === 'UsernameExistsException') {
            return ctx.conflict('Delegate already exists in Cognito');
          }
          throw error;
        }
      }

      if(data.isFacilitator){
           const facilitator = await strapi.entityService.findOne('api::facilitator.facilitator',
        data.facilitatorId
      );
      cognitoId = facilitator?.cognitoId;
      }

      updatedFields.cognitoId = cognitoId;

      // 6. Update delegate entry
      const updatedDelegate = await strapi.entityService.update(
        'api::delegate.delegate',
        delegateToUpdate.id,
        {
          data: updatedFields,
        }
      );

      const qrFile = await uploadQRToStrapi(updatedDelegate.cognitoId);

       const updatedDelegateQrCode = await strapi.entityService.update('api::delegate.delegate', updatedDelegate.id, {
      data: { qrCode: qrFile.id },
    });

      // 8. Fetch full delegate record with relations
      const fullDelegate = await strapi.entityService.findOne('api::delegate.delegate', updatedDelegate.id, {
        populate: {
          qrCode: true,
          country: { fields: ['country', 'countryCode'] },
          sector: { fields: ['name'] },
        },
      });

      // 9. Send verification email
      const firstName = data.firstName;
      const lastName = data.lastName;
      const email = data.officialEmailAddress;
      const passTypeForEmail = passType;

      try {
        await sendEmail({
          to: email,
          subject: 'Your Delegate Registration is Confirmed - Welcome to GFF 2025!',
          templateName: 'delegate-confirmation',
          replacements: { firstName, lastName },
        });
      } catch (err) {
        strapi.log.error('Failed to Send Delegate Invite Email:', err);
        await log({
          logType: 'Error',
          message: 'Failed to Send Delegate Invite Email',
          origin: 'delegate.create',
          additionalInfo: {
            errorMessage: err?.message || '',
            stack: err?.stack || ''
          },
          userType: 'Delegate',
          referenceId: fullDelegate.id || '',
          cognitoId: fullDelegate.cognitoId || ''
        });
      }


      const salesforcePayload = {
        upgrade: 'false',
        email: data.officialEmailAddress,
        mobilePhone: `${fullDelegate.country.countryCode}${data.mobileNumber}`,
        participantFirstName: data.firstName,
        participantLastName: data.lastName,
        company: data.companyName || 'INDIVIDUAL',
        vertical: '',
        level: '',
        GenderIdentity: '',
        title: '',
        linkdinProfile: fullDelegate.linkedinUrl || '',
        twitterProfile: '',
        instagramProfile: '',
        personalEmail: '',
        confirmationId: fullDelegate.confirmationId,
        passType: passType,
        price: fullDelegate.passPrice,
        salutation: '',
        marketServedByCompany: '',
        shortBio: '',
        participantCategory: '',
        participationObjective: '',
        eventYearsAttendedBefore: '',
        city: '',
        country: '',
        networkingGoals: '',
        languageSpoken: '',
        preferredTracks: '',
        interestAreas: ''
      };

      try {
        await updateSalesforceParticipant(salesforcePayload);
        await log({
          logType: 'Success',
          message: 'Salesforce update success for delegate',
          origin: 'delegate.create',
          additionalInfo: { confirmationId: fullDelegate.confirmationId },
          userType: 'Delegate',
          referenceId: fullDelegate.id || '',
          cognitoId: fullDelegate.cognitoId || ''
        });

        strapi.log.info(`Salesforce updated for delegate ${fullDelegate.confirmationId}`);
      } catch (error) {
        strapi.log.error('Salesforce update failed:', error.message || error);
        await log({
          logType: 'Error',
          message: 'Salesforce update failed for delegate',
          origin: 'delegate.create',
          additionalInfo: {
            confirmationId: fullDelegate?.confirmationId || '',
            errorMessage: error?.message || '',
            stack: error?.stack || ''
          },
          userType: 'Delegate',
          referenceId: fullDelegate.id || '',
          cognitoId: fullDelegate.cognitoId || ''
        });
      }

      // 10. Return updated delegate with extra info
      return {
        ...fullDelegate,
        confirmationId: fullDelegate.confirmationId,
        firstName: data.firstName,
        lastName: data.lastName,
        officialEmailAddress: data.officialEmailAddress,
        mobileNumber: data.mobileNumber,
        companyName: data.companyName || null,
      };

    } catch (error) {
      console.error('Delegate creation failed:', error);
      await log({
        logType: 'Error',
        message: 'Unexpected error in delegate.create',
        origin: 'delegate.create',
        additionalInfo: {
          email: data.officialEmailAddress || '',
          errorMessage: error?.message || '',
          stack: error?.stack || ''
        },
        userType: 'Delegate',
        referenceId: null,
        cognitoId: ''
      });
      return ctx.internalServerError('Failed to create delegate');
    }
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    if (!id || typeof id !== 'string') {
      return ctx.badRequest('Invalid ID');
    }

    try {
      let existing = await strapi.entityService.findOne('api::delegate.delegate', id, {
        populate: {
          country: { fields: ['country', 'countryCode'] },
          sector: { fields: ['name'] },
          facilitatorId: { fields: ['id', 'cognitoId'] }, // include facilitator data
        },
      });

      console.log(existing);

      if (!existing) {
        return ctx.notFound('Delegate not found');
      }

      // If cognitoId is missing and delegate isFacilitator
      if (!existing.cognitoId && existing.isFacilitator && existing.facilitatorId?.cognitoId) {
        existing.cognitoId = existing.facilitatorId.cognitoId;

        // Optionally update delegate with this cognitoId
        await strapi.entityService.update('api::delegate.delegate', id, {
          data: { cognitoId: existing.cognitoId },
        });
      }

      if (!existing.cognitoId) {
        return ctx.badRequest('Cognito ID is missing for delegate');
      }

      // Update in Cognito
      const updateCommand = new AdminUpdateUserAttributesCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: existing.cognitoId,
        UserAttributes: [
          { Name: 'custom:firstName', Value: data.firstName },
          { Name: 'custom:lastName', Value: data.lastName },
        ],
      });

      await client.send(updateCommand);
      await log({
        logType: 'Success',
        origin: 'delegate.update',
        message: 'Cognito user attributes updated',
        additionalInfo: {},
        userType: 'Delegate',
        referenceId: existing.id || '',
        cognitoId: existing.cognitoId || ''
      });

      const cognitoUser = await getCognitoUserBySub(existing.cognitoId);
      const email = cognitoUser?.email || '';
      const mobilePhone = cognitoUser?.phone_number || '';
      const companyName = cognitoUser?.companyName || '';

      const salesforcePayload = {
        upgrade: 'true',
        email: email,
        mobilePhone: mobilePhone,
        participantFirstName: data.firstName,
        participantLastName: data.lastName,
        company: companyName || 'INDIVIDUAL',
        vertical: '',
        level: '',
        GenderIdentity: '',
        title: '',
        linkdinProfile: existing.linkedinUrl || '',
        twitterProfile: '',
        instagramProfile: '',
        personalEmail: '',
        confirmationId: existing.confirmationId,
        passType: existing.passType,
        price: existing.passPrice,
        salutation: '',
        marketServedByCompany: '',
        shortBio: '',
        participantCategory: '',
        participationObjective: '',
        eventYearsAttendedBefore: '',
        city: '',
        country: '',
        networkingGoals: '',
        languageSpoken: '',
        preferredTracks: '',
        interestAreas: ''
      };

      console.log("salesforcePayload = ", salesforcePayload);

      try {
        await updateSalesforceParticipant(salesforcePayload);
        strapi.log.info(`Salesforce updated for delegate ${existing.confirmationId}`);
        await log({
          logType: 'Success',
          origin: 'delegate.update',
          message: 'Delegate Salesforce update success',
          additionalInfo: { confirmationId: existing.confirmationId },
          userType: 'Delegate',
          referenceId: existing.id || '',
          cognitoId: existing.cognitoId || ''
        });
      } catch (error) {
        strapi.log.error('Salesforce update failed:', error.message || error);
        await log({
          logType: 'Error',
          origin: 'delegate.update',
          message: 'Delegate Salesforce update failed',
          additionalInfo: {
            confirmationId: existing?.confirmationId || '',
            errorMessage: error?.message || '',
            stack: error?.stack || ''
          },
          userType: 'Delegate',
          referenceId: existing.id || '',
          cognitoId: existing.cognitoId || ''
        });
      }

      return { message: 'Delegate name updated in Cognito successfully' };

    } catch (error) {
      console.error('Update error:', error);
      await log({
        logType: 'Error',
        origin: 'delegate.update',
        message: 'Unexpected error during delegate update',
        additionalInfo: {
          errorMessage: error?.message || '',
          stack: error?.stack || ''
        },
        userType: 'Delegate',
        referenceId: null,
        cognitoId: ''
      });
      return ctx.internalServerError('An error occurred while updating the delegate');
    }
  },

  async delete(ctx) {
    const { id } = ctx.params;

    const deletedDelegate = await strapi.entityService.delete('api::delegate.delegate', id);

    if (!deletedDelegate) {
      return ctx.notFound('Delegate not found');
    }

    return { message: 'Delegate deleted successfully' };
  },

  async login(ctx) {
    const { officialEmailAddress } = ctx.request.body;

    if (!officialEmailAddress) {
      return ctx.badRequest('Missing email');
    }

    try {
      // 1. Start Cognito Auth flow
      const command = new InitiateAuthCommand({
        AuthFlow: 'CUSTOM_AUTH',
        ClientId: process.env.COGNITO_CLIENT_ID,
        AuthParameters: {
          USERNAME: officialEmailAddress,
        },
      });

      const response = await client.send(command);

      // 2. Get Cognito User and Cognito ID
      const getUserCommand = new AdminGetUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: officialEmailAddress,
      });

      const user = await client.send(getUserCommand);
      const cognitoId = user?.UserAttributes?.find(attr => attr.Name === 'sub')?.Value;

      if (!cognitoId) {
        await log({
          logType: 'Error',
          origin: 'delegate.login',
          message: 'User not found in Cognito',
          additionalInfo: { officialEmailAddress },
          userType: 'Delegate',
          referenceId: null,
          cognitoId: ''
        });
        return ctx.notFound('User not found in Cognito');
      }

      // 3. Check if delegate already has this Cognito ID
      const existingDelegate = await strapi.db.query('api::delegate.delegate').findOne({
        where: { cognitoId },
      });

      if (!existingDelegate) {
        // 4. Try finding facilitator with this Cognito ID
        const facilitator = await strapi.db.query('api::facilitator.facilitator').findOne({
          where: { cognitoId },
        });

        if (facilitator) {
          // 5. Look for corresponding delegate with isFacilitator = true, cognitoId = null
          const orphanDelegate = await strapi.db.query('api::delegate.delegate').findOne({
            where: {
              facilitatorId: facilitator.id,
              isFacilitator: true,
              cognitoId: null,
            },
          });

          if (orphanDelegate) {
            // 6. Patch cognitoId into the orphan delegate
            await strapi.entityService.update('api::delegate.delegate', orphanDelegate.id, {
              data: { cognitoId },
            });

            strapi.log.info(`Patched cognitoId into delegate ${orphanDelegate.id}`);
          } else {
            const msg = `Facilitator found for Cognito ID ${cognitoId}, but no delegate entry to update`;
            strapi.log.warn(msg);
            await log({
              logType: 'Error',
              origin: 'delegate.login',
              message: msg,
              additionalInfo: { facilitatorId: facilitator.id },
              userType: 'Delegate',
              referenceId: null,
              cognitoId: cognitoId || ''
            });
            strapi.log.warn(
              `Facilitator found for Cognito ID ${cognitoId}, but no delegate entry to update`
            );
          }
        } else {
          await log({
            logType: 'Error',
            origin: 'delegate.login',
            message: 'Delegate or Facilitator not found',
            additionalInfo: {},
            userType: 'Delegate',
            referenceId: null,
            cognitoId: cognitoId || ''
          });
          return ctx.notFound('Delegate or Facilitator not found');
        }
      }

      // 7. Return OTP challenge session
      return ctx.send({
        message: 'OTP sent to email',
        session: response.Session,
      });

    } catch (error) {
      console.error('Login error:', error);
      await log({
        logType: 'Error',
        origin: 'delegate.login',
        message: 'Login failed',
        additionalInfo: {
          error: error.message || String(error),
        },
        userType: 'Delegate',
        referenceId: null,
        cognitoId: ''
      });
      return ctx.internalServerError('Failed to process login');
    }
  },

  async verifyLoginOtp(ctx) {
    const { officialEmailAddress, otp, session } = ctx.request.body;

    if (!officialEmailAddress || !otp || !session) {
      return ctx.badRequest('Missing data');
    }

    try {
      const command = new RespondToAuthChallengeCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        ChallengeName: 'CUSTOM_CHALLENGE',
        Session: session,
        ChallengeResponses: {
          USERNAME: officialEmailAddress,
          ANSWER: otp,
        },
      });

      const response = await client.send(command);

      if (!response.AuthenticationResult) {
        return ctx.unauthorized('Authentication failed');
      }

      // Get user info from Cognito
      const getUserCommand = new AdminGetUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: officialEmailAddress,
      });

      const user = await client.send(getUserCommand);
      const attributes = user.UserAttributes;

      const getAttr = (name) => attributes.find((attr) => attr.Name === name)?.Value;

      const cognitoId = getAttr('sub');
      const email = getAttr('email');
      const phone = getAttr('phone_number');
      const firstName = getAttr('custom:firstName');
      const lastName = getAttr('custom:lastName');
      const companyName = getAttr('custom:companyName') || null;

      if (!cognitoId) {
        return ctx.notFound('Cognito user ID not found');
      }

      // Find delegate in Strapi using Cognito ID
      const delegate = await strapi.db.query('api::delegate.delegate').findOne({
        where: { cognitoId },
        
        populate: {
          qrCode: true,
          sector: true,
          country: true,
        },
      });

      if (!delegate) {
        return ctx.notFound('Delegate not found');
      }

      // Strip country code from mobile number
      const countryCode = delegate.country?.countryCode || '';
      const mobileNumber = phone?.startsWith(countryCode)
        ? phone.slice(countryCode.length)
        : phone;

      return ctx.send({
        message: 'Login successful',
        idToken: response.AuthenticationResult?.IdToken,
        accessToken: response.AuthenticationResult?.AccessToken,
        refreshToken: response.AuthenticationResult?.RefreshToken,
        data: {
          cognitoId,
          officialEmailAddress: email,
          firstName,
          lastName,
          companyName,
          mobileNumber,
          ...delegate,
        },
      });

    } catch (error) {
      console.error('OTP verification failed:', error);
      await log({
        logType: 'Error',
        origin: 'delegate.verifyLoginOtp',
        message: 'OTP verification failed',
        additionalInfo: {
          officialEmailAddress,
          error: error.message || String(error),
        },
        userType: 'Delegate',
        referenceId: null,
        cognitoId: ''
      });
      return ctx.internalServerError('An unexpected error occurred');
    }
  },

  async resendInviteMail(ctx) {

    const data = ctx.request.body?.data || {};
    const officialEmailAddress = data.officialEmailAddress || '';
    const firstName = data.firstName || '';
    const lastName = data.lastName || '';
    try {

      if (!officialEmailAddress || !firstName || !lastName) {
        return ctx.badRequest('Missing required fields');
      }

      await sendEmail({
        to: officialEmailAddress,
        subject: 'Your Delegate Registration is Confirmed - Welcome to GFF 2025!',
        templateName: 'delegate-confirmation',
        replacements: { firstName, lastName },
      });

      ctx.send({ message: 'Invitation email resent successfully.' });
    } catch (error) {
      strapi.log.error('Failed to resend invite mail:', error);
      await log({
        logType: 'Error',
        message: 'Failed to resend invite mail',
        origin: 'delegate.resendInviteMail',
        additionalInfo: {
          email: data?.officialEmailAddress,
          errorMessage: error?.message || '',
          stack: error?.stack || '',
        },
        userType: 'Delegate',
        referenceId: null,
        cognitoId: '',
      });
      ctx.internalServerError('Failed to resend invite mail');
    }
  },

  async getQRCode(ctx) {
    const { id } = ctx.params;
    const delegate = await strapi.entityService.findOne('api::delegate.delegate', id, {
      populate: ['qrCode'],
    });

    if (!delegate) return ctx.notFound('Delegate not found');

    // ✅ Return existing QR code
    if (delegate.qrCode && delegate.qrCode.url) {
      return ctx.send({ qrCode: delegate.qrCode });
    }

    if (!delegate.cognitoId) {
      return ctx.badRequest('Missing cognitoId for QR generation');
    }

    const qrFile = await uploadQRToStrapi(delegate.cognitoId);

    const updatedDelegate = await strapi.entityService.update('api::delegate.delegate', id, {
      data: { qrCode: qrFile.id },
      populate: ['qrCode'],
    });

    return ctx.send({ qrCode: updatedDelegate.qrCode });

  },

  async getDelegatesByCognitoId(ctx) {
    const { cognitoId } = ctx.params;

    if (!cognitoId) {
      return ctx.notFound('CognitoId not present');
    }

    const delegates = await strapi.db.query('api::delegate.delegate').findOne({
      where: { cognitoId },
      populate: {
        country: { fields: ['country', 'countryCode'] },
        sector: { fields: ['name'] },
      },
    });

    if (!delegates) {
      return ctx.notFound('Delegate not found');
    }

    const cognitoResponse = await client.send(
      new AdminGetUserCommand({
        Username: cognitoId,
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
      })
    );

    const attributes = cognitoResponse.UserAttributes || [];

    const getAttr = (key) => attributes.find((a) => a.Name === key)?.Value || '';

    const firstName = getAttr('custom:firstName');
    const lastName = getAttr('custom:lastName');
    const officialEmailAddress = getAttr('email');
    const fullMobileNumber = getAttr('phone_number');
    const companyName = getAttr('custom:companyName') || '';

    let mobileNumber = fullMobileNumber;
    if (fullMobileNumber && delegates?.country?.countryCode) {
      const code = delegates.country.countryCode.replace('+', '');
      mobileNumber = fullMobileNumber.replace(`+${code}`, '');
    }

    return {
      ...delegates,
      firstName,
      lastName,
      officialEmailAddress,
      mobileNumber,
      companyName
    };

  },

}));

async function getCognitoUserBySub(sub) {
  if (!sub) return null;

  try {
    const listUsersCommand = new ListUsersCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Filter: `sub = "${sub}"`,
      Limit: 1,
    });

    const response = await client.send(listUsersCommand);

    if (!response.Users || response.Users.length === 0) return null;

    const user = response.Users[0];
    const attributes = {};
    for (const attr of user.Attributes) {
      attributes[attr.Name] = attr.Value;
    }

    return {
      sub: attributes.sub,
      email: attributes.email,
      phone_number: attributes.phone_number,
      firstName: attributes['custom:firstName'] || '',
      lastName: attributes['custom:lastName'] || '',
      companyName: attributes['custom:companyName'] || '',
    };
  } catch (err) {
    console.error('Failed to fetch Cognito user:', err);
    await log({
      logType: 'Error',
      message: 'Failed to fetch Delegate Cognito user by sub',
      origin: 'utils.getCognitoUserBySub',
      additionalInfo: { error: err.message || String(err) },
      userType: 'Delegate',
      referenceId: null,
      cognitoId: sub || ''
    });
    return null;
  }
}