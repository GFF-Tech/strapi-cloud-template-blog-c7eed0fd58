import type { Schema, Struct } from '@strapi/strapi';

export interface CommonComponentsCmImageTitleTextCta
  extends Struct.ComponentSchema {
  collectionName: 'components_common_components_cm_image_title_text_ctas';
  info: {
    description: '';
    displayName: 'CM04 CMImageTitleTextCTA';
  };
  attributes: {
    imageTitleTextCTA: Schema.Attribute.Component<
      'repeatable-componnets.content-module-image-title-text-cta-link',
      true
    >;
    Settings: Schema.Attribute.Component<
      'common-components.module-settings',
      false
    >;
  };
}

export interface CommonComponentsCtaBlock01 extends Struct.ComponentSchema {
  collectionName: 'components_common_components_cta_block01s';
  info: {
    description: '';
    displayName: 'CM09 CTABlock01';
    icon: 'cup';
  };
  attributes: {
    CTALink: Schema.Attribute.String;
    CTAText: Schema.Attribute.String;
    Settings: Schema.Attribute.Component<
      'common-components.module-settings',
      false
    >;
    Text: Schema.Attribute.Text;
    Title: Schema.Attribute.Text;
  };
}

export interface CommonComponentsHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_common_components_hero_sections';
  info: {
    description: '';
    displayName: 'CM02 Hero Section';
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
    Settings: Schema.Attribute.Component<
      'common-components.module-settings',
      false
    >;
    TabletDesktopHeroImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
  };
}

export interface CommonComponentsIconTitleSlider
  extends Struct.ComponentSchema {
  collectionName: 'components_common_components_icon_title_sliders';
  info: {
    description: '';
    displayName: 'CM06 TitleTwoWayiconTitleSliders';
  };
  attributes: {
    iconTitleSliderLeftToRight: Schema.Attribute.Component<
      'repeatable-componnets.icon-title',
      true
    >;
    iconTitleSliderRightToLeft: Schema.Attribute.Component<
      'repeatable-componnets.icon-title',
      true
    >;
    ModuleTitle: Schema.Attribute.String;
    Settings: Schema.Attribute.Component<
      'common-components.module-settings',
      false
    >;
  };
}

export interface CommonComponentsLocations extends Struct.ComponentSchema {
  collectionName: 'components_common_components_locations';
  info: {
    displayName: 'Locations';
    icon: 'pinMap';
  };
  attributes: {
    eachLocation: Schema.Attribute.Component<
      'repeatable-componnets.bg-image-title-location-sub-location',
      true
    >;
    Settings: Schema.Attribute.Component<
      'common-components.module-settings',
      false
    >;
  };
}

export interface CommonComponentsModuleSettings extends Struct.ComponentSchema {
  collectionName: 'components_common_components_module_settings';
  info: {
    description: '';
    displayName: 'ModuleSettings';
    icon: 'cog';
  };
  attributes: {
    BackgroundColor: Schema.Attribute.String;
  };
}

export interface CommonComponentsRegText extends Struct.ComponentSchema {
  collectionName: 'components_common_components_reg_texts';
  info: {
    description: '';
    displayName: 'CM01 Reg Text';
    icon: 'bulletList';
  };
  attributes: {
    RegularText: Schema.Attribute.Blocks;
    Settings: Schema.Attribute.Component<
      'common-components.module-settings',
      false
    >;
  };
}

export interface CommonComponentsRoadShows extends Struct.ComponentSchema {
  collectionName: 'components_common_components_road_shows';
  info: {
    description: '';
    displayName: 'CM10 RoadShows';
  };
  attributes: {
    roadShow: Schema.Attribute.Component<
      'repeatable-componnets.each-road-show',
      true
    >;
    Settings: Schema.Attribute.Component<
      'common-components.module-settings',
      false
    >;
  };
}

export interface CommonComponentsSmallTitleTitleTitleIconBgImage
  extends Struct.ComponentSchema {
  collectionName: 'components_common_components_small_title_title_title_icon_bg_images';
  info: {
    description: '';
    displayName: 'CM07 SmallTitleTitle_TitleIconBGImage';
  };
  attributes: {
    Settings: Schema.Attribute.Component<
      'common-components.module-settings',
      false
    >;
    smallTitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
    TitleIconBGImage: Schema.Attribute.Component<
      'repeatable-componnets.title-icon-bg-image',
      true
    >;
  };
}

export interface CommonComponentsTitleTextIconTitleTextSlider
  extends Struct.ComponentSchema {
  collectionName: 'components_common_components_title_text_icon_title_text_sliders';
  info: {
    description: '';
    displayName: 'CM05 TitleText_IconTitleTextSlider';
  };
  attributes: {
    IconTitleText: Schema.Attribute.Component<
      'repeatable-componnets.icon-title-text',
      true
    >;
    Settings: Schema.Attribute.Component<
      'common-components.module-settings',
      false
    >;
    Text: Schema.Attribute.Text;
    Title: Schema.Attribute.String;
  };
}

