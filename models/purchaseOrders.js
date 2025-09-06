import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    item:{
        type:Object,
        required:true,
    },
    Qty:{
        type:Number,
        default:0   
    },
    roll:{
        type:Number,
        default:0   
    },
    total:{
        type:Number,
        default:0   
    },
    ExpDate:{
        type:String,
        default:''   
    },
    Status:{
        type:String,
        default:'',  
    },
    BatchNo:{
        type:String,
        default:''   
    },
    storeproductId:{
        type:mongoose.Types.ObjectId,
        ref: 'storeProduct',
        required: true, 
    },
})

const AttachedSchema = new mongoose.Schema({
    Url:{
        type:String,
    },

})

const PurchaseOrderSchema = new mongoose.Schema({
    Vendor: {
        type: String,
        ref: 'Vendor',
        // required: true,
    },
    WHID: {
        type: String,
        ref: 'WHous',
        // required: true,
    },
    orders: [orderSchema],
    shippingFee: { type: Number,default:0 },
    subTotal: { type: Number ,default:0},
    grandTotal: { type: Number,default:0 },
    discount: { type: Number, default:0},
    taxRate: {type:Number,default:0},
    billReferenceNo: {
    type: String,
    required:true,
    index:true,
    default: () => `RFP-${Date.now()}`
    },
    paymentStatus: {
        type: String,
        default:'pending'
    },
    PaymentRef:String,
    ActivityLog: [],
    recievedDate:String,
    Attachment: [AttachedSchema],
    CFO:{
        type:String,
    },
    AmountPaid:{
        type:Number,
        default:0
    },
    PaymentDate:String,
    bankAccount:{
        type: String,
    },
    status:{
        type:String,
        default:'Draft',
    },
    StoreKeeperConfirmation : {
        type:Boolean,
        default:false,
    },
    RejectionReason:{
        type:String
    },
    ReturnQty :{
        type:Number,
        default:0,
    },
    Remarks:String,
    transferedDate:String,
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
    PurchaseOrderSchema.statics.findByTenant = function (tenantId, filter = {}) {
      return this.find({ tenantId, ...filter });
    };
    
    PurchaseOrderSchema.statics.createForTenant = function (tenantId, businessData) {
      return this.create({ ...businessData, tenantId });
    };
    
    const PurchaseOrder = mongoose.models.PurchaseOrder || mongoose.model("PurchaseOrder", PurchaseOrderSchema);

module.exports = PurchaseOrder