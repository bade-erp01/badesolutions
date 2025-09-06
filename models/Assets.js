const mongoose = require('mongoose');
const { Decimal128 } = require("mongodb");
const { isEmail} = require('validator');

const AssetSchema = new  mongoose.Schema({
    Name:{
        required: true,
        lowercase: true,
        unique: true,
        type: String,
    },
    modelName:{
        type: String,
        lowercase: true,
    },
    SerialNumber:{
        type:String,
        lowercase: true,
        unique: true,
    },
    PurchasedValue:{
        type:Number,
        default:0,
        required: true
    },
    PurchsedDate:{
        required: true,
        type:String,
    },
    ResidualValue:{
        type: Decimal128,
        default:0,
        required: true
    },
    DepreciationType:String,
    CurrentValue:{
        type:Number,
        default:0,
        required: true
    },
    AssetCode:{
        type:String,
        unique:true,
        required: true
    },
    runDepreciation:{
        type:Boolean,
        default:false

    },
    Category:String,
    status:{
        type: String,
        required: true,
        default:"Running",
        enum: ["Running", 'Depreciated','']
    },
    AssignedTo:{
       type: String,
    },
    AcivityLog:Array,
    Image:String,
    color:String,
    usefulYear:Number,
    id:String,
    vendor:String,
    depreciationStartDate:String,
    description:String,
        CycleCount:{
            type: Number,
            default:0,
        },
    tenantId: {
            type: mongoose.Types.ObjectId,
            ref: 'Business',
            required: true,
            index: true,
            immutable:true
        }
  },{timestamps:true},);  


// Middleware to enforce tenant scoping and unique constraints
// Static methods for tenant-based queries
AssetSchema.statics.findByTenant = function (tenantId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

AssetSchema.statics.createForTenant = function (tenantId, businessData) {
  return this.create({ ...businessData, tenantId });
};

const  ASSETS = mongoose.models.Asset || mongoose.model("Asset", AssetSchema);


module.exports = ASSETS;