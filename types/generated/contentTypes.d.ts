import type { Schema, Struct } from '@strapi/strapi';

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'read-only'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::permission'> &
      Schema.Attribute.Private;
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<'manyToOne', 'admin::role'>;
    subject: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::role'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<'manyToMany', 'admin::user'>;
  };
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferTokenPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::transfer-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    lastname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::user'> &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    roles: Schema.Attribute.Relation<'manyToMany', 'admin::role'> &
      Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String;
  };
}

export interface ApiAgendaDdAgendaDd extends Struct.CollectionTypeSchema {
  collectionName: 'agenda_dds';
  info: {
    description: '';
    displayName: 'agendaDD';
    pluralName: 'agenda-dds';
    singularName: 'agenda-dd';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    agenda_code: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::agenda-dd.agenda-dd'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    session_date: Schema.Attribute.Date;
    session_desc: Schema.Attribute.Blocks;
    session_end_time: Schema.Attribute.Time;
    session_format: Schema.Attribute.Enumeration<
      [
        'Opening Session',
        'Masterclass',
        'Product Showcase',
        'Fireside Chat',
        'Panel Discussion',
      ]
    >;
    session_hall: Schema.Attribute.Enumeration<
      [
        'Hall 205A&B',
        'Hall 104B',
        'Jasmine1',
        'Pavallion',
        'Hall 203',
        'Lotus2',
        'Lotus1',
        'Hall 202',
      ]
    >;
    session_hosts: Schema.Attribute.Relation<
      'oneToMany',
      'api::speaker.speaker'
    >;
    session_name: Schema.Attribute.String;
    session_speakers: Schema.Attribute.Relation<
      'oneToMany',
      'api::speaker.speaker'
    >;
    session_start_time: Schema.Attribute.Time;
    session_sub_hall: Schema.Attribute.Enumeration<
      ['T13, T15', 'A8, A9, A10, A11', 'D1', 'O19']
    >;
    session_tags: Schema.Attribute.Relation<
      'oneToMany',
      'api::session-tag.session-tag'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiAgendaAgenda extends Struct.CollectionTypeSchema {
  collectionName: 'agendas';
  info: {
    description: '';
    displayName: 'agenda';
    pluralName: 'agendas';
    singularName: 'agenda';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    agenda_code: Schema.Attribute.String;
    agendaID: Schema.Attribute.UID;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::agenda.agenda'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    session_date: Schema.Attribute.String;
    session_desc: Schema.Attribute.Text;
    session_end_time: Schema.Attribute.String;
    session_format: Schema.Attribute.String;
    session_hall: Schema.Attribute.String;
    session_host: Schema.Attribute.Text;
    session_host_01: Schema.Attribute.String;
    session_host_01_host_type: Schema.Attribute.String;
    session_host_02: Schema.Attribute.String;
    session_host_02_host_type: Schema.Attribute.String;
    session_host_03: Schema.Attribute.String;
    session_host_03_host_type: Schema.Attribute.String;
    session_host_04: Schema.Attribute.String;
    session_host_04_host_type: Schema.Attribute.String;
    session_host_05: Schema.Attribute.String;
    session_host_05_host_type: Schema.Attribute.String;
    session_name: Schema.Attribute.Text;
    session_speakers: Schema.Attribute.Text;
    session_speakers_01: Schema.Attribute.String;
    session_speakers_02: Schema.Attribute.String;
    session_speakers_03: Schema.Attribute.String;
    session_speakers_04: Schema.Attribute.String;
    session_speakers_05: Schema.Attribute.String;
    session_speakers_06: Schema.Attribute.String;
    session_speakers_07: Schema.Attribute.String;
    session_speakers_08: Schema.Attribute.String;
    session_speakers_09: Schema.Attribute.String;
    session_speakers_10: Schema.Attribute.String;
    session_speakers_11: Schema.Attribute.String;
    session_speakers_12: Schema.Attribute.String;
    session_speakers_13: Schema.Attribute.String;
    session_speakers_14: Schema.Attribute.String;
    session_speakers_15: Schema.Attribute.String;
    session_start_time: Schema.Attribute.String;
    session_sub_hall: Schema.Attribute.String;
    session_tags: Schema.Attribute.Text;
    session_tags_01: Schema.Attribute.String;
    session_tags_02: Schema.Attribute.String;
    session_tags_03: Schema.Attribute.String;
    session_tags_04: Schema.Attribute.String;
    session_tags_05: Schema.Attribute.String;
    showInFront: Schema.Attribute.Enumeration<['Yes', 'No']> &
      Schema.Attribute.DefaultTo<'Yes'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiAreaOfExpertiseAreaOfExpertise
  extends Struct.CollectionTypeSchema {
  collectionName: 'area_of_expertises';
  info: {
    description: '';
    displayName: 'AreaOfExpertise';
    pluralName: 'area-of-expertises';
    singularName: 'area-of-expertise';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::area-of-expertise.area-of-expertise'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiBecomeASpeakerBecomeASpeaker
  extends Struct.CollectionTypeSchema {
  collectionName: 'become_a_speakers';
  info: {
    description: '';
    displayName: 'Speaker Interest Form';
    pluralName: 'become-a-speakers';
    singularName: 'become-a-speaker';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    companyName: Schema.Attribute.String;
    consent: Schema.Attribute.Boolean;
    country: Schema.Attribute.String;
    countryCode: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    designation: Schema.Attribute.String;
    firstName: Schema.Attribute.String;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    lastName: Schema.Attribute.String;
    linkedinUrl: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::become-a-speaker.become-a-speaker'
    > &
      Schema.Attribute.Private;
    mobileNumber: Schema.Attribute.String;
    officialEmailAddress: Schema.Attribute.Email & Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    sector: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCompanyListCompanyList extends Struct.CollectionTypeSchema {
  collectionName: 'company_lists';
  info: {
    displayName: 'companyList';
    pluralName: 'company-lists';
    singularName: 'company-list';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    companyName: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::company-list.company-list'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiConferenceTravelInformationFormConferenceTravelInformationForm
  extends Struct.CollectionTypeSchema {
  collectionName: 'conference_travel_information_forms';
  info: {
    displayName: 'Conference Travel Information Form';
    pluralName: 'conference-travel-information-forms';
    singularName: 'conference-travel-information-form';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    alternateContactNumber: Schema.Attribute.String;
    anyOtherSpecificRequests: Schema.Attribute.Text;
    CountryIssue: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dateofBirth: Schema.Attribute.Date;
    dateofReturn: Schema.Attribute.Date;
    dateofTravel: Schema.Attribute.Date;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::conference-travel-information-form.conference-travel-information-form'
    > &
      Schema.Attribute.Private;
    mealPreference: Schema.Attribute.String;
    passengerEMailID: Schema.Attribute.Email;
    passengerFullName: Schema.Attribute.String;
    passengerGender: Schema.Attribute.String;
    passengerMobileNumber: Schema.Attribute.String;
    passportExpiryDate: Schema.Attribute.Date;
    passportNumber: Schema.Attribute.String;
    preferredAirportArrival: Schema.Attribute.String;
    preferredAirportDeparture: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    specialAssistanceRequired: Schema.Attribute.String;
    travelersOriginCountry: Schema.Attribute.String;
    travelFrom: Schema.Attribute.String;
    travelto: Schema.Attribute.String;
    travelType: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    uploadVisa: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    uploadyourPassport: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    visaStatus: Schema.Attribute.String;
  };
}

export interface ApiConfirmedSpeakerConfirmedSpeaker
  extends Struct.CollectionTypeSchema {
  collectionName: 'confirmed_speakers';
  info: {
    description: '';
    displayName: 'Speaker Confirmation Form';
    pluralName: 'confirmed-speakers';
    singularName: 'confirmed-speaker';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    aboutSpeaker: Schema.Attribute.Text;
    additionalMessage: Schema.Attribute.Text;
    biodata: Schema.Attribute.Media<'files'>;
    biodataUrl: Schema.Attribute.String;
    brandName: Schema.Attribute.String;
    buisnessEmailAddress: Schema.Attribute.Email & Schema.Attribute.Unique;
    city: Schema.Attribute.String;
    consent: Schema.Attribute.Boolean;
    country: Schema.Attribute.String;
    countryCode: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    designation: Schema.Attribute.String;
    firstName: Schema.Attribute.String;
    instagramHandle: Schema.Attribute.String;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    lastName: Schema.Attribute.String;
    linkedinurl: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::confirmed-speaker.confirmed-speaker'
    > &
      Schema.Attribute.Private;
    mobileNumber: Schema.Attribute.String;
    organisation: Schema.Attribute.String;
    pocCountry: Schema.Attribute.String;
    pocCountryCode: Schema.Attribute.String;
    pocFirstName: Schema.Attribute.String;
    pocLastName: Schema.Attribute.String;
    pocMobileNumber: Schema.Attribute.String;
    pocOfficialEmailAddress: Schema.Attribute.String;
    profilePhoto: Schema.Attribute.Media<'images'>;
    profilePhotoUrl: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    registeredCompanyName: Schema.Attribute.String;
    state: Schema.Attribute.String;
    title: Schema.Attribute.String;
    twitterHandle: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCountryCountry extends Struct.CollectionTypeSchema {
  collectionName: 'countries';
  info: {
    description: '';
    displayName: 'Country';
    pluralName: 'countries';
    singularName: 'country';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    country: Schema.Attribute.String;
    countryCode: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::country.country'
    > &
      Schema.Attribute.Private;
    mobileMaxLength: Schema.Attribute.Integer;
    mobileMinLength: Schema.Attribute.Integer;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiDelegateDelegate extends Struct.CollectionTypeSchema {
  collectionName: 'delegates';
  info: {
    description: '';
    displayName: 'Delegate';
    pluralName: 'delegates';
    singularName: 'delegate';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    cognitoId: Schema.Attribute.String;
    confirmationId: Schema.Attribute.String;
    country: Schema.Attribute.Relation<'oneToOne', 'api::country.country'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    facilitatorId: Schema.Attribute.Relation<
      'manyToOne',
      'api::facilitator.facilitator'
    >;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    isFacilitator: Schema.Attribute.Boolean;
    linkedinUrl: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::delegate.delegate'
    > &
      Schema.Attribute.Private;
    passPrice: Schema.Attribute.Decimal;
    passType: Schema.Attribute.String;
    pciFccMember: Schema.Attribute.Boolean;
    publishedAt: Schema.Attribute.DateTime;
    registerAsIndividual: Schema.Attribute.Boolean;
    sector: Schema.Attribute.Relation<'oneToOne', 'api::sector.sector'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    wcProductId: Schema.Attribute.String;
    wcProductName: Schema.Attribute.String;
  };
}

export interface ApiEarlyStagePitchEarlyStagePitch
  extends Struct.CollectionTypeSchema {
  collectionName: 'early_stage_pitches';
  info: {
    description: '';
    displayName: 'Investment Pitches Form Export';
    pluralName: 'early-stage-pitches';
    singularName: 'early-stage-pitch';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    companyName: Schema.Attribute.String;
    companyWebsite: Schema.Attribute.String;
    consent: Schema.Attribute.Boolean;
    countryCode: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    emailAddress: Schema.Attribute.Email & Schema.Attribute.Unique;
    firstName: Schema.Attribute.String;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    lastName: Schema.Attribute.String;
    linkedinUrl: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::early-stage-pitch.early-stage-pitch'
    > &
      Schema.Attribute.Private;
    mobileNumber: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiExpressInterestExpressInterest
  extends Struct.CollectionTypeSchema {
  collectionName: 'express_interests';
  info: {
    description: '';
    displayName: 'Express Interest Form';
    pluralName: 'express-interests';
    singularName: 'express-interest';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    companyName: Schema.Attribute.String;
    consent: Schema.Attribute.Boolean;
    countryCode: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    designation: Schema.Attribute.String;
    email: Schema.Attribute.Email & Schema.Attribute.Unique;
    firstName: Schema.Attribute.String;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    IsDelegate: Schema.Attribute.Boolean;
    IsMember: Schema.Attribute.Boolean;
    IsPartnerOrExhibitor: Schema.Attribute.Boolean;
    IsSpeaker: Schema.Attribute.Boolean;
    IsSupporter: Schema.Attribute.Boolean;
    lastName: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::express-interest.express-interest'
    > &
      Schema.Attribute.Private;
    mobileNumber: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    sector: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiFacilitatorFacilitator extends Struct.CollectionTypeSchema {
  collectionName: 'facilitators';
  info: {
    description: '';
    displayName: 'Facilitator';
    pluralName: 'facilitators';
    singularName: 'facilitator';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    cognitoId: Schema.Attribute.String;
    country: Schema.Attribute.Relation<'oneToOne', 'api::country.country'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    delegateConvertedToFacilitator: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    delegates: Schema.Attribute.Relation<'oneToMany', 'api::delegate.delegate'>;
    gstDetails: Schema.Attribute.Component<'common.gst-details', false>;
    invoiceDetails: Schema.Attribute.Component<'common.invoice-details', true>;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    isCognitoVerified: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    linkedinUrl: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::facilitator.facilitator'
    > &
      Schema.Attribute.Private;
    passBought: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    pciFccMember: Schema.Attribute.Boolean;
    publishedAt: Schema.Attribute.DateTime;
    registerAsIndividual: Schema.Attribute.Boolean;
    sector: Schema.Attribute.Relation<'oneToOne', 'api::sector.sector'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    wcCustomerId: Schema.Attribute.String;
    wooOrderDetails: Schema.Attribute.Component<
      'common.woo-order-details',
      true
    >;
  };
}

export interface ApiFaqFaq extends Struct.CollectionTypeSchema {
  collectionName: 'faqs';
  info: {
    description: '';
    displayName: 'FAQs';
    pluralName: 'faqs';
    singularName: 'faq';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    answer: Schema.Attribute.Blocks;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    faqID: Schema.Attribute.UID;
    faqType: Schema.Attribute.Enumeration<
      [
        'Registration & Badges',
        'Access & Pass Details',
        'Attendance & Participation',
        'Networking & Sessions',
        'Venue & Onsite Logistics',
        'Sponsorship & Exhibition',
        'Digital Access & Virtual Participation',
        'Media',
      ]
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::faq.faq'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    question: Schema.Attribute.String;
    showInMobileApp: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    showInRegPage: Schema.Attribute.Boolean;
    showInWeb: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiHotelInformationFormHotelInformationForm
  extends Struct.CollectionTypeSchema {
  collectionName: 'hotel_information_forms';
  info: {
    description: '';
    displayName: 'Hotel Information Form';
    pluralName: 'hotel-information-forms';
    singularName: 'hotel-information-form';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    checkInDate: Schema.Attribute.Date;
    checkOutDate: Schema.Attribute.Date;
    countryCode: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    designation: Schema.Attribute.String;
    firstName: Schema.Attribute.String;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    lastName: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::hotel-information-form.hotel-information-form'
    > &
      Schema.Attribute.Private;
    middleName: Schema.Attribute.String;
    mobileNumber: Schema.Attribute.String;
    nationality: Schema.Attribute.String;
    noOfRoomsRequired: Schema.Attribute.Integer;
    occupancyType: Schema.Attribute.String;
    officialEmailAddress: Schema.Attribute.Email & Schema.Attribute.Unique;
    organisation: Schema.Attribute.String;
    otherSource: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    referralSource: Schema.Attribute.String;
    specialRequest: Schema.Attribute.String;
    travellingFrom: Schema.Attribute.String;
    travellingTo: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiHotelHotel extends Struct.CollectionTypeSchema {
  collectionName: 'hotels';
  info: {
    description: '';
    displayName: 'Hotel';
    pluralName: 'hotels';
    singularName: 'hotel';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    hotelName: Schema.Attribute.String;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::hotel.hotel'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiLogLog extends Struct.CollectionTypeSchema {
  collectionName: 'logs';
  info: {
    description: '';
    displayName: 'Logs';
    pluralName: 'logs';
    singularName: 'log';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    additionalInfo: Schema.Attribute.JSON;
    cognitoId: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::log.log'> &
      Schema.Attribute.Private;
    logType: Schema.Attribute.Enumeration<['Success', 'Error']>;
    message: Schema.Attribute.String;
    origin: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    referenceId: Schema.Attribute.Integer;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    userType: Schema.Attribute.String;
  };
}

export interface ApiMicroSiteHomePageMicroSiteHomePage
  extends Struct.CollectionTypeSchema {
  collectionName: 'micro_site_home_pages';
  info: {
    description: '';
    displayName: 'microSiteHomePage';
    pluralName: 'micro-site-home-pages';
    singularName: 'micro-site-home-page';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::micro-site-home-page.micro-site-home-page'
    > &
      Schema.Attribute.Private;
    logoSection: Schema.Attribute.Component<'common.logo-section', true>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiMobileAppAreasofInterestMobileAppAreasofInterest
  extends Struct.CollectionTypeSchema {
  collectionName: 'mobile_app_areasof_interests';
  info: {
    description: '';
    displayName: 'mobileAppAreasofInterests';
    pluralName: 'mobile-app-areasof-interests';
    singularName: 'mobile-app-areasof-interest';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::mobile-app-areasof-interest.mobile-app-areasof-interest'
    > &
      Schema.Attribute.Private;
    mobileAppAreasofInterestsID: Schema.Attribute.UID;
    mobileAppAreasofInterestsName: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiMobileAppNetworkingGoalMobileAppNetworkingGoal
  extends Struct.CollectionTypeSchema {
  collectionName: 'mobile_app_networking_goals';
  info: {
    displayName: 'MobileAppNetworkingGoals';
    pluralName: 'mobile-app-networking-goals';
    singularName: 'mobile-app-networking-goal';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::mobile-app-networking-goal.mobile-app-networking-goal'
    > &
      Schema.Attribute.Private;
    mobileAppNetworkingGoalsID: Schema.Attribute.UID;
    mobileAppNetworkingGoalsName: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiMobileAppPurposeofAttendanceMobileAppPurposeofAttendance
  extends Struct.CollectionTypeSchema {
  collectionName: 'mobile_app_purposeof_attendances';
  info: {
    displayName: 'MobileAppPurposeofAttendance';
    pluralName: 'mobile-app-purposeof-attendances';
    singularName: 'mobile-app-purposeof-attendance';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::mobile-app-purposeof-attendance.mobile-app-purposeof-attendance'
    > &
      Schema.Attribute.Private;
    mobileAppPurposeofAttendancesID: Schema.Attribute.UID;
    mobileAppPurposeofAttendancesName: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiMobileAppTextPageMobileAppTextPage
  extends Struct.CollectionTypeSchema {
  collectionName: 'mobile_app_text_pages';
  info: {
    displayName: 'MobileAppTextPage';
    pluralName: 'mobile-app-text-pages';
    singularName: 'mobile-app-text-page';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::mobile-app-text-page.mobile-app-text-page'
    > &
      Schema.Attribute.Private;
    MobileAppTextPageContent: Schema.Attribute.Blocks;
    MobileAppTextPageTitle: Schema.Attribute.String;
    MobileAppTextPageUID: Schema.Attribute.UID;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiNabardHackathonNabardHackathon
  extends Struct.CollectionTypeSchema {
  collectionName: 'nabard_hackathons';
  info: {
    description: '';
    displayName: 'nabardHackathon';
    pluralName: 'nabard-hackathons';
    singularName: 'nabard-hackathon';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    city: Schema.Attribute.String;
    country: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    declarationAgreeRulesDecisions: Schema.Attribute.String;
    declarationInformationAccurate: Schema.Attribute.String;
    declarationPitchDate: Schema.Attribute.String;
    hackathonName: Schema.Attribute.String;
    hackathonPartiDescription: Schema.Attribute.Text;
    hackathonPartiProblem: Schema.Attribute.String;
    hackathonPartiTechStack: Schema.Attribute.String;
    institutionOrganization: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::nabard-hackathon.nabard-hackathon'
    > &
      Schema.Attribute.Private;
    prototypeAddressProblem: Schema.Attribute.String;
    prototypeDemoLink: Schema.Attribute.String;
    prototypeDescription: Schema.Attribute.Blocks;
    prototypeFeatures: Schema.Attribute.Blocks;
    prototypeImpact: Schema.Attribute.String;
    prototypeInnovation: Schema.Attribute.Blocks;
    prototypeName: Schema.Attribute.String;
    prototypeStage: Schema.Attribute.String;
    prototypeUniqueSolution: Schema.Attribute.Text;
    publishedAt: Schema.Attribute.DateTime;
    state: Schema.Attribute.String;
    teamLeaderAgeGroup: Schema.Attribute.String;
    teamLeaderEmailId: Schema.Attribute.Email;
    teamLeaderFirstName: Schema.Attribute.String;
    teamLeaderLastName: Schema.Attribute.String;
    teamLeaderLinkedInURL: Schema.Attribute.String;
    teamLeaderMobileNumber: Schema.Attribute.String;
    teamLeaderSignature: Schema.Attribute.String;
    teamLeaderSignatureImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    teamMembers: Schema.Attribute.String;
    teamMembers01Email: Schema.Attribute.String;
    teamMembers01FirstName: Schema.Attribute.String;
    teamMembers01LastName: Schema.Attribute.String;
    teamMembers01Role: Schema.Attribute.String;
    teamMembers02Email: Schema.Attribute.String;
    teamMembers02FirstName: Schema.Attribute.String;
    teamMembers02LastName: Schema.Attribute.String;
    teamMembers02Role: Schema.Attribute.String;
    teamMembers03Email: Schema.Attribute.String;
    teamMembers03FirstName: Schema.Attribute.String;
    teamMembers03LastName: Schema.Attribute.String;
    teamMembers03Role: Schema.Attribute.String;
    teamMembers04Email: Schema.Attribute.String;
    teamMembers04FirstName: Schema.Attribute.String;
    teamMembers04LastName: Schema.Attribute.String;
    teamMembers04Role: Schema.Attribute.String;
    teamName: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiNewProductLaunchFormNewProductLaunchForm
  extends Struct.CollectionTypeSchema {
  collectionName: 'new_product_launch_forms';
  info: {
    description: '';
    displayName: 'New Product Launch Form';
    pluralName: 'new-product-launch-forms';
    singularName: 'new-product-launch-form';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    company: Schema.Attribute.String;
    consent: Schema.Attribute.Boolean;
    countryCode: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    designation: Schema.Attribute.String;
    isProductAlreadyLaunched: Schema.Attribute.String;
    liveDemo: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::new-product-launch-form.new-product-launch-form'
    > &
      Schema.Attribute.Private;
    mobileNumber: Schema.Attribute.String;
    name: Schema.Attribute.String;
    officialEmailAddress: Schema.Attribute.Email & Schema.Attribute.Unique;
    otherPreferredLaunchFormat: Schema.Attribute.String;
    otherProductTechnology: Schema.Attribute.String;
    otherProductTrack: Schema.Attribute.String;
    otherProductType: Schema.Attribute.String;
    participationRole: Schema.Attribute.String;
    preferredLaunchFormat: Schema.Attribute.String;
    productBriefDescription: Schema.Attribute.Text;
    productInnovative: Schema.Attribute.String;
    productMeasurableImpact: Schema.Attribute.String;
    productName: Schema.Attribute.String;
    productPrimaryTarget: Schema.Attribute.String;
    productStages: Schema.Attribute.Relation<
      'oneToMany',
      'api::product-stage.product-stage'
    >;
    productTechnologies: Schema.Attribute.Relation<
      'oneToMany',
      'api::product-technology.product-technology'
    >;
    productTracks: Schema.Attribute.Relation<
      'oneToMany',
      'api::product-track.product-track'
    >;
    productTypes: Schema.Attribute.Relation<
      'oneToMany',
      'api::product-type.product-type'
    >;
    proposedLaunchDate: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiNewsletterNewsletter extends Struct.CollectionTypeSchema {
  collectionName: 'newsletters';
  info: {
    description: '';
    displayName: 'Newsletter Subscription';
    pluralName: 'newsletters';
    singularName: 'newsletter';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email & Schema.Attribute.Unique;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::newsletter.newsletter'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPartnerPartner extends Struct.CollectionTypeSchema {
  collectionName: 'partners';
  info: {
    description: '';
    displayName: 'Partner';
    pluralName: 'partners';
    singularName: 'partner';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::partner.partner'
    > &
      Schema.Attribute.Private;
    partnerfeatureinHomePage: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    partnerID: Schema.Attribute.UID<'partnerName'>;
    partnerLogo: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    > &
      Schema.Attribute.Required;
    partnerLogoAltText: Schema.Attribute.String;
    partnerName: Schema.Attribute.String & Schema.Attribute.Required;
    partnerPriority: Schema.Attribute.Decimal;
    partnerSubType: Schema.Attribute.Enumeration<
      [
        'Co-Powered By',
        'Technology Partner',
        'Brought to you by',
        'Associate Partners',
        'Consent Partner',
        'Payment Enabler',
        'Registration Partner',
        'Cloud Communications Partner',
        'Speaker Lounge Partner',
        'Banking Innovation Partner',
        'By-Invite Dinner Partners',
        'Diamond Partners',
        'Credit Insights Partner',
        'Credit Innovation Partner',
        'Gourmet Partner',
        'Platinum Partner',
        'Charging Station Partner',
        'Notepad Partner',
        'Caffeine Partner',
        'Gold Partners',
        'Spend Management Partner',
        'Silver Partners',
        'Mobile App Security Partner',
        'Bronze Partners',
        'VIP Lounge Partner',
        'Beer Booth Partner',
        'Banking Transformation Partner',
        'Financial Inclusion Partner',
        'Innovation Leadership Partner',
      ]
    >;
    partnerType: Schema.Attribute.Enumeration<
      ['Partners', 'Exhibitors', 'Supporters', 'Ecosystem', 'Organisers']
    > &
      Schema.Attribute.Required;
    partnerWebURL: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPartnersHomePagePartnersHomePage
  extends Struct.CollectionTypeSchema {
  collectionName: 'partners_home_pages';
  info: {
    description: '';
    displayName: 'Home Page Scroller Logos';
    pluralName: 'partners-home-pages';
    singularName: 'partners-home-page';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::partners-home-page.partners-home-page'
    > &
      Schema.Attribute.Private;
    partner_hp_id: Schema.Attribute.UID;
    Partner_hp_logo_alt_text: Schema.Attribute.String;
    partner_hp_name: Schema.Attribute.String & Schema.Attribute.Required;
    partner_hp_priority: Schema.Attribute.Decimal;
    partner_hp_uploadlogo: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    Partner_hp_web_url: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPartnersInvestmentPitchesPagePartnersInvestmentPitchesPage
  extends Struct.CollectionTypeSchema {
  collectionName: 'partners_investment_pitches_pages';
  info: {
    description: '';
    displayName: 'ES Investment Pitch Logos';
    pluralName: 'partners-investment-pitches-pages';
    singularName: 'partners-investment-pitches-page';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::partners-investment-pitches-page.partners-investment-pitches-page'
    > &
      Schema.Attribute.Private;
    partner_ip_id: Schema.Attribute.UID;
    partner_ip_logo_alt_text: Schema.Attribute.String;
    partner_ip_name: Schema.Attribute.String;
    partner_ip_priority: Schema.Attribute.Decimal;
    partner_ip_uploadlogo: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    > &
      Schema.Attribute.Required;
    partner_ip_web_url: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPlanYourStayPlanYourStay
  extends Struct.CollectionTypeSchema {
  collectionName: 'plan_your_stays';
  info: {
    description: '';
    displayName: 'Plan Your Stay Form';
    pluralName: 'plan-your-stays';
    singularName: 'plan-your-stay';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    businessEmailAddress: Schema.Attribute.Email & Schema.Attribute.Unique;
    checkInDate: Schema.Attribute.Date;
    checkOutDate: Schema.Attribute.Date;
    countryCode: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    designation: Schema.Attribute.String;
    firstName: Schema.Attribute.String;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    lastName: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::plan-your-stay.plan-your-stay'
    > &
      Schema.Attribute.Private;
    mobileNumber: Schema.Attribute.String;
    noOfRoomsRequired: Schema.Attribute.Integer;
    occupancyType: Schema.Attribute.String;
    organisation: Schema.Attribute.String;
    otherSource: Schema.Attribute.String;
    preferredHotel: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    referralSource: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPostConferenceReportForm2024PostConferenceReportForm2024
  extends Struct.CollectionTypeSchema {
  collectionName: 'post_conference_report_forms_2024';
  info: {
    description: '';
    displayName: 'Post Conference Report Forms 2024';
    pluralName: 'post-conference-report-forms-2024';
    singularName: 'post-conference-report-form-2024';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    consent: Schema.Attribute.Boolean;
    countryCode: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    designation: Schema.Attribute.String;
    fullName: Schema.Attribute.String;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::post-conference-report-form-2024.post-conference-report-form-2024'
    > &
      Schema.Attribute.Private;
    mobileNumber: Schema.Attribute.String;
    officialEmailAddress: Schema.Attribute.Email & Schema.Attribute.Unique;
    organisation: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiProductPreferredLaunchFormatProductPreferredLaunchFormat
  extends Struct.CollectionTypeSchema {
  collectionName: 'product_preferred_launch_formats';
  info: {
    displayName: 'Product Preferred Launch Formats';
    pluralName: 'product-preferred-launch-formats';
    singularName: 'product-preferred-launch-format';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::product-preferred-launch-format.product-preferred-launch-format'
    > &
      Schema.Attribute.Private;
    productPreferredLaunchFormat: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiProductPrimaryTargetProductPrimaryTarget
  extends Struct.CollectionTypeSchema {
  collectionName: 'product_primary_targets';
  info: {
    displayName: 'Product Primary Targets';
    pluralName: 'product-primary-targets';
    singularName: 'product-primary-target';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::product-primary-target.product-primary-target'
    > &
      Schema.Attribute.Private;
    productPrimaryTarget: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiProductStageProductStage
  extends Struct.CollectionTypeSchema {
  collectionName: 'product_stages';
  info: {
    displayName: 'Product Stages';
    pluralName: 'product-stages';
    singularName: 'product-stage';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::product-stage.product-stage'
    > &
      Schema.Attribute.Private;
    productStage: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiProductTechnologyProductTechnology
  extends Struct.CollectionTypeSchema {
  collectionName: 'product_technologies';
  info: {
    description: '';
    displayName: 'Product Technologies';
    pluralName: 'product-technologies';
    singularName: 'product-technology';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::product-technology.product-technology'
    > &
      Schema.Attribute.Private;
    productTechnology: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiProductTrackProductTrack
  extends Struct.CollectionTypeSchema {
  collectionName: 'product_tracks';
  info: {
    displayName: 'Product Tracks';
    pluralName: 'product-tracks';
    singularName: 'product-track';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::product-track.product-track'
    > &
      Schema.Attribute.Private;
    productTrack: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiProductTypeProductType extends Struct.CollectionTypeSchema {
  collectionName: 'product_types';
  info: {
    description: '';
    displayName: 'Product Types';
    pluralName: 'product-types';
    singularName: 'product-type';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::product-type.product-type'
    > &
      Schema.Attribute.Private;
    productType: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiReferralSourceReferralSource
  extends Struct.CollectionTypeSchema {
  collectionName: 'referral_sources';
  info: {
    description: '';
    displayName: 'Referral Source';
    pluralName: 'referral-sources';
    singularName: 'referral-source';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::referral-source.referral-source'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    referralSource: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiRegistrationFaqRegistrationFaq
  extends Struct.CollectionTypeSchema {
  collectionName: 'registration_faqs';
  info: {
    description: '';
    displayName: 'RegistrationFaq';
    pluralName: 'registration-faqs';
    singularName: 'registration-faq';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    answer: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::registration-faq.registration-faq'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    question: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiRegularPageRegularPage extends Struct.CollectionTypeSchema {
  collectionName: 'regular_pages';
  info: {
    description: '';
    displayName: 'Regular Page';
    pluralName: 'regular-pages';
    singularName: 'regular-page';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::regular-page.regular-page'
    > &
      Schema.Attribute.Private;
    pageID: Schema.Attribute.UID;
    pageName: Schema.Attribute.String;
    PageSections: Schema.Attribute.DynamicZone<
      [
        'common-components.reg-text',
        'common-components.hero-section',
        'common-components.tracks-section',
        'common-components.cm-image-title-text-cta',
        'common-components.title-text-icon-title-text-slider',
        'common-components.icon-title-slider',
        'common-components.small-title-title-title-icon-bg-image',
        'common-components.road-shows',
        'common-components.locations',
        'common-components.cta-block01',
      ]
    >;
    publishedAt: Schema.Attribute.DateTime;
    SEOSettings: Schema.Attribute.Component<'shared.seo', false>;
    SocialSettings: Schema.Attribute.Component<'shared.open-graph', true>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiSalutationSalutation extends Struct.CollectionTypeSchema {
  collectionName: 'salutations';
  info: {
    description: '';
    displayName: 'salutation';
    pluralName: 'salutations';
    singularName: 'salutation';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::salutation.salutation'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiSectorSector extends Struct.CollectionTypeSchema {
  collectionName: 'sectors';
  info: {
    description: '';
    displayName: 'Sector';
    pluralName: 'sectors';
    singularName: 'sector';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::sector.sector'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiSessionTagSessionTag extends Struct.CollectionTypeSchema {
  collectionName: 'session_tags';
  info: {
    displayName: 'sessionTag';
    pluralName: 'session-tags';
    singularName: 'session-tag';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    agenda_dd: Schema.Attribute.Relation<
      'manyToOne',
      'api::agenda-dd.agenda-dd'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::session-tag.session-tag'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    sessionTagName: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiSpeakerSpeaker extends Struct.CollectionTypeSchema {
  collectionName: 'speakers';
  info: {
    description: '';
    displayName: 'speaker';
    pluralName: 'speakers';
    singularName: 'speaker';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    agenda_dd: Schema.Attribute.Relation<
      'manyToOne',
      'api::agenda-dd.agenda-dd'
    >;
    bio: Schema.Attribute.Text;
    companyName: Schema.Attribute.String;
    country: Schema.Attribute.Relation<'oneToOne', 'api::country.country'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    desgination: Schema.Attribute.String;
    featureinHomePage: Schema.Attribute.Boolean;
    fullName: Schema.Attribute.String & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'> &
      Schema.Attribute.Required;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    linkedinProfile: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::speaker.speaker'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    salutation: Schema.Attribute.Enumeration<
      ['Shri', 'Mr.', 'Ms.', 'Mrs', 'Dr.', 'Smt.', 'Lt']
    > &
      Schema.Attribute.Required;
    speakerId: Schema.Attribute.UID;
    speakerPriorityinHomePage: Schema.Attribute.Decimal;
    speakerPriorityinSpeakerPage: Schema.Attribute.Decimal;
    speakerType: Schema.Attribute.Enumeration<
      ['One - Tier 1', 'Two - Category A', 'Three - Category B']
    > &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiSpeaker2024Speaker2024 extends Struct.CollectionTypeSchema {
  collectionName: 'speakers2024';
  info: {
    description: '';
    displayName: 'speaker2024';
    pluralName: 'speakers2024';
    singularName: 'speaker2024';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    biodata: Schema.Attribute.Text;
    companyName: Schema.Attribute.String;
    country: Schema.Attribute.Relation<'oneToOne', 'api::country.country'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    designation: Schema.Attribute.String;
    fullName: Schema.Attribute.String;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    linkedinUrl: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::speaker2024.speaker2024'
    > &
      Schema.Attribute.Private;
    profilePhoto: Schema.Attribute.Media<'images'>;
    publishedAt: Schema.Attribute.DateTime;
    rank: Schema.Attribute.Integer;
    salutation: Schema.Attribute.Enumeration<
      ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.', 'Shri', 'Smt.']
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiThoughtLeadershipReportFormThoughtLeadershipReportForm
  extends Struct.CollectionTypeSchema {
  collectionName: 'thought_leadership_report_forms';
  info: {
    displayName: 'Thought Leadership Report Form';
    pluralName: 'thought-leadership-report-forms';
    singularName: 'thought-leadership-report-form';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    briefAbstract: Schema.Attribute.Text;
    consent: Schema.Attribute.Boolean;
    countryCode: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    designation: Schema.Attribute.String;
    externalCollaborators: Schema.Attribute.String;
    finalDocument: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    finalDocumentUrl: Schema.Attribute.String;
    formats: Schema.Attribute.Relation<
      'oneToMany',
      'api::thought-leadership-report-format.thought-leadership-report-format'
    >;
    gff2025Tracks: Schema.Attribute.Relation<
      'oneToMany',
      'api::thought-leadership-report-gff2025-track.thought-leadership-report-gff2025-track'
    >;
    isContentPublished: Schema.Attribute.String;
    isContentPublishedOther: Schema.Attribute.String;
    keyProblem: Schema.Attribute.String;
    keyTechnologiesCovered: Schema.Attribute.Relation<
      'oneToMany',
      'api::thought-leadership-report-key-technology-covered.thought-leadership-report-key-technology-covered'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::thought-leadership-report-form.thought-leadership-report-form'
    > &
      Schema.Attribute.Private;
    mobileNumber: Schema.Attribute.String;
    name: Schema.Attribute.String;
    officialEmailAddress: Schema.Attribute.Email & Schema.Attribute.Unique;
    officialPartner: Schema.Attribute.String;
    organisation: Schema.Attribute.String;
    otherFormat: Schema.Attribute.String;
    otherGff2025Track: Schema.Attribute.String;
    otherKeyTechnologiesCovered: Schema.Attribute.String;
    otherPrimaryTargetAudience: Schema.Attribute.String;
    primaryTargetAudience: Schema.Attribute.String;
    proposeASpeakerOrPanelToAccompanyTheRelease: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    titleOfTheContent: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiThoughtLeadershipReportFormatThoughtLeadershipReportFormat
  extends Struct.CollectionTypeSchema {
  collectionName: 'thought_leadership_report_formats';
  info: {
    displayName: 'Thought Leadership Report Formats';
    pluralName: 'thought-leadership-report-formats';
    singularName: 'thought-leadership-report-format';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    format: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::thought-leadership-report-format.thought-leadership-report-format'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiThoughtLeadershipReportGff2025TrackThoughtLeadershipReportGff2025Track
  extends Struct.CollectionTypeSchema {
  collectionName: 'thought_leadership_report_gff2025_tracks';
  info: {
    description: '';
    displayName: 'Thought Leadership Report Gff2025 Tracks';
    pluralName: 'thought-leadership-report-gff2025-tracks';
    singularName: 'thought-leadership-report-gff2025-track';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::thought-leadership-report-gff2025-track.thought-leadership-report-gff2025-track'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    track: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiThoughtLeadershipReportKeyTechnologyCoveredThoughtLeadershipReportKeyTechnologyCovered
  extends Struct.CollectionTypeSchema {
  collectionName: 'thought_leadership_report_key_technologies_covereds';
  info: {
    displayName: 'Thought Leadership Report Key Technologies Covered';
    pluralName: 'thought-leadership-report-key-technologies-covereds';
    singularName: 'thought-leadership-report-key-technology-covered';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::thought-leadership-report-key-technology-covered.thought-leadership-report-key-technology-covered'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    technology: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiThoughtLeadershipReportPrimaryTargetAudienceThoughtLeadershipReportPrimaryTargetAudience
  extends Struct.CollectionTypeSchema {
  collectionName: 'thought_leadership_report_primary_target_audiences';
  info: {
    displayName: 'Thought Leadership Report Primary Target Audiences';
    pluralName: 'thought-leadership-report-primary-target-audiences';
    singularName: 'thought-leadership-report-primary-target-audience';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::thought-leadership-report-primary-target-audience.thought-leadership-report-primary-target-audience'
    > &
      Schema.Attribute.Private;
    primaryTargetAudience: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesRelease
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    releasedAt: Schema.Attribute.DateTime;
    scheduledAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Schema.Attribute.Required;
    timezone: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    entryDocumentId: Schema.Attribute.String;
    isEntryValid: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    release: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Schema.Attribute.Enumeration<['publish', 'unpublish']> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::i18n.locale'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflow
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows';
  info: {
    description: '';
    displayName: 'Workflow';
    name: 'Workflow';
    pluralName: 'workflows';
    singularName: 'workflow';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentTypes: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    stageRequiredToPublish: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::review-workflows.workflow-stage'
    >;
    stages: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflowStage
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows_stages';
  info: {
    description: '';
    displayName: 'Stages';
    name: 'Workflow Stage';
    pluralName: 'workflow-stages';
    singularName: 'workflow-stage';
  };
  options: {
    draftAndPublish: false;
    version: '1.1.0';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#4945FF'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    permissions: Schema.Attribute.Relation<'manyToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    workflow: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::review-workflows.workflow'
    >;
  };
}

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Schema.Attribute.String;
    caption: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    ext: Schema.Attribute.String;
    folder: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'> &
      Schema.Attribute.Private;
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    formats: Schema.Attribute.JSON;
    hash: Schema.Attribute.String & Schema.Attribute.Required;
    height: Schema.Attribute.Integer;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.file'
    > &
      Schema.Attribute.Private;
    mime: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    previewUrl: Schema.Attribute.String;
    provider: Schema.Attribute.String & Schema.Attribute.Required;
    provider_metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    related: Schema.Attribute.Relation<'morphToMany'>;
    size: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.String & Schema.Attribute.Required;
    width: Schema.Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    files: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.folder'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    parent: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'>;
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    pathId: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.role'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.String & Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  attributes: {
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    confirmationToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ContentTypeSchemas {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::agenda-dd.agenda-dd': ApiAgendaDdAgendaDd;
      'api::agenda.agenda': ApiAgendaAgenda;
      'api::area-of-expertise.area-of-expertise': ApiAreaOfExpertiseAreaOfExpertise;
      'api::become-a-speaker.become-a-speaker': ApiBecomeASpeakerBecomeASpeaker;
      'api::company-list.company-list': ApiCompanyListCompanyList;
      'api::conference-travel-information-form.conference-travel-information-form': ApiConferenceTravelInformationFormConferenceTravelInformationForm;
      'api::confirmed-speaker.confirmed-speaker': ApiConfirmedSpeakerConfirmedSpeaker;
      'api::country.country': ApiCountryCountry;
      'api::delegate.delegate': ApiDelegateDelegate;
      'api::early-stage-pitch.early-stage-pitch': ApiEarlyStagePitchEarlyStagePitch;
      'api::express-interest.express-interest': ApiExpressInterestExpressInterest;
      'api::facilitator.facilitator': ApiFacilitatorFacilitator;
      'api::faq.faq': ApiFaqFaq;
      'api::hotel-information-form.hotel-information-form': ApiHotelInformationFormHotelInformationForm;
      'api::hotel.hotel': ApiHotelHotel;
      'api::log.log': ApiLogLog;
      'api::micro-site-home-page.micro-site-home-page': ApiMicroSiteHomePageMicroSiteHomePage;
      'api::mobile-app-areasof-interest.mobile-app-areasof-interest': ApiMobileAppAreasofInterestMobileAppAreasofInterest;
      'api::mobile-app-networking-goal.mobile-app-networking-goal': ApiMobileAppNetworkingGoalMobileAppNetworkingGoal;
      'api::mobile-app-purposeof-attendance.mobile-app-purposeof-attendance': ApiMobileAppPurposeofAttendanceMobileAppPurposeofAttendance;
      'api::mobile-app-text-page.mobile-app-text-page': ApiMobileAppTextPageMobileAppTextPage;
      'api::nabard-hackathon.nabard-hackathon': ApiNabardHackathonNabardHackathon;
      'api::new-product-launch-form.new-product-launch-form': ApiNewProductLaunchFormNewProductLaunchForm;
      'api::newsletter.newsletter': ApiNewsletterNewsletter;
      'api::partner.partner': ApiPartnerPartner;
      'api::partners-home-page.partners-home-page': ApiPartnersHomePagePartnersHomePage;
      'api::partners-investment-pitches-page.partners-investment-pitches-page': ApiPartnersInvestmentPitchesPagePartnersInvestmentPitchesPage;
      'api::plan-your-stay.plan-your-stay': ApiPlanYourStayPlanYourStay;
      'api::post-conference-report-form-2024.post-conference-report-form-2024': ApiPostConferenceReportForm2024PostConferenceReportForm2024;
      'api::product-preferred-launch-format.product-preferred-launch-format': ApiProductPreferredLaunchFormatProductPreferredLaunchFormat;
      'api::product-primary-target.product-primary-target': ApiProductPrimaryTargetProductPrimaryTarget;
      'api::product-stage.product-stage': ApiProductStageProductStage;
      'api::product-technology.product-technology': ApiProductTechnologyProductTechnology;
      'api::product-track.product-track': ApiProductTrackProductTrack;
      'api::product-type.product-type': ApiProductTypeProductType;
      'api::referral-source.referral-source': ApiReferralSourceReferralSource;
      'api::registration-faq.registration-faq': ApiRegistrationFaqRegistrationFaq;
      'api::regular-page.regular-page': ApiRegularPageRegularPage;
      'api::salutation.salutation': ApiSalutationSalutation;
      'api::sector.sector': ApiSectorSector;
      'api::session-tag.session-tag': ApiSessionTagSessionTag;
      'api::speaker.speaker': ApiSpeakerSpeaker;
      'api::speaker2024.speaker2024': ApiSpeaker2024Speaker2024;
      'api::thought-leadership-report-form.thought-leadership-report-form': ApiThoughtLeadershipReportFormThoughtLeadershipReportForm;
      'api::thought-leadership-report-format.thought-leadership-report-format': ApiThoughtLeadershipReportFormatThoughtLeadershipReportFormat;
      'api::thought-leadership-report-gff2025-track.thought-leadership-report-gff2025-track': ApiThoughtLeadershipReportGff2025TrackThoughtLeadershipReportGff2025Track;
      'api::thought-leadership-report-key-technology-covered.thought-leadership-report-key-technology-covered': ApiThoughtLeadershipReportKeyTechnologyCoveredThoughtLeadershipReportKeyTechnologyCovered;
      'api::thought-leadership-report-primary-target-audience.thought-leadership-report-primary-target-audience': ApiThoughtLeadershipReportPrimaryTargetAudienceThoughtLeadershipReportPrimaryTargetAudience;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow;
      'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