export interface CommonComponentsTracksSection extends Struct.ComponentSchema {
  collectionName: 'components_common_components_tracks_sections';
  info: {
    description: '';
    displayName: 'CM03 Tracks Section';
  };
  attributes: {
    eachTrackItem: Schema.Attribute.Component<
      'repeatable-componnets.track-item-icon-title-desc',
      true
    >;
    Settings: Schema.Attribute.Component<
      'common-components.module-settings',
      false
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

export interface CommonInvoiceDetails extends Struct.ComponentSchema {
  collectionName: 'components_common_invoice_details';
  info: {
    description: '';
    displayName: 'InvoiceDetails';
  };
  attributes: {
    amountPaid: Schema.Attribute.String;
    invoiceLink: Schema.Attribute.String;
    invoiceNumber: Schema.Attribute.String;
    paymentDate: Schema.Attribute.String;
    wcOrderId: Schema.Attribute.String;
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

export interface RepeatableComponnetsBgImageTitleLocationSubLocation
  extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_componnets_bg_image_title_location_sub_locations';
  info: {
    displayName: 'BGImageTitleLocationSubLocation';
  };
  attributes: {
    BGImage: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    Location: Schema.Attribute.String;
    SubLocation: Schema.Attribute.String;
    Title: Schema.Attribute.String;
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

export interface RepeatableComponnetsEachRoadShow
  extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_componnets_each_road_shows';
  info: {
    displayName: 'EachRoadShow';
    icon: 'chartCircle';
  };
  attributes: {
    RoadShowBGImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    RSIGalleryImages: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    RSIHoverText: Schema.Attribute.Text;
    RSIHoverTitle: Schema.Attribute.String;
  };
}

export interface RepeatableComponnetsIconTitle extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_componnets_icon_titles';
  info: {
    displayName: 'IconTitle';
  };
  attributes: {
    Title: Schema.Attribute.String;
    uploadIcon: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
  };
}

export interface RepeatableComponnetsIconTitleText
  extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_componnets_icon_title_texts';
  info: {
    displayName: 'iconTitleText';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface RepeatableComponnetsTitleIconBgImage
  extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_componnets_title_icon_bg_images';
  info: {
    displayName: 'TitleIconBGImage';
  };
  attributes: {
    CornerBGImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    Icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    Title: Schema.Attribute.String;
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

export interface SharedOpenGraph extends Struct.ComponentSchema {
  collectionName: 'components_shared_open_graphs';
  info: {
    displayName: 'openGraph';
    icon: 'project-diagram';
  };
  attributes: {
    ogDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    ogImage: Schema.Attribute.Media<'images'>;
    ogTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    ogType: Schema.Attribute.String;
    ogUrl: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'seo';
    icon: 'search';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
        minLength: 50;
      }>;
    metaImage: Schema.Attribute.Media<'images'>;
    metaRobots: Schema.Attribute.String;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    metaViewport: Schema.Attribute.String;
    openGraph: Schema.Attribute.Component<'shared.open-graph', false>;
    structuredData: Schema.Attribute.JSON;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'common-components.cm-image-title-text-cta': CommonComponentsCmImageTitleTextCta;
      'common-components.cta-block01': CommonComponentsCtaBlock01;
      'common-components.hero-section': CommonComponentsHeroSection;
      'common-components.icon-title-slider': CommonComponentsIconTitleSlider;
      'common-components.locations': CommonComponentsLocations;
      'common-components.module-settings': CommonComponentsModuleSettings;
      'common-components.reg-text': CommonComponentsRegText;
      'common-components.road-shows': CommonComponentsRoadShows;
      'common-components.small-title-title-title-icon-bg-image': CommonComponentsSmallTitleTitleTitleIconBgImage;
      'common-components.title-text-icon-title-text-slider': CommonComponentsTitleTextIconTitleTextSlider;
      'common-components.tracks-section': CommonComponentsTracksSection;
      'common.gst-details': CommonGstDetails;
      'common.invoice-details': CommonInvoiceDetails;
      'common.logo': CommonLogo;
      'common.logo-section': CommonLogoSection;
      'common.partner-show-in-page': CommonPartnerShowInPage;
      'common.woo-order-details': CommonWooOrderDetails;
      'repeatable-componnets.bg-image-title-location-sub-location': RepeatableComponnetsBgImageTitleLocationSubLocation;
      'repeatable-componnets.content-module-image-title-text-cta-link': RepeatableComponnetsContentModuleImageTitleTextCtaLink;
      'repeatable-componnets.each-road-show': RepeatableComponnetsEachRoadShow;
      'repeatable-componnets.icon-title': RepeatableComponnetsIconTitle;
      'repeatable-componnets.icon-title-text': RepeatableComponnetsIconTitleText;
      'repeatable-componnets.title-icon-bg-image': RepeatableComponnetsTitleIconBgImage;
      'repeatable-componnets.track-item-icon-title-desc': RepeatableComponnetsTrackItemIconTitleDesc;
      'shared.open-graph': SharedOpenGraph;
      'shared.seo': SharedSeo;
    }
  }
}
