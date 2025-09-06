const mongoose = require("mongoose");

const Scrap = new mongoose.Schema(
  {
    storeProductId: {
      type: mongoose.Types.ObjectId,
      ref: "storeProduct",
    },
    ActivityLog: Array,
    Attachment1: String,
    Attachment2: String,
    ADC_CODE: String,
    status: {
      type: String,
      default: "pending",
    },
    REASON: String,
    remarks: String,
    WHID: {
      type: mongoose.Types.ObjectId,
      ref: "WHouse",
    },
    wareHouse: String,
    mailSent: {
      default: false,
      type: Boolean,
    },
    SERIALnUMBER: {
      type: String,
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
Scrap.statics.findByTenant = function (tenantId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

Scrap.statics.createForTenant = function (tenantId, businessData) {
  return this.create({ ...businessData, tenantId });
};

const WHScrap = mongoose.models.Scrap || mongoose.model("Scrap", Scrap);

module.exports = WHScrap;
