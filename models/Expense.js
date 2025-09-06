const mongoose = require('mongoose')



const Expense = new mongoose.Schema ( {  

    refNo:{
        type:String,
        required: true,
    },
    initiatorId:{
        type:String,
    },
    payee:String,
    payeebankAccount:{
        type: String,
    },
    ActivityLog:Array,
    Attachment:String,
    Amount:Number,
    Date:String,
    status:{
        type:String,
        default:"pending",
        enum:['pending','Approved','Reversed']
    },
    category:String,
    Signature:String,
    remarks:String,
    WHID:{
        type:mongoose.Types.ObjectId,
        ref:'WHouse'
    },
    BankAccount:String,//for journal
    payeeBankName:String,
    mailSent:{
        default:false,
        type:Boolean,
    },
    Accountant:{
        type:String,
    },
    paymentDate:String,
    invId:String,
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
    
    // Middleware to enforce tenant scoping and unique constraints
    // Static methods for tenant-based queries
    Expense.statics.findByTenant = function (tenantId, filter = {}) {
      return this.find({ tenantId, ...filter });
    };
    
    Expense.statics.createForTenant = function (tenantId, businessData) {
      return this.create({ ...businessData, tenantId });
    };
    
    const WHExpense =
      mongoose.models.Expense ||
      mongoose.model("Expense", Expense);



// Expense.pre('save', async function(next) {
//     try {
        
//         // this.refNo = `${generateRandomString(Math.random() + 4)}`
//         this.ActivityLog.push({message:`${this.initiatorId} Generated ${this.refNo} on ${this.Date}`})

//         next();
//     } catch (error) {
//         next(error);
//     }
//   });

//   Expense.post('updateOne', async function(next) {
//     try {
//         console.log(this.getChanges())
//         this.ActivityLog.push({message:`${this.initiatorId} Updated ${this.refNo} on ${this.Date}`})
//         next();
//     } catch (error) {
//         next(error);
//     }
//   });


 module.exports = WHExpense