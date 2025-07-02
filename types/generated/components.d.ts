import type { Schema, Struct } from '@strapi/strapi';

export interface CommonComponentsHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_common_components_hero_sections';
  info: {
    displayName: 'Hero Section';
    icon: 'apps';
  };
  attributes: {
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

export interface CommonGstDetails extends Struct.ComponentSchema {
  collectionName: 'components_common_gst_details';
  info: {
    displayName: 'GstDetails';
  };
  attributes: {
    billingAddress: Schema.Attribute.Text;
    companyAddress: Schema.Attribute.Text;
    companyGstNo: Schema.Attribute.String;
    companyName: Schema.Attribute.String;
    companyPOC: Schema.Attribute.String;
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

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'common-components.hero-section': CommonComponentsHeroSection;
      'common-components.reg-text': CommonComponentsRegText;
      'common.gst-details': CommonGstDetails;
      'common.logo': CommonLogo;
      'common.logo-section': CommonLogoSection;
      'common.partner-show-in-page': CommonPartnerShowInPage;
      'common.woo-order-details': CommonWooOrderDetails;
    }
  }
}
