const mongoose = require("mongoose");

const CustomerReports = new mongoose.Schema(
  {
    ReferenceNo: {
      type: String,
      required: true,
      unique: true,
    },
    DebitAmount: Number,
    CreditAmount: Number,
    Date: String,
    customerId: {
      type: mongoose.Types.ObjectId,
      ref: "customer",
      required: true,
    },
    Balance: {
      type: Number,
      default: 0,
    },
    cr: {
      type: Boolean,
    },
    dr: {
      type: Boolean,
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
CustomerReports.statics.findByTenant = function (tenantId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

CustomerReports.statics.createForTenant = function (tenantId, businessData) {
  return this.create({ ...businessData, tenantId });
};

const CustomerReport =
  mongoose.models.customerReport ||
  mongoose.model("customerReport", CustomerReports);

module.exports = CustomerReport;
