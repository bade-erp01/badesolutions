const mongoose = require("mongoose");
const { isEmail } = require("validator").default;
const {OnboardUser} = require ('../EmailTrigers/OnboardUser')

const AppPermissions = new mongoose.Schema({
  Name: String,
  url: String,
  icon: String,
  Description: String,
});

const NotificationSchema = new mongoose.Schema(
  {
    Title: { type: String, required: true },
    url: { type: String, default: "" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "EMPLOYEES" }, // optional, if tied to a user
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 }, // 24 hours
  },
  { timestamp: true },
);

const AttachedSchema = new mongoose.Schema({
  Url: {
    type: String,
  },
});

// toogle btwn tenants
const tenantIdSchema = new mongoose.Schema({
  tenantIds: {
     type: mongoose.Types.ObjectId,
      ref: "Business",
      index: true,
  },
});

const chatSchema = new mongoose.Schema({
  userId1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EMPLOYEES", // Reference to the EMPLOYEES collection
  },
  userId2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EMPLOYEES", // Reference to the EMPLOYEES collection
  },
  Chatid: {
    type: String,
  },
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EMPLOYEES",
      },
      content: {
        type: String,
        index: true,
      },
      type: {
        type: String,
        enum: ["text", "image", "file", "audio", "video"],
        default: "text",
      },
      timestamp: {
        type: Date,
        default: Date.now,
        index: true,
      },
      status: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent",
        index: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const EmployeSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      lowercase: true,
    },
    Email: {
      type: String,
      required: [true, "Provide an valid email address"],
      lowercase: true,
      unique: [true, "This email is already registered."],
      validate: [isEmail, "please enter a valid Email"],
      match: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
      trim: true,
    },
    telephone: {
      type: String,
      required: true,
      unique: true,
    },
    workLocation: {
      type: mongoose.Types.ObjectId,
      ref: "WHouse",
    },
    Equiptment: {
      type: Array,
    },
    HomeAddress: {
      type: String,
    },
    workTelephone: {
      type: String,
    },
    contract: {
      type: String,
      default: "",
    },
    DOB: {
      type: String,
    },
    StateOfOringin: {
      type: String,
    },
    EmaergencyContact: {
      type: String,
    },
    NIN: {
      type: String,
      select: false,
    },
    TextToSpeech: {
      type: Boolean,
      default: false,
    },
    BVN: {
      type: String,
      select: false,
    },
    AccountNumber: {
      type: String,
      select: false,
    },
    EmploymentStaus: { type: String },
    StartDate: { type: String },
    EndDate: { type: String },
    stateOfOrigin: String,
    staffId: { type: String },
    Manager: {
      type: Object,
    },
    nextOfKin: {
      type: Object,
    },
    Signature: {
      type: String,
      select: false,
    },
    opsCode: {
      type: String,
      minlength: 4,
      select: false,
    },
    image: {
      type: String,
      default: "/person.png",
      // required:true
    },
    Leave: {
      type: Array,
    },
    password: {
      type: String,
      minlength: 8, // Longer passwords are more secure
      match: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
      select: false,
    },
    workEmail: { type: String },
    Department: { type: String },
    Gender: { type: String },
    status: {
      type: String,
      default: "suspended",
      enum: ["suspended", "active"],
    },
    jobTittle: {
      type: String,
    },
    EndDate: { type: String },
    firstTimeOnboard: {
      type: Boolean,
      default: false,
    },
    EmaergencyContactNumber: { type: String },
    NOK: String,
    BankName: String,
    lastSeen: {
      type: String,
      default: "Offline",
    },
    BirthdayMailsent: {
      type: Boolean,
      default: false,
    },
    AnnivaryMailsent: {
      type: Boolean,
      default: false,
    },
    Deadline: String,
    Sales_Target: {
      type: Number,
      default: 0,
    },
    Target_Start: String,
    Notification: [NotificationSchema],
    Appraisal: String,
    Leave: [],
    raiseLpo: {
      default: false,
      type: Boolean,
    },
    raiseInvoice: {
      default: false,
      type: Boolean,
    },
    isAccountant: {
      default: false,
      type: Boolean,
    },
    postPayment: {
      default: false,
      type: Boolean,
    },
    editVendor: {
      default: false,
      type: Boolean,
    },
    editProduct: {
      default: false,
      type: Boolean,
    },
    isAdmin: {
      default: false,
      type: Boolean,
      immutable: true,
    },
    AssetManager: {
      default: false,
      type: Boolean,
    },

    createProduct: {
      default: false,
      type: Boolean,
    },
    c_levelDash: {
      default: false,
      type: Boolean,
    },
    createCustomer: {
      default: false,
      type: Boolean,
    },
    createVendor: {
      default: false,
      type: Boolean,
    },
    payVendor: {
      default: false,
      type: Boolean,
    },
    editPurchasePrice: {
      default: false,
      type: Boolean,
    },
    editCustomer: {
      default: false,
      type: Boolean,
    },
    isCFO: {
      default: false,
      type: Boolean,
    },
    creditOfficer: {
      default: false,
      type: Boolean,
    },
    cancelInvoice: {
      default: false,
      type: Boolean,
    },
    DeactivateWareHouse: {
      default: false,
      type: Boolean,
    },
    accountCreation: {
      default: false,
      type: Boolean,
    },

    approveLeave: {
      default: false,
      type: Boolean,
    },
    // expense
    expenseUser: {
      default: false,
      type: Boolean,
    },
    expenseApprover: {
      default: false,
      type: Boolean,
    },
    expenseManager: {
      default: false,
      type: Boolean,
    },
    requestLeave: {
      default: false,
      type: Boolean,
    },
    // inventory
    notifySalesOrder: {
      default: false,
      type: Boolean,
    },
    wareHouseManager: {
      default: false,
      type: Boolean,
    },
    allowInternalTransfers: {
      default: false,
      type: Boolean,
    },
    AppraisalUser: {
      default: false,
      type: Boolean,
    },
    postVendorPayment: {
      default: false,
      type: Boolean,
    },
    AnualLeave: {
      type: Number,
      default: 0,
    },
    SickLeave: {
      type: Number,
      default: 0,
    },
    STudyLeave: {
      type: Number,
      default: 0,
    },
    MaternityLeave: {
      type: Number,
      default: 0,
    },
    notifyPriceChange: {
      type: Boolean,
      default: false,
    },
    createStaff: {
      type: Boolean,
      default: false,
    },
    pension: {
      type: String,
      default: "",
    },
    pfa: {
      type: String,
      default: "",
    },
    isHRM: {
      default: false,
      type: Boolean,
    },
    penDeduction: {
      type: Number,
      default: 0,
    },
    Welfare: {
      type: Number,
      default: 0,
    },
    Transport: {
      type: Number,
      default: 0,
    },
    Medical: {
      type: Number,
      default: 0,
    },
    Salary: {
      type: Number,
      default: 0,
    },
     ReportUser: {
      default: false,
      type: Boolean,
    },
    isDev: {
      type: Boolean,
      default: false,
      immutable: true,
    },
    EditCreditLimit: {
      type: Boolean,
      default: false,
    },
    toogledTenants:[tenantIdSchema],
    tenantId: {
      type: mongoose.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
      // immutable: true,
    },
    Apps: [AppPermissions],
    Conversations: [chatSchema],
    Attachments: [AttachedSchema],
    SessionId: {
      type: mongoose.Types.ObjectId, // store JSON response payload
      index: true,
    },
  },
  { timestamps: true },
  { strict: true },
);

