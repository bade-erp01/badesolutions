const mongoose = require("mongoose");

const ReturnstSchema = new mongoose.Schema(
  {
    billReferenceNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    WHId: {
      type: mongoose.Types.ObjectId,
      ref: "WareHouse",
      required: true,
    },
    BillId: {
      type: mongoose.Types.ObjectId,
      ref: "bills",
      required: true,
    },
    ReturnDate: String,
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "Approved"],
    },

    storeKeeper: String,
    ActivityLog: [],
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
ReturnstSchema.statics.findByTenant = function (tenantId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

ReturnstSchema.statics.createForTenant = function (tenantId, businessData) {
  return this.create({ ...businessData, tenantId });
};

const StockReturns =
  mongoose.models.MachandiseReturn ||
  mongoose.model("MachandiseReturn", ReturnstSchema);

module.exports = StockReturns;
