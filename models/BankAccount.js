const mongoose = require('mongoose')

const bankAccountSchema = new mongoose.Schema(
  {
    NAME: {
      type: String,
      required: true,
    },
    AccountNum: {
      required: true,
      type: String,
      unique: true,
    },
    inactive: {
      default: false,
      type: Boolean,
    },
    Balance: {
      type: Number,
      default: 0,
    },
    // logo:String,
    bankName: String,
    bankCode: String,
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
   bankAccountSchema.statics.findByTenant = function (tenantId, filter = {}) {
     return this.find({ tenantId, ...filter });
   };
   
   bankAccountSchema.statics.createForTenant = function (tenantId, businessData) {
     return this.create({ ...businessData, tenantId });
   };
   
   const  bankAccount = mongoose.models.Account || mongoose.model("Account", bankAccountSchema);
   
   

module.exports = bankAccount