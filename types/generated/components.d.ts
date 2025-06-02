import type { Schema, Struct } from '@strapi/strapi';

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

export interface CommonWooOrderDetails extends Struct.ComponentSchema {
  collectionName: 'components_common_woo_order_details';
  info: {
    displayName: 'WooOrderDetails';
  };
  attributes: {
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    totalAmount: Schema.Attribute.Decimal;
    wcOrderId: Schema.Attribute.String;
    wcOrderStatus: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'common.gst-details': CommonGstDetails;
      'common.woo-order-details': CommonWooOrderDetails;
    }
  }
}
