const { Decimal128 } = require("mongodb");
const mongoose = require("mongoose");
const { isEmail } = require("validator");
import {generateQRCode,Encrypt} from "../Functions/Functions"

const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true, // ✅ Ensure comment is always provided
    trim: true, // ✅ Removes unnecessary spaces
    maxlength: 500 // ✅ Prevent overly long comments
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, // ✅ Use ObjectId to reference a user model
    ref: "User", // ✅ Reference the User collection
    required: true
  },
  rating: {
    type: mongoose.Types.Decimal128, // ✅ Use correct Decimal128 type
    default: 0,
    min: 0,
    max: 5,
    required: true, // ✅ Ensure rating is always provided
    validate: { 
      validator: (value) => value >= 0 && value <= 5, // ✅ Extra validation
      message: "Rating must be between 0 and 5"
    }
  }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: [true, "Provide a Product Name"],
      index: true,
    },
    category: { type: String },
    image: {
      type: String,
      default:'/preview.png',
      required:true
    },
    Pricelist1: {  type: String, required: true,default:0},
    Pricelist2: {  type: String, required: true,default:0},
    Pricelist3: {  type: String, required: true,default:0},
    Pricelist4: {  type: String, required: true,default:0},
    Pricelist5: {  type: String,required:  true,default:0},
    Pricelist6: {  type: String, required: true,default:0},
    Pricelist7: {  type: String, required: true,default:0},
    Vendor: { 
      type:mongoose.Types.ObjectId,
       required: [true, "Provide vendor"],
       ref:'Vendor',
    },
    UMO: { type: String },
    color: { type: String },
    Description: { type: String },
    Sellable: {//is inventory product and can be purchased
      required: false,
      type: String,
      default: "false",
      enum:['true','false','on','off']
    },
    isAservice:{
      type: Boolean,
      default: false,
    },
    Ecom_sale: {
      required: false,
      type: String,
      default: "false",
      enum:['true','false','on','off']
    },
    Manufacturer: { type: String },
    VAT: {  type: Decimal128, default: 0 },
    ActivityLog: {
      type: Array,
    },
    TotalSale:{
      type:Number,
      default:0,
      index:true
    },
    comments:[commentSchema],
    Rolls:{
      type:Number,
      default:1,
      immutable:true
    },
    Pricelist1Promo:{
     type: String,
      default:0,
    },
    Pricelist2Promo:{
       type: String,
      default:0,
    },
    Pricelist3Promo:{
       type: String,
      default:0,
    },
    Pricelist4Promo: {  type: String, required: true,default:0 },
    Pricelist5Promo: {  type: String, required: true,default:0 },
    Pricelist6Promo: {  type: String, required: true,default:0 },
    Pricelist7Promo: {  type: String, required: true,default:0 },
    HistoricalPrice:[],
    BuyingPrice:{  type: String, default:0, },
    Pieces:{
      type:Number,
      default:1
    },
    QrCode:{
      type: String,
      default:''
    },
    FOCID:{//this id is the copied object Id of a cloned object
      type: String,
      default:''
    },
    CopyID:{//this id is the original object Id of a cloned object
      type: String,
      default:''
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business', // Reference to the Tenant collection
      required: true,
      index: true, // Index for faster queries by tenantId
      immutable: true, 
    },
  },
  { timestamps: true }
);

// Middleware to enforce tenant scoping
ProductSchema.pre('save', function (next) {
  if (!this.tenantId) {
    return next(new Error('Tenant ID is required for multi-tenant architecture.'));
  }
  next();
});

// ProductSchema.pre('find', function(next) {
//   if (!this.getQuery().tenantId) {
//     return next(new Error('Tenant ID is required for all queries.'));
//   }
//   next();
// });

// ProductSchema.pre('findOne', function(next) {
//   if (!this.getQuery().tenantId) {
//     return next(new Error('Tenant ID is required for all queries.'));
//   }
//   next();
// });

//notify admin of product creation
ProductSchema.post("save", async function (doc, next) {
  try {
    // Generate QR code for the product
    const tenantId = doc.tenantId.toString(); // Ensure tenantId is a string
    const productSlug = doc._id.toString(); // Use the product's ObjectId as the slug
    const module = "products"; // Assuming "products" is the module name

    const productUrl = `/auth/${Encrypt(tenantId)}/module/${Encrypt(module)}/${Encrypt(productSlug)}`;
    const qrCode = await generateQRCode(productUrl);

    // Update the document using `updateOne`
    // Update the document directly
    doc.QrCode = qrCode;
    await doc.save();

    // Send mail that a new product has been created


    next();
  } catch (error) {
    console.error("Error updating QR Code:", error);
    next(error);
  }
});


// Static method to find products by tenant
ProductSchema.statics.findByTenant = function (tenantId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

// Static method to create a product scoped to a tenant
ProductSchema.statics.createForTenant = function (tenantId, productData) {
  return this.create({ ...productData, tenantId });
};

// Ensure the model is not recompiled to prevent OverwriteModelError
const PRODUCTS = mongoose.models.PRODUCTS || mongoose.model('PRODUCTS', ProductSchema);

module.exports = PRODUCTS;
