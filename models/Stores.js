const mongoose = require('mongoose');
const { isEmail} = require('validator');
const { Decimal128 } = require("mongodb");

const SkuOpeningSchema = new mongoose.Schema({
product:{
type:mongoose.Types.ObjectId,
ref:'storeProduct',
required:true,
},
productName:{type:String},
Vendor:{
type:mongoose.Types.ObjectId,
ref:'Vendors',
required:true,
},
OpeningROLL:{type:Number},
OpeningCRTN:{type:Number},
Date:{type:String, required:true},
WareHouse:{
type:mongoose.Types.ObjectId,
ref:'WHouse',
required:true,
},
BuyingPrice:{type:Decimal128},
value:{type:Number, required:true},
remark:{type:String},
tenantId: {
type: mongoose.Types.ObjectId,
ref: "Business",
required: true,
index: true,
immutable: true,
},
},
{ timestamps: true }
);

// Middleware to enforce tenant scoping and unique constraints
// Static methods for tenant-based queries
SkuOpeningSchema.statics.findByTenant = function (tenantId, filter = {}) {
return this.find({ tenantId, ...filter });
};

SkuOpeningSchema.statics.createForTenant = function (tenantId, businessData) {
return this.create({ ...businessData, tenantId });
};

const SkuOpening = mongoose.models.OpeningPNL || mongoose.model("OpeningPNL", SkuOpeningSchema);





const StorageSchema = new mongoose.Schema({
productId:{
type:mongoose.Types.ObjectId,
ref:'products',
required:true,
},
Vendor: {
type:mongoose.Types.ObjectId,
required: [true, "Provide vendor"],
ref:'vendors',
},
ADCcode:{
type:String
},
productName:String,
UOM:String,
image:String,
isActivated:{
type:Boolean,
default:true
},
autoReplenishment:{
type:Boolean,
default:false
},
replenishQty:{
type:Number,
default:0
},
WHIDS:{
type:mongoose.Types.ObjectId,
ref:'WHouse',
required:true,
index:true
},
currentQty:{
type:Number,
default:0,
index:true
},
replenishBy:{
type:String,
},
pendings:{
type:Number,
default:0
},
replenishMin:{
type:Number,
default:0
},
isAservice:{
type: Boolean,
required:true,
default: false,
},
ActivitiyLog:[],
mailsent:{
type:Boolean,
default:false
},
Rolls:{
type:Number,
default:0,
immutable:true
},
pcs:{
type:Number,
default:0
},
vendorName:String,
category:String,
ExpDate:{
type:String,
default:'',
},
BatchNo:{
type:String,
default:'',
},
LastBatchDate:{
type:String,
default:'',
},
VendorPrice:{
type:Number,
default:0
},
Van_Price:{
type:Number,
default:0
},
Market_Price:{
type:Number,
default:0
},
WareHouse_Price:{
type:Number,
default:0
},
Pricelist4Promo: { type: Number, required: true, default: 0 },
Pricelist5Promo: { type: Number, required: true, default: 0 },
Pricelist6Promo: { type: Number, required: true, default: 0 },
Pricelist7Promo: { type: Number, required: true, default: 0 },
QrCode:{
type:String,
default:'',
},
FOCProId:{
type:String,
default:'',
}, tenantId: {
type: mongoose.Types.ObjectId,
ref: "Business",
required: true,
index: true,
immutable: true,
},
},
{ timestamps: true }
);

// Middleware to enforce tenant scoping and unique constraints
// Static methods for tenant-based queries
StorageSchema.statics.findByTenant = function (tenantId, filter = {}) {
return this.find({ tenantId, ...filter });
};

StorageSchema.statics.createForTenant = function (tenantId, businessData) {
return this.create({ ...businessData, tenantId });
};

const storeProduct = mongoose.models.storeProduct || mongoose.model("storeProduct", StorageSchema);




const WHSchema = new mongoose.Schema({
WHName:{
type : String,
required:true,
lowercase:true
},
toRecive:[],
Bills:[],
Storage:[ StorageSchema ],
Notification:{
type:Array,
},
expense:{
type:Array,
},
Tel:{
type:String,
},
Email:{
type:String,
lowercase:true,
},
Status:{
type:Boolean,
default:false,
},
state:{
type:String,
},
InvoiceNo:{
type:String,
required:true,
unique: true,
index:true,
},
StoreKeeper:{
type:String,
},
Documents:{
type:Array,
},
WHIDS:{
type: String,
},
Note:{
type:Array,
},
Manager:String,
Scrap:{
type:Array,
},
Address:String,
location:{
type:String,
ref:'location',
},
limit:{
type:Decimal128,
default:0.00,
required:true,
},
Invoicer:{
type:String
},
image:{
    type:String,
    default:'https://img.icons8.com/officel/80/shop.png'
},
tenantId: {
type: mongoose.Types.ObjectId,
ref: "Business",
required: true,
index: true,
immutable: true,
},
},
{ timestamps: true }
);

// Middleware to enforce tenant scoping and unique constraints
// Static methods for tenant-based queries
WHSchema.statics.findByTenant = function (tenantId, filter = {}) {
return this.find({ tenantId, ...filter });
};

WHSchema.statics.createForTenant = function (tenantId, businessData) {
return this.create({ ...businessData, tenantId });
};

const WHouse = mongoose.models.WHouse || mongoose.model("WHouse", WHSchema);


module.exports = {WHouse,SkuOpening,storeProduct};