const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
        item:{
            type:Object,
            required:true,
        },
        BatchId:{
            type:String,
        },
        ExpiryDate:{
            type:String,
        },
        CRT:{
            type:Number,
            default:0,
        },
        ROL:{
            type:Number,
            default:0,
        },
        RCRT:{
            type:Number,
            default:0,
        },
        RROL:{
            type:Number,
            default:0,
        },
        RPCS:{
            type:Number,
            default:0,
        },
        Qty:{
            type:Number,
            default:0,
        },
        pcsAvL:{//from store product Arrays
            type:Number,
            default:0,
        },
        pcsReq:{//requested pcs value from invoice
            type:Number,
            default:0,
        },
        total:{
            type:Number,
            default:0,
        },
        priceListPrice:{
            type:Number,
            required:true,
            default:0,
        },
        ROLQTY:{
            type:Number,
            default:0,
        },
        returnId:{
            type:String,
            default:'',
            enum:['','WH/IN','WH/OUT']

        },
        promotionData:{
            type:Number,
            default:0
        },
        storeProductId:{
        type:String,
        required: true, 
        },
        vat:{
            type:Number,
            default:0
        }
})

//credit note tracking array
const creditNoteSchema = new mongoose.Schema({
    creditNoteId:{
        type:mongoose.Types.ObjectId,
        ref:'Bills',
        required:true,
    },
    creditNoteNo:{
        type:String,
        // required:true,
        // unique:true,
    },
})

//comment note tracking array
const commentSchema = new mongoose.Schema({
    Comment:{
        type:String,
    },
    user:{
        type:String,
    },
    date:{
        type:String,
    }
})

const BillsSchema = new mongoose.Schema({
    customer:{
        type:mongoose.Types.ObjectId,ref:'customers',
        required:true,
    },
    grandTotal:{type:Number, default:0},
    shippingFee:{type:Number, default:0},
    subTotal:{type:Number, default:0},
    startDate:{
        type:String,
        required:true,
    },
    paymentMethod:{type:String},
    orders:[orderSchema],
    promotionItems:[],
    billStatus:{
        type:String,
        default:'Draft',
        enum:['Draft','Order','Invoice','Cancelled']
    },
    status:{
        type:String,
    },
    discount:{type:Number, default:0},
    taxRate:{type:Number, default:0},
    whId:{
        type:mongoose.Types.ObjectId,
        ref:'WHouse',
        required:true,
    },
    RaiseBy:{type:String},
    signatureUrl:{type:String},
    ActivityLog:[],
    isDelivered:{type:Boolean,default:false},//for delivery
    DELIVERYDATE:{type:Date},//delivery date of delivery order
    billReferenceNo:{
        type:String,
        index:true,
    },//reference to each bill
    DriverNumber:String,
    DriverName:String,
    vehicleNumber:String,
    DeliveryComment:String,
    customerName:String,
    whProductId:mongoose.Types.ObjectId,//to map back to store object of product  so we can reduce quantity
    AccountantId:{
        type:mongoose.Types.ObjectId,
        ref:'EMPLOYEES',
    },
    AccountantName:{
        type: String,
    },
    WayBillNo:String,
    salesPerson:{
        type:mongoose.Types.ObjectId,
        ref:'EMPLOYEES',
    },
    invoicelocation:{type:String,required:true},
    priceList:String,
    CN:[creditNoteSchema],
    Comments:[commentSchema],
    invoicerId:{
        type:mongoose.Types.ObjectId,
        ref:'EMPLOYEES',
    },
    // paymentStatus:{
    //     type:Object,
    //     default:'Pending',
    //     enum:['Pending','Paid','Partially Paid']
    // }
    paymentStatus: {
        type: Object,
        default: {
            paymentStatus: 'Pending',
            paidDate: null,
            paidAmount: 0,
            paymentMethod: null,
            transactionReference: null,
        },
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
   BillsSchema.statics.findByTenant = function (tenantId, filter = {}) {
     return this.find({ tenantId, ...filter });
   };
   
   BillsSchema.statics.createForTenant = function (tenantId, businessData) {
     return this.create({ ...businessData, tenantId });
   };
   
   const  Invoice = mongoose.models.bill || mongoose.model("bill", BillsSchema);
   

module.exports = Invoice