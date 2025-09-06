const mongoose = require('mongoose');
const moment = require('moment')
const Bills = require('./Bills');

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
        type:mongoose.Types.ObjectId,
        ref: 'storeProduct',
        required: true, 
        },
        vat:{
            type:Number,
            default:0
        }
})


function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
  
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  
    return result;
}

const creditNote = new mongoose.Schema({
   invId:{
     type:mongoose.Types.ObjectId,
     ref: 'bills',
     required: true,
   },
   invNo:{
     type:String,
     required:true
    },
   customerId:{
     type:mongoose.Types.ObjectId,
     ref: 'customers',
     required: true,
   },
   customer:{
    type:String,
    required: true,
  },
   Order:[orderSchema],
   InvProducts:[],
   Total:{
    type:Number,
    default:0 
   },
   status:{
     type: String,
     default: 'Open',
     enum:['Closed','Open','Pending','Cancelled',],
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
   invLocation:{
    type:String,
    required: true,
   },
   ActivityLog:[],
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
   
// Pre-save hook 
creditNote.pre('save', async function(next) {
  try {
      
      this.CreditId = `CN-${generateRandomString(Math.random() + 4)}/${this.invNo}/${this.invLocation}`
      this.Date = moment().format('YYYY-MM-DD');
      this.ActivityLog.push({message:`${this.raisedBy} Generated ${this.CreditId} on ${this.Date}`})
      await Bills.findByIdAndUpdate(
        this.invId,
        {
            $push: {
              CN: {
                creditNoteId: this._id,
                creditNoteNo:this.CreditId
              },
            },
        },
        { new: true } // Return the updated document
    )
    
      next();
  } catch (error) {
      next(error);
  }
});

creditNote.pre('findOneAndUpdate', async function(next) {
  try {
    const update = this.getUpdate();
    const options = this.getOptions();

    if (update.status || update.ApprovedBy) {
      const currentDate = moment().format('YYYY-MM-DD');
      const creditNoteDoc = await this.model.findOne(this.getQuery());

      if (!creditNoteDoc) {
        return next(new Error('Credit Note not found'));
      }

      let logMessage = `Credit Note ${creditNoteDoc.CreditId} updated on ${currentDate}`;

      if (update.status) {
        logMessage += `. Status changed to ${update.status}`;
      }

      if (update.ApprovedBy) {
        logMessage += ` by ${update.ApprovedBy}`;
      }

      if (!update.$push) {
        update.$push = {};
      }

      update.$push.ActivityLog = { message: logMessage };
    }

    next();
  } catch (error) {
    next(error);
  }
});

  // Middleware to enforce tenant scoping and unique constraints
   // Static methods for tenant-based queries
   creditNote.statics.findByTenant = function (tenantId, filter = {}) {
     return this.find({ tenantId, ...filter });
   };
   
   creditNote.statics.createForTenant = function (tenantId, businessData) {
     return this.create({ ...businessData, tenantId });
   };
   
   const  creditNotes = mongoose.models.creditNote || mongoose.model("creditNote", creditNote);
   

module.exports = creditNotes;