import type { Schema, Struct } from '@strapi/strapi';

export interface CommonComponentsCmImageTitleTextCta
  extends Struct.ComponentSchema {
  collectionName: 'components_common_components_cm_image_title_text_ctas';
  info: {
    displayName: 'CMImageTitleTextCTA';
  };
  attributes: {
    imageTitleTextCTA: Schema.Attribute.Component<
      'repeatable-componnets.content-module-image-title-text-cta-link',
      true
    >;
  };
}

export interface CommonComponentsHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_common_components_hero_sections';
  info: {
    description: '';
    displayName: 'Hero Section';
    icon: 'apps';
  };
  attributes: {
    CTALink: Schema.Attribute.String;
    CTAText: Schema.Attribute.String;
    HeroHeadline: Schema.Attribute.String;
    HeroText: Schema.Attribute.Text;
    MobileImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    TabletDesktopHeroImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
  };
}

export interface CommonComponentsRegText extends Struct.ComponentSchema {
  collectionName: 'components_common_components_reg_texts';
  info: {
    displayName: 'Reg Text';
    icon: 'bulletList';
  };
  attributes: {
    RegularText: Schema.Attribute.Blocks;
  };
}

export interface CommonComponentsTracksSection extends Struct.ComponentSchema {
  collectionName: 'components_common_components_tracks_sections';
  info: {
    displayName: 'Tracks Section';
  };
  attributes: {
    eachTrackItem: Schema.Attribute.Component<
      'repeatable-componnets.track-item-icon-title-desc',
      true
    >;
    Title: Schema.Attribute.String;
  };
}

export interface CommonGstDetails extends Struct.ComponentSchema {
  collectionName: 'components_common_gst_details';
  info: {
    description: '';
    displayName: 'GstDetails';
  };
  attributes: {
    billingAddress: Schema.Attribute.Text;
    companyAddress: Schema.Attribute.Text;
    companyGstNo: Schema.Attribute.String;
    companyName: Schema.Attribute.String;
    companyPOC: Schema.Attribute.String;
    isCompanyAddressSameAsBilling: Schema.Attribute.Boolean;
    pincode: Schema.Attribute.String;
  };
}

export interface CommonLogo extends Struct.ComponentSchema {
  collectionName: 'components_common_logos';
  info: {
    description: '';
    displayName: 'logo';
  };
  attributes: {
    altText: Schema.Attribute.String;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    mobileImage: Schema.Attribute.Media<'images' | 'files'>;
    title: Schema.Attribute.String;
    webImage: Schema.Attribute.Media<'images' | 'files'>;
  };
}

export interface CommonLogoSection extends Struct.ComponentSchema {
  collectionName: 'components_common_logo_sections';
  info: {
    displayName: 'logo-section';
  };
  attributes: {
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    logos: Schema.Attribute.Component<'common.logo', true>;
    sectionTitle: Schema.Attribute.String;
  };
}

export interface CommonPartnerShowInPage extends Struct.ComponentSchema {
  collectionName: 'components_common_partner_show_in_pages';
  info: {
    description: '';
    displayName: 'partnerShowInPage';
  };
  attributes: {
    pages: Schema.Attribute.Enumeration<
      [
        'Home Page Slider',
        'Home Page GFF 2025 Partners Section',
        'Investment Pitches at GFF 2025 LeftSide Below Content',
      ]
    >;
  };
}

export interface CommonWooOrderDetails extends Struct.ComponentSchema {
  collectionName: 'components_common_woo_order_details';
  info: {
    description: '';
    displayName: 'WooOrderDetails';
  };
  attributes: {
    crmRegistrationPaymentId: Schema.Attribute.String;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    totalAmount: Schema.Attribute.Decimal;
    wcOrderId: Schema.Attribute.String;
    wcOrderStatus: Schema.Attribute.String;
  };
}

export interface RepeatableComponnetsContentModuleImageTitleTextCtaLink
  extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_componnets_content_module_image_title_text_cta_links';
  info: {
    displayName: 'contentModuleImageTitleTextCTALink';
  };
  attributes: {
    ctaLink: Schema.Attribute.String;
    ctaText: Schema.Attribute.String;
    text: Schema.Attribute.String;
    title: Schema.Attribute.String;
    uploadImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
  };
}

export interface RepeatableComponnetsTrackItemIconTitleDesc
  extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_componnets_track_item_icon_title_descs';
  info: {
    displayName: 'TrackItem_IconTitleDesc';
  };
  attributes: {
    Description: Schema.Attribute.Text;
    Icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    Title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'common-components.cm-image-title-text-cta': CommonComponentsCmImageTitleTextCta;
      'common-components.hero-section': CommonComponentsHeroSection;
      'common-components.reg-text': CommonComponentsRegText;
      'common-components.tracks-section': CommonComponentsTracksSection;
      'common.gst-details': CommonGstDetails;
      'common.logo': CommonLogo;
      'common.logo-section': CommonLogoSection;
      'common.partner-show-in-page': CommonPartnerShowInPage;
      'common.woo-order-details': CommonWooOrderDetails;
      'repeatable-componnets.content-module-image-title-text-cta-link': RepeatableComponnetsContentModuleImageTitleTextCtaLink;
      'repeatable-componnets.track-item-icon-title-desc': RepeatableComponnetsTrackItemIconTitleDesc;
    }
  }
}
