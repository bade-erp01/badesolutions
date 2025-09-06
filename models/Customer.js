const mongoose = require("mongoose");
const { isEmail } = require("validator");

const activitySchema = new mongoose.Schema({
  activity: {
    type: String,
    enum: [
      'Meeting',
      'Call',
      'Visitation',
      'Raise Bill',
      'Collect Payment',
      'Send Invoice',
      'Others'
    ],
    required: true
  },
  assignTo: {
    type: String,
    ref: 'Employee',
    required: true
  },
  datetime: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    required: true,
    trim: true
  },
  customerId: {
    type: String,
    required: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  raisedBy: {
    type: String,
    required: true,
    default: 'Unknown'
  },
  Status:{
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

const CustomerSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
      immutable: true,
    },
    Username: {
      type: String,
      required: [true, "This field cannot be empty"],
      lowercase: true,
    },
    Debt: {
      type: Number,
      default: 0,
    },
    Notification: [],
    phone: {
      type: String,
      required: [true, "Please provide your phone number"],
    },
    Email: {
      type: String,
      lowercase: true,
      validate: [isEmail, "Please enter a valid Email"],
    },
    DOB: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    ContactPerson:String,
    billingAddress: {
      type: String,
    },
    deliveryAddress: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Lead", "Customer"],
      required: true,
      index: true,
      trim: true,
      default: "Lead",
    },
    Password: {
      type: String,
      minlength: 6,
    },
    NewsFeedSubscription: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default:'https://img.icons8.com/glyph-neue/64/gender-neutral-user.png',
      required:true
    },
    creditLimit: {
      type: Number,
      default: 0,
      required: true,
    },
    blocked: {
      type: Boolean,
      default: true,
    },
    priceList: {
      type: String,
      required: true,
      enum: [
        "Pricelist1",
        "Pricelist2",
        "Pricelist3",
        "Pricelist4",
        "Pricelist5",
        "Pricelist6",
        "Pricelist7",
      ],
      default: "Pricelist1",
    },
    lastPayDate: {
      type: String,
      default: "",
    },
    location: {
      type: mongoose.Types.ObjectId,
      ref: "Store",
    },
    BankJournal: {
      type: mongoose.Types.ObjectId,
      ref: "Account",
    },
    customer_code: {
      type: String,
      // required: true,
      // unique: true,
      index: true,
      immutable: true,
      trim: true,
    },
    customerType: {
      type: String,
      enum: ["Individual", "Business"],
      default: "Individual",
      required: true,
    },
    paymentTerms: {
      type: String,
      enum: ["Cash on Delivery", "Credit customer"],
      default: "Cash on Delivery",
      required: true,
    },
    TIN: {
      type: String,
      trim: true,
    },
    preferredShippingMethod: {
      type: String,
      enum: ["Air", "Sea", "Land"],
      default: "Land",
    },
    accountManager: {
      type: mongoose.Types.ObjectId,
      ref: "EMPLOYEES",
    },
    salesPerson: {
      type: mongoose.Types.ObjectId,
      ref: "EMPLOYEES",
    },
    creditRating: {
      type: String,
      trim: true,
    },
   industryType :{
      type: String,
      trim: false,
    },
     isVerified: {
      type: Boolean,
      default: true,
    },
    ActivityLog:[activitySchema]
  },
  { timestamps: true } // ✅ Correct placement of the timestamps option
);

// Middleware to enforce tenant scoping
CustomerSchema.pre("save",async function (next) {
  if (!this.tenantId) {
    return next(
      new Error("Tenant ID is required for multi-tenant architecture.")
    );
  }

  if (!this.customer_code) {
    try {
      const count = await mongoose.model("Customer").countDocuments({ tenantId: this.tenantId });

      this.customer_code = `CUST-00-${count + 1}`;
    } catch (error) {
      return next(new Error("Error generating customer code."));
    }
  }


  next();
});

// CustomerSchema.pre("find", function (next) {
//   if (!this.getQuery().tenantId) {
//     return next(new Error("Tenant ID is required for all queries."));
//   }
//   next();
// });

// CustomerSchema.pre("findOne", function (next) {
//   if (!this.getQuery().tenantId) {
//     return next(new Error("Tenant ID is required for all queries."));
//   }
//   next();
// });

// Static method to find customers by tenant
CustomerSchema.statics.findByTenant = function (tenantId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

// Static method to create a customer scoped to a tenant
CustomerSchema.statics.createForTenant = async function (tenantId, customerData) {
  const count = await this.countDocuments({ tenantId });
  const customer_code = `CUST-00-${count + 1}`;
  
  return this.create({ ...customerData, tenantId, customer_code });
};

const Customer = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);

module.exports = Customer;
