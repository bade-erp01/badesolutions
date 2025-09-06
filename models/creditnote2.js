const mongoose = require('mongoose');
const moment = require('moment')

function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
  
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  
    return result;
}

const creditNote2 = new mongoose.Schema({
   customerId:{
     type:mongoose.Types.ObjectId,
     ref: 'Customer',
     required: true,
   },
   customer:{
    type:String,
    required: true,
  },
   Total:{
    type:Number,
    default:0 
   },
   status:{
     type: String,
     default: 'Open',
     enum:['Closed','Open','Reversed',],
     required:true,
   },
   Date:String,
   CreditId:{
    type: String,
    unique:true,
    uppercase:true,
   },
   raisedBy:{
    type: String,
   },
   ApprovedBy:{
    type: String,
   },
   ActivityLog:[],
   reference:String,
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
   creditNote2.statics.findByTenant = function (tenantId, filter = {}) {
     return this.find({ tenantId, ...filter });
   };
   
   creditNote2.statics.createForTenant = function (tenantId, businessData) {
     return this.create({ ...businessData, tenantId });
   };
   
   
   
   
   // Pre-save hook 
   creditNote2.pre('save', async function(next) {
     try {
       
       this.CreditId = `C/CN-${generateRandomString(Math.random() + 4)}`
       this.ActivityLog.push({message:`${this.raisedBy} Generated ${this.CreditId} on ${this.Date}`})
       
       next();
      } catch (error) {
        next(error);
      }
    });
    
    const  CustomerMemo = mongoose.models.creditMemo || mongoose.model("creditMemo", creditNote2);

module.exports = CustomerMemo;