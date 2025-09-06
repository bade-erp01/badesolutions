const mongoose = require("mongoose");
const { isEmail } = require("validator");

const VendorSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: [true, "Provide a Product Name"],
      unique: true,
    },
    Address: {
      type: String,
    },
    image: {
      type: String,
    },
    vendor_tel: {
      type: String,
    },
    email: {
      type: String,
    },
    Categories: {
      type: String,
    },
    ActivityLog: {
      type: Array,
    },
    block_vendor: {
      type: Boolean,
      default: true,
    },
    Account_num: {
      type: String,
    },
    Account_name: {
      type: String,
    },
    Bank_name: {
      type: String,
    },
    Balance: {
      type: Number,
      defauit: 0,
      required: true,
    },
    Bouns: {
      type: Number,
      defauit: 0,
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
VendorSchema.statics.findByTenant = function (tenantId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

VendorSchema.statics.createForTenant = function (tenantId, businessData) {
  return this.create({ ...businessData, tenantId });
};

const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);

module.exports = Vendor;
