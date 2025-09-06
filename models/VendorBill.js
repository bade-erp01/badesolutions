const mongoose = require("mongoose");

const VendorPaymentSchema = new mongoose.Schema(
  {
    billReferenceNo: {
      type: String,
      required: true,
    },
    AccountatntId: {
      //person who actions the payment
      type: String,
    },
    ActivityLog: Array,
    Amount: Number,
    PaymentDate: String,
    status: {
      type: String,
      default: "Payment",
      enum: ["Payment", "Reversed", "Purchase", ""],
    },
    bankAccount: {
      type: String,
    },
    remarks: String,
    vendor: {
      type: mongoose.Types.ObjectId,
      ref: "Vendor",
    },
    dr: {
      type: Boolean,
      default: false,
    },
    cr: {
      type: Boolean,
      default: false,
    },
    Balance: Number,
    location: String,
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
VendorPaymentSchema.statics.findByTenant = function (tenantId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

VendorPaymentSchema.statics.createForTenant = function (
  tenantId,
  businessData
) {
  return this.create({ ...businessData, tenantId });
};

const VendorPayment =
  mongoose.models.VendorBill ||
  mongoose.model("VendorBill", VendorPaymentSchema);

module.exports = VendorPayment;