// Middleware to enforce tenant scoping and unique constraints
EmployeSchema.pre("save", async function (next) {
  //   console.log("Pre-save validation triggered for:", this);

  try {
    if (this.isNew) {
      const existingBusiness = await this.constructor.findOne({
        $or: [{ Email: this.Email, telephone: this.telephone }],
      });

      if (existingBusiness) {
        return next(new Error("Email and Phone Number must be unique"));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// EmployeSchema.pre('findOne', function(next) {
//   if (!this.getQuery().tenantId) {
//     return next(new Error('Tenant ID is required for all queries.'));
//   }
//   next();
// });

// EmployeSchema.pre('find', function(next) {
//   if (!this.getQuery().tenantId) {
//     return next(new Error('Tenant ID is required for all queries.'));
//   }
//   next();
// });

//send onbarding Email to new user after creation
// EmployeSchema.post("save", async function (doc, next) {
//    doc.isAdmin === false ? OnboardUser(doc) :''
// });

// Static methods for tenant-based queries
EmployeSchema.statics.findByTenant = function (tenantId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

EmployeSchema.statics.createForTenant = function (tenantId, businessData) {
  return this.create({ ...businessData, tenantId });
};

// Transform JSON output
// EmployeSchema.set("toJSON", {
//   transform: (_doc, ret) => {
//     delete ret.password ,ret.opsCode;
//     return ret;
//   }
// });

const EMPLOYEES =
  mongoose.models.EMPLOYEES || mongoose.model("EMPLOYEES", EmployeSchema);

module.exports = EMPLOYEES;
