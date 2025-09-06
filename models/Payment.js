const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business', // Reference to the Business (tenant) model
      required: true, // Ensures every payment is linked to a tenant
      index: true, // Improves query performance for tenant-based lookups
      immutable: true, // Prevents accidental changes to the tenant ID
    },
    paymentReferenceNo: {
      type: String,
      unique: true,
      required: true, // Ensures it's always provided
      index: true, // Improves lookup speed
      trim: true, // Removes unnecessary spaces
    },
    BillNo: {
      type: String,
    },
    Accountant: {
      type: String, // Person who actions the payment
    },
    ActivityLog: Array,
    Attachment: String,
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'posted', 'reversed'],
    },
    PaymentDate: {
      type: Date,
      required: true,
    },
    bankAccount: {
      type: String,
    },
    remarks: String,
    customer: {
      type: mongoose.Types.ObjectId,
      ref: 'customer',
      required: false,
    },
    previousBalance: {
      type: Number,
      default: 0,
    },
    transactionType: {
      type: String,
      enum: ['credit', 'debit'], // Explicitly define transaction type
      required: true,
    },
    amount: {
      type: Number,
      required: true, // Amount for the transaction
    },
    collectionRef: {
      type: String,
      enum: ['VNB', 'PMNT', 'EXP', 'TRNS', 'EXT-PYMT', 'CN'],
      required: true,
    },
    vendor: {
      type: String,
    },
  },
  { timestamps: true }
);

// Middleware to enforce tenant scoping
PaymentSchema.pre('save', function (next) {
  if (!this.tenantId) {
    return next(new Error('Tenant ID is required for multi-tenant architecture.'));
  }
  next();
});

PaymentSchema.pre('find', function (next) {
  if (!this.getQuery().tenantId) {
    return next(new Error('Tenant ID is required for all queries.'));
  }
  next();
});

PaymentSchema.pre('findOne', function (next) {
  if (!this.getQuery().tenantId) {
    return next(new Error('Tenant ID is required for all queries.'));
  }
  next();
});

// Static method to find payments by tenant
PaymentSchema.statics.findByTenant = function (tenantId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

// Static method to create a payment scoped to a tenant
PaymentSchema.statics.createForTenant = function (tenantId, paymentData) {
  return this.create({ ...paymentData, tenantId });
};

const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

module.exports = Payment;