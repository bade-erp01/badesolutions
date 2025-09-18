const mongoose = require("mongoose");
const { isEmail } = require("validator");
const  {BusinessOnboardingMail} = require('../EmailTrigers/BusinessOnboarding')
const moment = require('moment')

// Schema for application modules
const appSchema = new mongoose.Schema({
  id:{type:Number},
  Name: { type: String ,index:true},
  url: { type: String, required: [true, "Please provide a URL"], index: true },
  icon: { type: String, required: [true, "Please provide an icon URL"] },
  installed: { type: Boolean, default: false },
  Description: { type: String, default: "No description provided" },
  alt: { type: String },
  amount: { type: Number, default: 0 },
});

// Main Business Schema
const businessSchema = new mongoose.Schema(
  {
     isVerified:{//status to activate and checkemail. this should only work once.
      type:Boolean,
      default:false,
      index:true,
      reuired:true
    },
    isActive:{//tatus to deactivate a busineess via proxi incase of false dealings
      type:Boolean,
      default:false,
      index:true,
      reuired:true
    },
    subscriptionEndDate: { 
      type: String,
      default:moment().add(1, 'year').format("YYYY-MM-DD"),
      required:true,
      index:true
     },//date to monitor subscription
    email: {
      type: String,
      required: [true, "Please enter an Email"],
      unique: true,
      lowercase: true,
      validate: [isEmail, "Please enter a valid Email"],
      index:true,
      immutable: true, // Prevent modification after creation
    },
    companyName: { 
      type: String,
       required: true ,
       immutable: true, // Prevent modification after creation
    },
    address: { type: String },
    Tel: {
      type: String,
      required: [true, "Please provide a phone number"],
      unique: true,
      index:true
    },
    companyCity: { type: String },
    companyState: { type: String },
    companyZip: { type: String },
    companyLogo: { type: String },
    invoicePolicy: { type: String },
    shopAddress: { type: String },
    themecolor: { type: String },
    inactiveTimeout: { type: String },
    allowCreditLimit: { type: String, enum: ["", "Customer", "Warehouse"], default: "" },
    autoLog: { type: Boolean, default: false },
    clearNotification: { type: String, enum: ["", "Daily", "Monthly"], default: "" },
    dailyReport: { type: Boolean, default: false },
    monthlyCutStatement: { type: Boolean, default: false },
    allowPriceChangeOnInvoice: { type: Boolean, default: false },
    allowSkuSplitting: { type: Boolean, default: false },
    mapLocation: { type: String },
    modules: [appSchema],
    Pendinglicense:{
      type:Number,
      default:0,
      index:true,
      required:true
    },
    currency: {
      type: Object,
      default: {
        flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/nigeria.png",
        countryName: "Nigeria",
        currency: "Naira",
        code: "NGN",
        symbol: "₦",
      },
    },
    payStackApiKey: {
      type: String,
      required: false,
      select: false,
      validate: {
        validator: (v) => /^[a-zA-Z0-9_]{32,}$/i.test(v),
        message: "Invalid PayStack API key format",
      },
      // immutable: true, // Prevent modification after creation
    },
     priceList1: {
      type: String,
      required: true,
      default: "Pricelist1",
    },
     priceList2: {
      type: String,
      required: true,
      default: "Pricelist2",
    },
     priceList3: {
      type: String,
      required: true,
      default: "Pricelist3",
    },
     priceList4: {
      type: String,
      required: true,
      default: "Pricelist4",
    },
     priceList5: {
      type: String,
      required: true,
      default: "Pricelist5",
    },
     priceList6: {
      type: String,
      required: true,
      default: "Pricelist6",
    },
     priceList7: {
      type: String,
      required: true,
      default: "Pricelist7",
    },
    subscriptionplan:{
      type:String,
      required:true,
      enum:['Basic',"Standard"]
    },
    SubcriptionAmount:{
      type:Number,
      required:true,
      inex:true
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      index: true,
      default: () => new mongoose.Types.ObjectId(),
      immutable: true, // Prevent modification after creation
    },
    BusinessType:{
       type:String,
       enum:['Business',"Individual"]
    },
    industryType:{
       type:String,
    }
  },
  { timestamps: true }
);

// Middleware to enforce tenant scoping and unique constraints
businessSchema.pre("save", async function (next) {
//   console.log("Pre-save validation triggered for:", this);

  try {
    if (this.isNew) {
      const existingBusiness = await this.constructor.findOne({
        $or:[ { email: this.email, Tel: this.Tel }]
        });

      if (existingBusiness) {
        return next(new Error("Email and Phone Number must be unique"));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});


// businessSchema.pre('findOne', function(next) {
//   if (!this.getQuery().tenantId) {
//     return next(new Error('Tenant ID is required for all queries.'));
//   }
//   next();  
// });

// businessSchema.pre('find', function(next) {
//   if (!this.getQuery().tenantId) {
//     return next(new Error('Tenant ID is required for all queries.'));
//   }
//   next();
// });


//send Activation Email to business after creation
businessSchema.post("save", async function (doc, next) {
  await BusinessOnboardingMail(doc)
});

// Static methods for tenant-based queries
businessSchema.statics.findByTenant = function (tenantId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

// businessSchema.statics.createForTenant = function (tenantId, businessData) {
//   return this.create({ ...businessData, tenantId });
// };

// Ensure the model is not recompiled in Next.js hot reload 
const Business = mongoose.models.Business || mongoose.model("Business", businessSchema);

module.exports =  Business;
