const mongoose = require("mongoose");

const ProductTransferSchema = new mongoose.Schema(
  {
    to: {
      type: mongoose.Types.ObjectId,
      ref: "Whouse",
      required: true,
    },
    from: {
      type: mongoose.Types.ObjectId,
      ref: "Whouse",
      required: true,
    },
    orders: [],
    billReferenceNo: {
      type: String,
    },
    cfoApproval: {
      type: Boolean,
      default: false,
    },
    storeKeeperApproval: {
      type: Boolean,
      default: false,
    },
    ActivityLog: [],
    recievedDate: String,
    transferedDate: String,
    status: {
        type:String,
        default:'Draft',
        enum:['Draft','Approved','Rejected','Posted','Store Declined'],
        required:true
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
ProductTransferSchema.statics.findByTenant = function (tenantId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

ProductTransferSchema.statics.createForTenant = function (
  tenantId,
  businessData
) {
  return this.create({ ...businessData, tenantId });
};

const ProductTransfer =
  mongoose.models.ProductTransfer ||
  mongoose.model("ProductTransfer", ProductTransferSchema);

module.exports = ProductTransfer;
