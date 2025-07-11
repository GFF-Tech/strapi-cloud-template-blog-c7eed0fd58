'use strict';

// @ts-ignore
const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios');
const crypto = require('crypto');
// @ts-ignore
const { insertIntoSalesforce, fetchInvoiceFromSalesforce, updateSalesforceParticipant } = require('../../../utils/salesforce');
const sendEmail = require('../../../utils/email');
const log = require('../../../utils/logger');

const {
  // @ts-ignore
  CognitoIdentityProviderClient, SignUpCommand, ConfirmSignUpCommand, ResendConfirmationCodeCommand,
  // @ts-ignore
  InitiateAuthCommand, RespondToAuthChallengeCommand, AdminUpdateUserAttributesCommand, AdminDeleteUserCommand, AdminGetUserCommand, ListUsersCommand
} = require('@aws-sdk/client-cognito-identity-provider');



const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

module.exports = createCoreController('api::facilitator.facilitator', ({ strapi }) => ({

  async find(ctx) {
    try {
      const entities = await strapi.entityService.findMany('api::facilitator.facilitator', {
        populate: {
          gstDetails: true,
          sector: {
            fields: ['sector'],
          },
          country: {
            fields: ['country', 'countryCode'],
          },
        },
        filters: ctx.query.filters,
        sort: ctx.query.sort,
        pagination: ctx.query.pagination,
      });

      const count = await strapi.entityService.count('api::facilitator.facilitator', {
        filters: ctx.query.filters,
      });

      return {
        data: entities,
        meta: {
          pagination: {
            total: count,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching facilitators:', error);
      return ctx.internalServerError('Failed to fetch facilitators');
    }
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    try {
      const facilitator = await strapi.db.query('api::facilitator.facilitator').findOne({
        where: { id },
        populate: {
          country: true,
          sector: true,
          wooOrderDetails: true,
          invoiceDetails: true,
          gstDetails: true,
          delegates: {
            populate: ['sector', 'country'],
          },
        },
      });

      if (!facilitator) {
        await log({
          logType: 'Error',
          message: 'Facilitator not found',
          origin: 'facilitator.findOne',
          additionalInfo: {},
          userType: 'Facilitator',
          referenceId: facilitator.id || id,
          cognitoId: facilitator.cognitoId || ''
        });
        return ctx.notFound('Facilitator not found');
      }

      // 1. Get Cognito user data for facilitator
      const userCommand = new AdminGetUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: facilitator.cognitoId,
      });

      const userResult = await client.send(userCommand);

      const attributes = {};
      userResult.UserAttributes.forEach(attr => {
        attributes[attr.Name] = attr.Value;
      });

      const cognitoId = attributes['sub'];
      const facilitatorFirstName = attributes['custom:firstName'];
      const facilitatorLastName = attributes['custom:lastName'];
      const facilitatorEmail = attributes['email'];
      const facilitatorPhone = attributes['phone_number'];
      const facilitatorCompany = attributes['custom:companyName'] || null;

      let mobileNumber = facilitatorPhone;
      if (facilitatorPhone && facilitator?.country?.countryCode) {
        const code = facilitator.country.countryCode.replace('+', '');
        mobileNumber = facilitatorPhone.replace(`+${code}`, '');
      }

      // 2. Enrich delegates
      const enrichedDelegates = [];

      for (const delegate of facilitator.delegates || []) {
        const cognitoDelegateId = delegate.cognitoId;
        let firstName = null;
        let lastName = null;
        let officialEmailAddress = null;
        let mobileNumber = null;
        let companyName = null;

        if (delegate.isFacilitator) {
          firstName = facilitatorFirstName;
          lastName = facilitatorLastName;
          officialEmailAddress = facilitatorEmail;
          companyName = facilitatorCompany;

          if (facilitatorPhone && delegate?.country?.countryCode) {
            const code = delegate.country.countryCode.replace('+', '');
            mobileNumber = facilitatorPhone.replace(`+${code}`, '');
          } else {
            mobileNumber = facilitatorPhone;
          }

        } else if (delegate.cognitoId) {
          try {
            const delegateUser = await client.send(new AdminGetUserCommand({
              UserPoolId: process.env.COGNITO_USER_POOL_ID,
              Username: delegate.cognitoId,
            }));

            const delegateAttrs = {};
            delegateUser.UserAttributes.forEach(attr => {
              delegateAttrs[attr.Name] = attr.Value;
            });

            firstName = delegateAttrs['custom:firstName'];
            lastName = delegateAttrs['custom:lastName'];
            officialEmailAddress = delegateAttrs['email'];
            mobileNumber = delegateAttrs['phone_number'];
            companyName = delegateAttrs['custom:companyName'] || null;

            if (mobileNumber && delegate?.country?.countryCode) {
              const code = delegate.country.countryCode.replace('+', '');
              mobileNumber = mobileNumber.replace(`+${code}`, '');
            }

          } catch (e) {
            console.warn(`Failed to fetch Cognito data for delegate ${delegate.cognitoId}:`, e.message);
            await log({
              logType: 'Error',
              message: 'Failed to fetch delegate Cognito data',
              origin: 'facilitator.findOne',
              additionalInfo: { delegateCognitoId: delegate.cognitoId },
              userType: 'Facilitator',
              referenceId: facilitator.id,
              cognitoId: facilitator.cognitoId
            });
          }
        }

        enrichedDelegates.push({
          ...delegate,
          firstName,
          lastName,
          officialEmailAddress,
          mobileNumber,
          companyName,
        });
      }

      // 3. Fetch WooCommerce order if present
      const mergedLineItemsMap = new Map();

      if (Array.isArray(facilitator.wooOrderDetails)) {
        for (const orderMeta of facilitator.wooOrderDetails) {
          if (orderMeta.wcOrderStatus === 'completed' && orderMeta.wcOrderId) {
            const order = await fetchWooOrder(orderMeta.wcOrderId);
            if (order && Array.isArray(order.line_items)) {
              for (const item of order.line_items) {
                const { product_id, name, quantity } = item;
                if (!product_id) continue;

                if (mergedLineItemsMap.has(product_id)) {
                  const existing = mergedLineItemsMap.get(product_id);
                  existing.quantity += quantity;
                } else {
                  mergedLineItemsMap.set(product_id, {
                    product_id,
                    name,
                    quantity,
                  });
                }
              }
            }
          }
        }
      }

      // Convert map back to array
      const mergedLineItems = Array.from(mergedLineItemsMap.values());

      // 4. Return combined data
      return ctx.send({
        data: {
          cognitoId,
          officialEmailAddress: facilitatorEmail,
          mobileNumber,
          firstName: facilitatorFirstName,
          lastName: facilitatorLastName,
          companyName: facilitatorCompany,
          ...facilitator,
          delegates: enrichedDelegates,
          wooOrderDetailsTest: {
            line_items: mergedLineItems,
          },
        },
      });

    } catch (error) {
      console.error('Find one facilitator failed:', error);
      await log({
        logType: 'Error',
        message: 'Failed to fetch facilitator',
        origin: 'facilitator.findOne',
        additionalInfo: { facilitatorId: ctx.params.id },
        userType: 'Facilitator',
        referenceId: id || '',
        cognitoId: ''
      });
      return ctx.internalServerError('Failed to fetch facilitator');
    }
  },

  async create(ctx) {
    const { data } = ctx.request.body;

    try {
      // 1. Validate country
      const country = await strapi.entityService.findOne('api::country.country', data.country, {
        fields: ['countryCode'],
      });

      if (!country || !country.countryCode) {
        return ctx.badRequest('Invalid or missing country code.');
      }

      const formattedPhoneNumber = `${country.countryCode}${data.mobileNumber}`;
      let existingCognitoId = null;

      // 2. Check if user exists in Cognito
      try {
        const userData = await client.send(new AdminGetUserCommand({
          Username: data.officialEmailAddress,
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
        }));

        const subAttr = userData.UserAttributes.find(attr => attr.Name === 'sub');
        const delegateAttr = userData.UserAttributes.find(attr => attr.Name === 'custom:delegate');

        existingCognitoId = subAttr?.Value;
        const isDelegate = delegateAttr?.Value === 'true';

        // ❌ If it's a delegate, block registration
        if (isDelegate) {
          await log({
            logType: 'Error',
            message: 'Blocked registration: email belongs to delegate',
            origin: 'facilitator.create',
            additionalInfo: {},
            userType: 'Facilitator',
            referenceId: '',
            cognitoId: existingCognitoId || ''
          });
          return ctx.forbidden('This email is associated with a participant account. Please use other email to register.');
        }

        // ✅ Not a delegate — check in Strapi
        if (existingCognitoId) {
          const facilitator = await strapi.db.query('api::facilitator.facilitator').findOne({
            where: { cognitoId: existingCognitoId },
          });

          if (facilitator) {
            if (facilitator.isCognitoVerified && facilitator.passBought === true) {
              await log({
                logType: 'Error',
                message: 'Registration blocked: email already registered',
                origin: 'facilitator.create',
                additionalInfo: {},
                userType: 'Facilitator',
                referenceId: facilitator.id || '',
                cognitoId: existingCognitoId || ''
              });
              return ctx.badRequest('Email already registered.');
            }

            // ❌ Incomplete registration — delete from Strapi
            await strapi.entityService.delete('api::facilitator.facilitator', facilitator.id);
          }

          // ❌ Delete from Cognito
          await client.send(new AdminDeleteUserCommand({
            Username: data.officialEmailAddress,
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
          }));
        }
      } catch (err) {
        // User does not exist in Cognito — this is fine
        if (err.name !== 'UserNotFoundException') {
          console.error('Error checking Cognito user:', err);
          return ctx.internalServerError('Failed to validate existing user.');
        }
      }

      // 3. Proceed with sign-up
      const signUpCommand = new SignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: data.officialEmailAddress,
        Password: 'Temp@123',
        UserAttributes: [
          { Name: 'email', Value: data.officialEmailAddress },
          { Name: 'phone_number', Value: formattedPhoneNumber },
          { Name: 'custom:firstName', Value: data.firstName },
          { Name: 'custom:lastName', Value: data.lastName },
          { Name: 'custom:delegate', Value: 'false' },
          ...(data.companyName ? [{ Name: 'custom:companyName', Value: data.companyName }] : []),
        ],
      });

      const response = await client.send(signUpCommand);
      const cognitoId = response.UserSub;

      // 4. Create facilitator in Strapi
      const createdFacilitator = await strapi.entityService.create('api::facilitator.facilitator', {
        data: {
          country: data.country,
          sector: data.sector || null,
          pciFccMember: data.pciFccMember,
          registerAsIndividual: data.registerAsIndividual,
          cognitoId,
        },
      });

      // 5. Return populated facilitator
      const populatedFacilitator = await strapi.entityService.findOne(
        'api::facilitator.facilitator',
        createdFacilitator.id,
        {
          populate: {
            country: { fields: ['country', 'countryCode'] },
            sector: { fields: ['name'] },
          },
        }
      );

      await log({
        logType: 'Success',
        message: 'Facilitator created in Strapi',
        origin: 'facilitator.create',
        additionalInfo: {},
        userType: 'Facilitator',
        referenceId: createdFacilitator.id || '',
        cognitoId: cognitoId || ''
      });

      return {
        ...populatedFacilitator,
        firstName: data.firstName,
        lastName: data.lastName,
        officialEmailAddress: data.officialEmailAddress,
        mobileNumber: data.mobileNumber,
        companyName: data.companyName,
        session: response.Session,
      };

    } catch (error) {
      await log({
        logType: 'Error',
        message: 'Unexpected error during facilitator creation',
        origin: 'facilitator.create',
        additionalInfo: data,
        userType: 'Facilitator',
        referenceId: '',
        cognitoId: ''
      });
      console.error('Unexpected error in facilitator creation:', error);
      return ctx.internalServerError('An unexpected error occurred while registering.');
    }
  },

  async verifyFacilitator(ctx) {
    const { officialEmailAddress, otp } = ctx.request.body;

    if (!officialEmailAddress || !otp) {
      return ctx.badRequest('Email and OTP are required.');
    }

    try {
      // 1. Confirm signup in Cognito
      const confirmCommand = new ConfirmSignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: officialEmailAddress,
        ConfirmationCode: otp,
      });

      const confirmResponse = await client.send(confirmCommand);

      // 2. Get user from Cognito to extract Cognito ID (sub)
      const adminGetCommand = new AdminGetUserCommand({
        Username: officialEmailAddress,
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
      });

      const userData = await client.send(adminGetCommand);
      const subAttr = userData.UserAttributes.find(attr => attr.Name === 'sub');
      const cognitoId = subAttr?.Value;

      if (!cognitoId) {
        await log({
          logType: 'Error',
          message: 'Cognito ID (sub) not found after OTP verification',
          origin: 'facilitator.verifyFacilitator',
          additionalInfo: {},
          userType: 'Facilitator',
          referenceId: '',
          cognitoId: ''
        });
        return ctx.internalServerError('Cognito ID not found for user');
      }

      // 3. Update facilitator in Strapi by cognitoId
      const existing = await strapi.db.query('api::facilitator.facilitator').findOne({
        where: { cognitoId },
      });

      if (existing) {
        await strapi.entityService.update('api::facilitator.facilitator', existing.id, {
          data: { isCognitoVerified: true },
        });

        // await log({
        //   logType: 'Success',
        //   message: 'Facilitator marked as verified',
        //   origin: 'facilitator.verifyFacilitator',
        //   additionalInfo: {},
        //   userType: 'Facilitator',
        //   referenceId: existing.id || '',
        //   cognitoId: cognitoId || ''
        // });
      }

      return {
        message: 'Facilitator verified successfully',
        data: confirmResponse,
      };

    } catch (error) {
      let userMessage = 'Verification failed due to an unexpected error.';
      let logMessage = 'Cognito verification error';

      if (error.name === 'CodeMismatchException') {
        userMessage = 'The provided OTP is incorrect.';
        logMessage = 'OTP code mismatch';
      } else if (error.name === 'ExpiredCodeException') {
        userMessage = 'The OTP has expired. Please request a new one.';
        logMessage = 'OTP expired';
      }

      await log({
        logType: 'Error',
        message: logMessage,
        origin: 'facilitator.verifyFacilitator',
        additionalInfo: { officialEmailAddress },
        userType: 'Facilitator',
        referenceId: '',
        cognitoId: ''
      });

      return ctx.badRequest(userMessage);
    }
  },

  async resendFacilitatorOtp(ctx) {
    const { officialEmailAddress, session } = ctx.request.body;

    if (!officialEmailAddress) {
      return ctx.badRequest('Email address is required.');
    }

    try {
      const command = new ResendConfirmationCodeCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: officialEmailAddress,
        Session: session,
      });

      const response = await client.send(command);

      return { message: 'OTP resent successfully', data: response };
    } catch (error) {
      console.error('Cognito OTP resend error:', error);

      if (error.name === 'UserNotFoundException') {
        await log({
          logType: 'Error',
          message: 'OTP resend failed: user not found in Cognito',
          origin: 'facilitator.resendFacilitatorOtp',
          additionalInfo: { officialEmailAddress },
          userType: 'Facilitator',
          referenceId: '',
          cognitoId: ''
        });

        return ctx.notFound('No user found with the provided email address.');
      }

      if (error.name === 'InvalidParameterException') {
        await log({
          logType: 'Error',
          message: 'OTP resend failed: user may already be confirmed',
          origin: 'facilitator.resendFacilitatorOtp',
          additionalInfo: { officialEmailAddress },
          userType: 'Facilitator',
          referenceId: '',
          cognitoId: ''
        });

        return ctx.badRequest('Cannot resend OTP at this stage. The user might already be confirmed.');
      }

      await log({
        logType: 'Error',
        message: 'Unexpected error during OTP resend',
        origin: 'facilitator.resendFacilitatorOtp',
        additionalInfo: { officialEmailAddress },
        userType: 'Facilitator',
        referenceId: '',
        cognitoId: ''
      });

      return ctx.internalServerError('Failed to resend OTP due to an unexpected error.');
    }
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    if (!id || typeof id !== 'string') {
      return ctx.badRequest('Invalid ID');
    }

    try {
      const existing = await strapi.entityService.findOne('api::facilitator.facilitator', id, {
        populate: ['wooOrderDetails'],
      });

      if (!existing) {
        await log({
          logType: 'Error',
          message: 'Facilitator not found',
          origin: 'facilitator.update',
          additionalInfo: { facilitatorId: id },
          userType: 'Facilitator',
          referenceId: id || '',
          cognitoId: ''
        });
        return ctx.notFound('Facilitator not found');
      }

      const existingWooOrders = existing.wooOrderDetails || [];
      const incomingWooOrders = data.wooOrderDetails || [];

      const existingOrderIds = existingWooOrders.map(order => order.wcOrderId);
      const duplicateOrders = incomingWooOrders.filter(order => existingOrderIds.includes(order.wcOrderId));

      if (duplicateOrders.length > 0) {
        await log({
          logType: 'Error',
          message: 'Duplicate WooCommerce order(s) detected in facilitator update',
          origin: 'facilitator.update',
          additionalInfo: {
            duplicateOrderIds: duplicateOrders.map(o => o.wcOrderId),
          },
          userType: 'Facilitator',
          referenceId: id || '',
          cognitoId: existing.cognitoId || ''
        });
        return ctx.badRequest(`Duplicate WooCommerce order(s) found: ${duplicateOrders.map(o => o.wcOrderId).join(', ')}`);
      }

      const addParticpant =
        existingWooOrders.length > 0 &&
          existingWooOrders.some(order => order.wcOrderStatus === 'completed')
          ? 'true'
          : 'false';


      await log({
        logType: 'Success',
        message: 'Incoming WooCommerce order details received for facilitator update',
        origin: 'facilitator.update',
        additionalInfo: {
          newOrders: incomingWooOrders.map(order => ({
            wcOrderId: order.wcOrderId,
            wcOrderStatus: order.wcOrderStatus,
          })),
        },
        userType: 'Facilitator',
        referenceId: id || '',
        cognitoId: existing.cognitoId || ''
      });

      const mergedWooOrders = [...existingWooOrders, ...incomingWooOrders];

      const { wooOrderDetails, ...restData } = data;

      await strapi.entityService.update('api::facilitator.facilitator', id, {
        data: {
          ...restData,
          gstDetails: data.gstDetails ?? null,
          wooOrderDetails: mergedWooOrders,
        },
      });

      const updated = await strapi.entityService.findOne('api::facilitator.facilitator', id, {
        populate: {
          gstDetails: true,
          country: { fields: ['country', 'countryCode'] },
          sector: { fields: ['name'] },
          wooOrderDetails: true,
          invoiceDetails: true,
        },
      });

      const delegates = [];
      const passes = [];
      let updatedWooOrderDetails = [...updated.wooOrderDetails];
      const orderSummaryItems = [];

      for (const order of incomingWooOrders) {
        if (order.wcOrderStatus === 'completed') {
          const wooOrder = await fetchWooOrder(order.wcOrderId);

          for (const item of wooOrder.line_items) {
            orderSummaryItems.push(`${item.name} Pass - ${item.quantity}`);
            for (let i = 0; i < item.quantity; i++) {
              const newDelegate = await strapi.entityService.create('api::delegate.delegate', {
                data: {
                  facilitatorId: existing.id,
                  passType: item.name,
                  passPrice: Number(item.subtotal) / item.quantity,
                },
              });
              const confirmationId = `GFF25${String(newDelegate.id).padStart(6, '0')}`;
              const updatedDelegate = await strapi.entityService.update('api::delegate.delegate', newDelegate.id, {
                data: { confirmationId },
              });
              delegates.push(updatedDelegate);
              passes.push({
                confirmationId: updatedDelegate.confirmationId,
                passType: item.name,
                price: (Number(item.subtotal) / item.quantity).toString(),
              });
            }
          }

          const orderSummary = orderSummaryItems.join(', ');
          console.log('Order Summary:', orderSummary);

          const cognitoUser = await getCognitoUserBySub(existing.cognitoId);
          console.log('cognitoUser = ', cognitoUser);
          const firstName = cognitoUser?.firstName || '';
          const lastName = cognitoUser?.lastName || '';
          const email = cognitoUser?.email || '';
          const mobilePhone = cognitoUser?.phone_number || '';
          const companyName = cognitoUser?.companyName || '';
          const isGstPresent = !!updated?.gstDetails?.companyGstNo;
          const currencySymbol = wooOrder.currency === 'INR' ? '₹' : wooOrder.currency === 'USD' ? '$' : '';

          const taxableAmount = wooOrder.line_items.reduce(
            (sum, item) => sum + Number(item.total),
            0
          ).toString();
          const cgst = wooOrder.tax_lines.find(t => t.label.toLowerCase() === 'cgst')?.tax_total || '0';
          const sgst = wooOrder.tax_lines.find(t => t.label.toLowerCase() === 'sgst')?.tax_total || '0';

          const payload = {
            invoice: 'true',
            promoCode: (wooOrder.meta_data.find(m => m.key === 'appliedCouponCode') || {}).value || '',
            addParticpant: addParticpant,
            eventId: process.env.CRM_EVENT_ID,
            currencyType: wooOrder.currency,
            // amount: (wooOrder.meta_data.find(m => m.key === 'taxableAmount') || {}).value?.toString() || '',
            amount: taxableAmount,
            cgst: cgst,
            sgst: sgst,
            email,
            mobilePhone,
            billingFirstName: firstName,
            billingLastName: lastName,
            company: companyName,
            linkdinProfile: updated.linkedinUrl || '',
            passes,
            gstInfo: {
              companyName: updated?.gstDetails?.companyName || '',
              gstNumber: updated?.gstDetails?.companyGstNo || '',
              billingAdress: updated?.gstDetails?.billingAddress || '',
              companyAddress: updated?.gstDetails?.companyAddress || '',
              pincode: updated?.gstDetails?.pincode || '',
            },
          };

          console.log('salesforce payload = ', payload);

          try {
            const result = await insertIntoSalesforce(payload);
            console.log('result = ', result);
            strapi.log.info('Salesforce insert success:', result.data);

            await log({
              logType: 'Success',
              message: 'Salesforce insert successful',
              origin: 'facilitator.update',
              additionalInfo: {
                registrationPaymentId: result?.registrationPaymentId || '',
                passes,
              },
              userType: 'Facilitator',
              referenceId: id || '',
              cognitoId: existing.cognitoId || ''
            });

            if (result?.registrationPaymentId) {
              updatedWooOrderDetails = updatedWooOrderDetails.map(o => {
                if (o.wcOrderId === order.wcOrderId) {
                  return { ...o, crmRegistrationPaymentId: result.registrationPaymentId };
                }
                return o;
              });

              await strapi.entityService.update('api::facilitator.facilitator', id, {
                data: {
                  wooOrderDetails: updatedWooOrderDetails,
                  gstDetails: data.gstDetails ?? null,
                },
              });

              let invoiceDetails = null;

              try {
                const invoiceResponse = await fetchInvoiceFromSalesforce(result.registrationPaymentId); // You’ll create this function
                console.log('invoiceResponse', invoiceResponse);
                const rawDate = invoiceResponse?.['Invoice Date'];
                let paymentDate = '';

                if (rawDate) {
                  const dateObj = new Date(rawDate);
                  const day = String(dateObj.getDate()).padStart(2, '0');
                  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // month is 0-based
                  const year = dateObj.getFullYear();
                  paymentDate = `${day}/${month}/${year}`;
                }
                invoiceDetails = {
                  invoiceNumber: invoiceResponse?.Name || '',
                  paymentDate: paymentDate,
                  amountPaid: currencySymbol + ' ' + invoiceResponse?.Gross_Total || '',
                  invoiceLink: invoiceResponse?.Content_Document_URL__c || '',
                };

                strapi.log.info('Invoice details fetched:', invoiceDetails);
                await log({
                  logType: 'Success',
                  message: 'Invoice fetched successfully',
                  origin: 'facilitator.update',
                  additionalInfo: {
                    registrationPaymentId: result.registrationPaymentId,
                    invoiceNumber: invoiceDetails.invoiceNumber,
                    invoiceLink: invoiceDetails.invoiceLink,
                  },
                  userType: 'Facilitator',
                  referenceId: id || '',
                  cognitoId: existing.cognitoId || ''
                });
              } catch (invoiceError) {
                strapi.log.error('Failed to fetch invoice details:', {
                  message: invoiceError.message,
                  stack: invoiceError.stack,
                });
                await log({
                  logType: 'Error',
                  message: 'Invoice fetch failed from Salesforce',
                  origin: 'facilitator.update',
                  additionalInfo: {
                    registrationPaymentId: result?.registrationPaymentId || '',
                    errorMessage: invoiceError?.message || '',
                    errorStack: invoiceError?.stack || ''
                  },
                  userType: 'Facilitator',
                  referenceId: id || '',
                  cognitoId: existing.cognitoId || ''
                });
              }

              if (invoiceDetails) {
                const invoiceNumber = invoiceDetails.invoiceNumber;
                const amountPaid = invoiceDetails.amountPaid;
                const paymentDate = invoiceDetails.paymentDate;
                const passDetails = orderSummary;
                const invoiceLink = invoiceDetails.invoiceLink;

                const existingInvoiceDetails = updated.invoiceDetails || [];
                const newInvoiceDetails = [
                  ...existingInvoiceDetails,
                  {
                    wcOrderId: order.wcOrderId,
                    paymentDate,
                    invoiceNumber,
                    amountPaid,
                    invoiceLink,
                  },
                ];

                await strapi.entityService.update('api::facilitator.facilitator', id, {
                  data: {
                    invoiceDetails: newInvoiceDetails
                  },
                });

                try {
                  await sendEmail({
                    to: email,
                    subject: 'Thank You for Your Payment for GFF 2025 Registration',
                    templateName: 'payment-invoice',
                    replacements: { firstName, lastName, invoiceNumber, amountPaid, paymentDate, passDetails, invoiceLink },
                  });
                } catch (err) {
                  strapi.log.error('Failed to Send Invoice email:', err);
                  await log({
                    logType: 'Error',
                    message: 'Failed to Send Invoice Email',
                    origin: 'facilitator.update',
                    additionalInfo: {
                      errorMessage: err?.message || '',
                      stack: err?.stack || '',
                    },
                    userType: 'Facilitator',
                    referenceId: id || '',
                    cognitoId: existing.cognitoId || ''
                  });
                }

              }

            }
          } catch (err) {
            strapi.log.error('Salesforce insert failed:', {
              message: err?.message || 'No error message',
              stack: err?.stack || 'No stack trace',
              full: err,
            });

            await log({
              logType: 'Error',
              message: 'Salesforce insert failed',
              origin: 'facilitator.update',
              additionalInfo: {
                message: err?.message || '',
                stack: err?.stack || '',
              },
              userType: 'Facilitator',
              referenceId: id || '',
              cognitoId: existing.cognitoId || ''
            });

          }
        }
      }

      const finalUpdated = await strapi.entityService.findOne('api::facilitator.facilitator', id, {
        populate: {
          gstDetails: true,
          country: { fields: ['country', 'countryCode'] },
          sector: { fields: ['name'] },
          wooOrderDetails: true,
          invoiceDetails: true,
        },
      });

      // return updated;
      return finalUpdated;

    } catch (error) {
      console.error('Update error:', error);
      await log({
        logType: 'Error',
        message: 'Unexpected error during facilitator update',
        origin: 'facilitator.update',
        additionalInfo: {
          errorMessage: error?.message || '',
          errorStack: error?.stack || '',
        },
        userType: 'Facilitator',
        referenceId: id || '',
        cognitoId: ''
      });
      return ctx.internalServerError('An error occurred while updating the facilitator');
    }
  },

  async delete(ctx) {
    const { id } = ctx.params;

    const deletedFacilitator = await strapi.entityService.delete('api::facilitator.facilitator', id);

    if (!deletedFacilitator) {
      return ctx.notFound('Facilitator not found');
    }

    return { message: 'Facilitator deleted successfully' };
  },

  async login(ctx) {
    const { officialEmailAddress } = ctx.request.body;

    if (!officialEmailAddress) {
      return ctx.badRequest('Email address is required.');
    }

    try {
      // 1. Fetch Cognito user details
      const userData = await client.send(new AdminGetUserCommand({
        Username: officialEmailAddress,
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
      }));

      const attributes = userData.UserAttributes;
      const subAttr = attributes.find(attr => attr.Name === 'sub');
      const delegateAttr = attributes.find(attr => attr.Name === 'custom:delegate');
      const userStatus = userData.UserStatus;

      const cognitoId = subAttr?.Value;
      const isDelegate = delegateAttr?.Value === 'true';

      if (!cognitoId) {
        await log({
          logType: 'Error',
          message: 'Login failed: Cognito ID not found',
          origin: 'facilitator.login',
          additionalInfo: { email: officialEmailAddress },
          userType: 'Facilitator',
          referenceId: '',
          cognitoId: ''
        });
        return ctx.notFound('Email is not registered. Please register first.');
      }

      if (isDelegate) {
        await log({
          logType: 'Error',
          message: 'Blocked login: email belongs to delegate',
          origin: 'facilitator.login',
          additionalInfo: {},
          userType: 'Facilitator',
          referenceId: '',
          cognitoId: cognitoId || ''
        });
        return ctx.forbidden('This email is associated with a participant account. Please use the main contact email provided during registration to log in.');
      }

      // 2. Find facilitator in Strapi
      const facilitator = await strapi.db.query('api::facilitator.facilitator').findOne({
        where: { cognitoId },
      });

      if (!facilitator) {
        await client.send(new AdminDeleteUserCommand({
          Username: officialEmailAddress,
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
        }));

        await log({
          logType: 'Error',
          message: 'Blocked login: incomplete registration — user deleted',
          origin: 'facilitator.login',
          additionalInfo: { email: officialEmailAddress },
          userType: 'Facilitator',
          referenceId: '',
          cognitoId: ''
        });

        return ctx.badRequest('Your registration was not completed. Please register again.');
      }

      // 3. If user is UNCONFIRMED and facilitator is partially registered, delete both
      // if (userStatus === 'UNCONFIRMED' || facilitator?.passBought === false) {
      //   // Delete user from Cognito
      //   await client.send(new AdminDeleteUserCommand({
      //     Username: officialEmailAddress,
      //     UserPoolId: process.env.COGNITO_USER_POOL_ID,
      //   }));

      //   // Delete user from Strapi
      //   await strapi.entityService.delete('api::facilitator.facilitator', facilitator.id);

      //   await log({
      //     logType: 'Error',
      //     message: 'Blocked login: partially registered — user deleted',
      //     origin: 'facilitator.login',
      //     additionalInfo: { email: officialEmailAddress, reason: 'UNCONFIRMED or pass not bought' },
      //     userType: 'Facilitator',
      //     referenceId: '',
      //     cognitoId: ''
      //   });

      //   return ctx.badRequest('Your registration was not completed. Please register again.');
      // }

      // Always delete if user is UNCONFIRMED
      if (userStatus === 'UNCONFIRMED') {
        // 🔒 Delete from Cognito
        await client.send(new AdminDeleteUserCommand({
          Username: officialEmailAddress,
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
        }));

        // 🗑️ Delete from Strapi
        if (facilitator?.id) {
          await strapi.entityService.delete('api::facilitator.facilitator', facilitator.id);
        }

        await log({
          logType: 'Error',
          message: 'Blocked login: UNCONFIRMED — user deleted from Cognito and Strapi',
          origin: 'facilitator.login',
          additionalInfo: { email: officialEmailAddress },
          userType: 'Facilitator',
          referenceId: '',
          cognitoId: ''
        });

        return ctx.badRequest('Your registration was not completed. Please register again.');
      }

      // ✅ Additional cleanup for confirmed users with incomplete registration
      const passNotBought = facilitator.passBought;
      const delegateConverted = facilitator.delegateConvertedToFacilitator;

      if (passNotBought === false && delegateConverted === true) {
        // 🗑️ Only delete from Strapi
        await strapi.entityService.delete('api::facilitator.facilitator', facilitator.id);

        await log({
          logType: 'Error',
          message: 'Partially registered user deleted from Strapi (delegateConverted = true)',
          origin: 'facilitator.login',
          additionalInfo: { email: officialEmailAddress },
          userType: 'Facilitator',
          referenceId: '',
          cognitoId: ''
        });

        return ctx.badRequest('This email is associated with a participant account. Please use the main contact email provided during registration to log in.');
      }

      if (passNotBought === false && delegateConverted === false) {
        // 🔒 Delete from Cognito
        await client.send(new AdminDeleteUserCommand({
          Username: officialEmailAddress,
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
        }));

        // 🗑️ Delete from Strapi
        await strapi.entityService.delete('api::facilitator.facilitator', facilitator.id);

        await log({
          logType: 'Error',
          message: 'Partially registered user deleted from Cognito and Strapi (delegateConverted = false)',
          origin: 'facilitator.login',
          additionalInfo: { email: officialEmailAddress },
          userType: 'Facilitator',
          referenceId: '',
          cognitoId: ''
        });

        return ctx.badRequest('Your registration was not completed. Please register again.');
      }

      // 4. Proceed to send OTP using custom auth flow
      const authCommand = new InitiateAuthCommand({
        AuthFlow: 'CUSTOM_AUTH',
        ClientId: process.env.COGNITO_CLIENT_ID,
        AuthParameters: {
          USERNAME: officialEmailAddress,
        },
      });

      const response = await client.send(authCommand);

      return ctx.send({
        message: 'OTP sent to email',
        session: response.Session,
      });

    } catch (error) {
      console.error('Login error:', error);

      if (error.name === 'UserNotFoundException') {
        await log({
          logType: 'Error',
          message: 'Login failed: Cognito user not found',
          origin: 'facilitator.login',
          additionalInfo: { email: officialEmailAddress },
          userType: 'Facilitator',
          referenceId: '',
          cognitoId: ''
        });
        return ctx.notFound('Email is not registered. Please register first.');
      }

      await log({
        logType: 'Error',
        message: 'Unexpected error during login',
        origin: 'facilitator.login',
        additionalInfo: {
          email: officialEmailAddress,
          errorMessage: error?.message || '',
          errorStack: error?.stack || ''
        },
        userType: 'Facilitator',
        referenceId: '',
        cognitoId: ''
      });

      return ctx.internalServerError('Failed to process login');
    }
  },

  async verifyLoginOtp(ctx) {
    const { officialEmailAddress, otp, session } = ctx.request.body;

    if (!officialEmailAddress || !otp || !session) {
      return ctx.badRequest('Email, OTP, and session are required.');
    }

    try {
      // 1. Verify OTP with Cognito
      const challengeCommand = new RespondToAuthChallengeCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        ChallengeName: 'CUSTOM_CHALLENGE',
        Session: session,
        ChallengeResponses: {
          USERNAME: officialEmailAddress,
          ANSWER: otp,
        },
      });

      const response = await client.send(challengeCommand);

      if (!response.AuthenticationResult) {
        await log({
          logType: 'Error',
          message: 'OTP verification failed',
          origin: 'facilitator.verifyLoginOtp',
          additionalInfo: { email: officialEmailAddress },
          userType: 'Facilitator',
          referenceId: '',
          cognitoId: ''
        });
        return ctx.unauthorized('OTP verification failed.');
      }

      // 2. Get user profile from Cognito
      const userCommand = new AdminGetUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: officialEmailAddress,
      });

      const userResult = await client.send(userCommand);

      const attributes = {};
      userResult.UserAttributes.forEach(attr => {
        attributes[attr.Name] = attr.Value;
      });

      const cognitoId = attributes['sub'];
      const facilitatorFirstName = attributes['custom:firstName'];
      const facilitatorLastName = attributes['custom:lastName'];
      const facilitatorEmail = attributes['email'];
      const facilitatorPhone = attributes['phone_number'];
      const facilitatorCompany = attributes['custom:companyName'] || null;

      if (!cognitoId) {
        await log({
          logType: 'Error',
          message: 'Cognito ID missing after OTP verification',
          origin: 'facilitator.verifyLoginOtp',
          additionalInfo: { email: officialEmailAddress },
          userType: 'Facilitator',
          referenceId: '',
          cognitoId: ''
        });
        return ctx.internalServerError('Cognito ID missing');
      }

      // 3. Find facilitator in Strapi using Cognito ID
      const facilitator = await strapi.db.query('api::facilitator.facilitator').findOne({
        where: { cognitoId },
        populate: {
          country: true,
          sector: true,
          wooOrderDetails: true,
          invoiceDetails: true,
          gstDetails: true,
          delegates: {
            populate: ['sector', 'country'],
          },
        },
      });

      if (!facilitator) {
        await log({
          logType: 'Error',
          message: 'Facilitator not found in Strapi after successful OTP verification',
          origin: 'facilitator.verifyLoginOtp',
          additionalInfo: { email: officialEmailAddress },
          userType: 'Facilitator',
          referenceId: '',
          cognitoId: cognitoId || ''
        });
        return ctx.notFound('User not found in the system.');
      }

      let mobileNumber = facilitatorPhone;
      if (facilitatorPhone && facilitator?.country?.countryCode) {
        const code = facilitator.country.countryCode.replace('+', '');
        mobileNumber = facilitatorPhone.replace(`+${code}`, '');
      }

      // 4. Enrich delegates with Cognito details
      const enrichedDelegates = [];

      for (const delegate of facilitator.delegates || []) {
        const cognitoDelegateId = delegate.cognitoId;
        let firstName = null;
        let lastName = null;
        let officialEmailAddress = null;
        let mobileNumber = null;
        let companyName = null;

        if (delegate.isFacilitator) {
          firstName = facilitatorFirstName;
          lastName = facilitatorLastName;
          officialEmailAddress = facilitatorEmail;
          companyName = facilitatorCompany;

          if (facilitatorPhone && delegate?.country?.countryCode) {
            const code = delegate.country.countryCode.replace('+', '');
            mobileNumber = facilitatorPhone.replace(`+${code}`, '');
          } else {
            mobileNumber = facilitatorPhone;
          }

        } else if (delegate.cognitoId) {
          // If not isFacilitator, fetch from Cognito
          try {
            const delegateUser = await client.send(new AdminGetUserCommand({
              UserPoolId: process.env.COGNITO_USER_POOL_ID,
              Username: delegate.cognitoId,
            }));

            const delegateAttrs = {};
            delegateUser.UserAttributes.forEach(attr => {
              delegateAttrs[attr.Name] = attr.Value;
            });

            firstName = delegateAttrs['custom:firstName'];
            lastName = delegateAttrs['custom:lastName'];
            officialEmailAddress = delegateAttrs['email'];
            mobileNumber = delegateAttrs['phone_number'];
            companyName = delegateAttrs['custom:companyName'] || null;

            if (mobileNumber && delegate?.country?.countryCode) {
              const code = delegate.country.countryCode.replace('+', '');
              mobileNumber = mobileNumber.replace(`+${code}`, '');
            }

          } catch (e) {
            console.warn(`Failed to fetch Cognito data for delegate ${delegate.cognitoId}:`, e.message);
          }
        }

        enrichedDelegates.push({
          ...delegate,
          firstName,
          lastName,
          officialEmailAddress,
          mobileNumber,
          companyName,
        });
      }

      // 5. Fetch WooCommerce order if present
      const mergedLineItemsMap = new Map();

      if (Array.isArray(facilitator.wooOrderDetails)) {
        for (const orderMeta of facilitator.wooOrderDetails) {
          if (orderMeta.wcOrderStatus === 'completed' && orderMeta.wcOrderId) {
            const order = await fetchWooOrder(orderMeta.wcOrderId);
            if (order && Array.isArray(order.line_items)) {
              for (const item of order.line_items) {
                const { product_id, name, quantity } = item;
                if (!product_id) continue;

                if (mergedLineItemsMap.has(product_id)) {
                  const existing = mergedLineItemsMap.get(product_id);
                  existing.quantity += quantity;
                } else {
                  mergedLineItemsMap.set(product_id, {
                    product_id,
                    name,
                    quantity,
                  });
                }
              }
            }
          }
        }
      }

      // Convert map back to array
      const mergedLineItems = Array.from(mergedLineItemsMap.values());

      // 6. Return combined Cognito + Strapi data
      return ctx.send({
        message: 'Login successful',
        idToken: response.AuthenticationResult?.IdToken,
        accessToken: response.AuthenticationResult?.AccessToken,
        refreshToken: response.AuthenticationResult?.RefreshToken,
        data: {
          cognitoId,
          officialEmailAddress: facilitatorEmail,
          mobileNumber,
          firstName: facilitatorFirstName,
          lastName: facilitatorLastName,
          companyName: facilitatorCompany,
          ...facilitator,
          delegates: enrichedDelegates,
          wooOrderDetailsTest: {
            line_items: mergedLineItems,
          }
        },
      });

    } catch (error) {
      console.error('OTP verification failed:', error);
      await log({
        logType: 'Error',
        message: 'Unexpected error in OTP verification',
        origin: 'facilitator.verifyLoginOtp',
        additionalInfo: {
          email: officialEmailAddress,
          errorMessage: error?.message || '',
          stack: error?.stack || ''
        },
        userType: 'Facilitator',
        referenceId: '',
        cognitoId: ''
      });
      return ctx.internalServerError('OTP verification failed due to an unexpected error.');
    }
  },

  async updateProfile(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    if (!id || typeof id !== 'string') {
      return ctx.badRequest('Invalid ID');
    }

    try {
      const country = await strapi.entityService.findOne('api::country.country', data.country, {
        fields: ['countryCode'],
      });

      if (!country || !country.countryCode) {
        return ctx.badRequest('Invalid or missing country code.');
      }

      const formattedPhoneNumber = `${country.countryCode}${data.mobileNumber}`;

      const existing = await strapi.entityService.findOne('api::facilitator.facilitator', id, {
        populate: {
          country: { fields: ['country', 'countryCode'] },
          sector: { fields: ['name'] },
        },
      });

      if (!existing) {
        return ctx.notFound('Facilitator not found');
      }

      // ✅ Update Cognito if cognitoId is present
      if (existing.cognitoId) {
        const updateCommand = new AdminUpdateUserAttributesCommand({
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          Username: existing.cognitoId,
          UserAttributes: [
            { Name: 'custom:firstName', Value: data.firstName },
            { Name: 'custom:lastName', Value: data.lastName },
            { Name: 'phone_number', Value: formattedPhoneNumber },
            { Name: 'custom:companyName', Value: data.companyName },
          ],
        });

        await client.send(updateCommand);

        // 🔍 Check if a delegate exists with the same cognitoId
        const delegates = await strapi.entityService.findMany('api::delegate.delegate', {
          filters: { cognitoId: existing.cognitoId },
          fields: ['confirmationId', 'passType', 'passPrice'],
          limit: 1,
        });

        const matchedDelegate = delegates?.[0];

        // ✅ Only update Salesforce if a delegate is found
        if (matchedDelegate) {
          const confirmationId = matchedDelegate.confirmationId;
          const passType = matchedDelegate.passType;
          const passPrice = matchedDelegate.passPrice;

          const salesforcePayload = {
            upgrade: 'true',
            email: data.officialEmailAddress,
            mobilePhone: formattedPhoneNumber,
            participantFirstName: data.firstName,
            participantLastName: data.lastName,
            company: data.companyName || 'INDIVIDUAL',
            vertical: '',
            level: '',
            GenderIdentity: '',
            title: '',
            linkdinProfile: data.linkedinUrl || '',
            twitterProfile: '',
            instagramProfile: '',
            personalEmail: '',
            confirmationId: confirmationId,
            passType: passType,
            price: passPrice,
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
            interestAreas: '',
          };

          try {
            await updateSalesforceParticipant(salesforcePayload);
            strapi.log.info(`Salesforce updated for facilitator ${confirmationId}`);
            await log({
              logType: 'Success',
              origin: 'facilitator.update',
              message: 'Facilitator Salesforce update success',
              additionalInfo: { confirmationId },
              userType: 'Facilitator',
              referenceId: existing.id || '',
              cognitoId: existing.cognitoId || '',
            });
          } catch (error) {
            strapi.log.error('Salesforce update failed:', error.message || error);
            await log({
              logType: 'Error',
              origin: 'facilitator.update',
              message: 'Facilitator Salesforce update failed',
              additionalInfo: {
                errorMessage: error?.message || '',
                stack: error?.stack || '',
              },
              userType: 'Facilitator',
              referenceId: existing.id || '',
              cognitoId: existing.cognitoId || '',
            });
          }
        }
      }

      // ✅ Finally, update facilitator in Strapi
      const updatedFacilitator = await strapi.entityService.update('api::facilitator.facilitator', id, {
        data: {
          ...data
        },
        populate: {
          country: true,
          sector: true
        }
      });

      return ctx.send({
        ...updatedFacilitator,
        firstName: data.firstName,
        lastName: data.lastName,
        mobileNumber: data.mobileNumber,
        officialEmailAddress: data.officialEmailAddress,
      });

    } catch (error) {
      console.error('Update error:', error);
      await log({
        logType: 'Error',
        origin: 'facilitator.updateProfile',
        message: 'Unexpected error during facilitator update Profile',
        additionalInfo: {
          errorMessage: error?.message || '',
          stack: error?.stack || '',
        },
        userType: 'Facilitator',
        referenceId: '',
        cognitoId: '',
      });

      return ctx.internalServerError('An error occurred while updating profile of the facilitator');
    }
  },

  async delegateToFacilitator(ctx) {
    const { cognitoId } = ctx.request.body.data;

    if (!cognitoId) {
      return ctx.badRequest('Missing cognitoId');
    }

    try {

      const delegates = await strapi.entityService.findMany('api::delegate.delegate', {
        filters: { cognitoId },
        fields: ['pciFccMember', 'linkedinUrl'],
        populate: {
          country: { fields: ['id'] },
          sector: { fields: ['id'] },
        },
        limit: 1,
      });

      const delegate = delegates?.[0];

      if (!delegate) {
        return ctx.notFound('Delegate not found for this cognitoId');
      }

      const countryId = delegate.country?.id || null;
      const sectorId = delegate.sector?.id || null;

      const newFacilitator = await strapi.entityService.create('api::facilitator.facilitator', {
        data: {
          cognitoId,
          country: countryId,
          sector: sectorId,
          pciFccMember: delegate.pciFccMember || false,
          registerAsIndividual: delegate.registerAsIndividual || false,
          linkedinUrl: delegate.linkedinUrl || '',
          isCognitoVerified: true,
          passBought: false,
          delegateConvertedToFacilitator: true,
        },
      });

      const populatedFacilitator = await strapi.entityService.findOne(
        'api::facilitator.facilitator',
        newFacilitator.id,
        {
          populate: {
            country: { fields: ['country', 'countryCode'] },
            sector: { fields: ['name'] },
          },
        }
      );

      const cognitoUser = await getCognitoUserBySub(cognitoId);
      console.log('cognitoUser = ', cognitoUser);
      const firstName = cognitoUser?.firstName || '';
      const lastName = cognitoUser?.lastName || '';
      const officialEmailAddress = cognitoUser?.email || '';
      const fullMobileNumber = cognitoUser?.phone_number || '';
      const companyName = cognitoUser?.companyName || '';

      const updateCommand = new AdminUpdateUserAttributesCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: cognitoId,
        UserAttributes: [
          { Name: 'custom:delegate', Value: 'false' }
        ],
      });

      await client.send(updateCommand);

      let mobileNumber = fullMobileNumber;
      if (fullMobileNumber && populatedFacilitator?.country?.countryCode) {
        const code = populatedFacilitator.country.countryCode.replace('+', '');
        mobileNumber = fullMobileNumber.replace(`+${code}`, '');
      }

      // return ctx.send({ facilitatorId: newFacilitator.id });
      return ctx.send({
        ...populatedFacilitator,
        firstName,
        lastName,
        mobileNumber,
        officialEmailAddress,
        companyName
      });


    } catch (error) {
      console.error('Error in createFromDelegates:', error);
      return ctx.internalServerError('Something went wrong while creating facilitator from delegates');
    }

  },

  async getMyPass(ctx) {
    const { id } = ctx.params;

    if (!id) {
      return ctx.badRequest('Missing facilitator id');
    }

    try {
      // 1. Get facilitator
      const facilitator = await strapi.entityService.findOne('api::facilitator.facilitator', id, {
        fields: ['cognitoId'],
      });

      if (!facilitator || !facilitator.cognitoId) {
        return ctx.notFound('Facilitator or cognitoId not found');
      }

      const cognitoId = facilitator.cognitoId;

      // 2. Get delegates by cognitoId
      const delegates = await strapi.db.query('api::delegate.delegate').findOne({
        where: { cognitoId },
        populate: {
          sector: true,
          country: true,
        },
      });

      // 3. Get Cognito user profile
      const cognitoResponse = await client.send(
        new AdminGetUserCommand({
          Username: cognitoId,
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
        })
      );

      const attributes = cognitoResponse.UserAttributes || [];

      const getAttr = (key) => attributes.find((a) => a.Name === key)?.Value || '';

      const userProfile = {
        firstName: getAttr('custom:firstName'),
        lastName: getAttr('custom:lastName'),
        mobileNumber: getAttr('phone_number'),
        email: getAttr('email'),
        companyName: getAttr('custom:companyName'),
      };

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

      // 4. Return combined result
      return ctx.send({
        ...delegates,
        firstName,
        lastName,
        mobileNumber,
        officialEmailAddress,
        companyName
      });

    } catch (error) {
      console.error('getMyPass error:', error);
      return ctx.internalServerError('Something went wrong while fetching your pass info');
    }
  },

  // async wooOrderSync(ctx) {
  //   try {
  //     const wooOrder = ctx.request.body;
  //     const metaData = Array.isArray(wooOrder.meta_data) ? wooOrder.meta_data : [];
  //     const getMetaValue = (key) => metaData.find(m => m.key === key)?.value ?? null;

  //     const strapiUserId = getMetaValue('strapiUserId');

  //     if (!strapiUserId) {
  //       return ctx.send({ warning: 'Strapi user ID missing in order' });
  //     }

  //     const numericUserId = parseInt(strapiUserId, 10);
  //     if (isNaN(numericUserId)) {
  //        return ctx.send({ warning: 'Invalid Strapi user ID' });
  //     }

  //     const existingFacilitator = await strapi.entityService.findOne('api::facilitator.facilitator', numericUserId);

  //     if (!existingFacilitator) {
  //       return ctx.send({ warning: 'Facilitator not found' });
  //     }

  //     const totalAmount = getMetaValue('totalAmount');
  //     const gstDetails = {
  //       companyName: getMetaValue('companyName'),
  //       companyAddress: getMetaValue('companyAddress'),
  //       companyPOC: getMetaValue('companyPOC'),
  //       billingAddress: getMetaValue('billingAddress'),
  //       pincode: getMetaValue('pincode'),
  //     };

  //     // Update facilitator
  //     await strapi.entityService.update('api::facilitator.facilitator', numericUserId, {
  //       data: {
  //         wcOrderStatus: wooOrder.status,
  //         wcOrderId: String(wooOrder.id),
  //         totalAmount: totalAmount,
  //         gstDetails: gstDetails,
  //       },
  //     });

  //     return ctx.send({ message: 'Order synced and GST data saved successfully' });

  //   } catch (err) {
  //     // console.error('❌ Webhook error:', err);
  //     return ctx.send({ error: 'Internal error occurred. Logged for review.' });
  //   }
  // },

}));

async function fetchWooOrder(wcOrderId) {
  if (!wcOrderId) return { error: 'No order ID' };
  const baseURL = process.env.WC_BASE_URL;
  const username = process.env.WC_CONSUMER_KEY;
  const password = process.env.WC_CONSUMER_SECRET;

  try {
    const res = await axios.get(`${baseURL}/orders/${wcOrderId}`, {
      auth: {
        username,
        password
      },
    });
    return res.data;

  } catch (err) {
    await log({
      logType: 'Error',
      message: 'WooCommerce order fetch failed',
      origin: 'facilitator.fetchWooOrder',
      additionalInfo: {
        wcOrderId: wcOrderId,
        errorMessage: err?.message || '',
        stack: err?.stack || '',
      },
      userType: 'Facilitator',
      referenceId: '',
      cognitoId: ''
    });
    return { error: 'WooCommerce order fetch failed', details: err.message };
  }
}

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
      message: 'Failed to fetch Cognito user by sub',
      origin: 'facilitator.getCognitoUserBySub',
      additionalInfo: {
        sub,
        errorMessage: err?.message || '',
        stack: err?.stack || '',
      },
      userType: 'Facilitator',
      referenceId: '',
      cognitoId: ''
    });
    return null;
  }
}
