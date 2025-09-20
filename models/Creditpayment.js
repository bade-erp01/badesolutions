const mongoose = require('mongoose')

const CreditPaymentSchema = new mongoose.Schema( {  
    type:{
        type:String,
        enum:['Cash', 'Transfer'],
        required:true
    },
    paymentReferenceNo:{
        type:String,
        // unique:true,
        required: true, // Ensures it's always provided
        index: true, // Improves lookup speed
        trim: true // Removes unnecessary spaces
    },
    BillNo:{
        type: String,
    },
    Accountant:{//person who actions the payment
        type:String,
    },
    ActivityLog:Array,
    Attachment:String,
    status:{
        type:String,
        default:'pending',
        enum:['pending', 'posted', 'Reversed']
    },
    PaymentDate:String,
    bankAccount:{
        type: String,
    },
    remarks:String,
    customer: {
        type: mongoose.Types.ObjectId,
        required: false,
    },
    previousBalance:Number,
    crAmount:{
        type:Number,
        default:0
    },
    drAmount:{
        type:Number,
        default:0
    },
    collectionRef:{
        type:String,
        enum:["VNB","PMNT","EXP","TRNS","EXT-PYMT"],
        required:true,
    },
    cr:{
        type:Boolean
    },
    dr:{
        type:Boolean
    },
    ActitvityLog:[],
     tenantId: {
          type: mongoose.Types.ObjectId,
          ref: "Business",
          required: true,
          index: true,
          immutable: true,
        },
        image:{
            type:String,
            default:'https://img.icons8.com/dusk/64/cash-in-hand.png',
            required:true
        }
      },
      { timestamps: true });  
       
       
       // Middleware to enforce tenant scoping and unique constraints
       // Static methods for tenant-based queries
       CreditPaymentSchema.statics.findByTenant = function (tenantId, filter = {}) {
         return this.find({ tenantId, ...filter });
       };
       
       CreditPaymentSchema.statics.createForTenant = function (tenantId, businessData) {
         return this.create({ ...businessData, tenantId });
       };
       
       const  CreditCustomerPayment = mongoose.models.creditPayment || mongoose.model("creditPayment", CreditPaymentSchema);
       // this schema is for bank journal postings

module.exports = CreditCustomerPayment