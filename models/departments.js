
const mongoose = require('mongoose');
const { isEmail} = require('validator');

const DepartmentSchema = new mongoose.Schema({
    Name:String,
    HOD:{
        type:mongoose.Types.ObjectId,
        ref:'Employee',
        required:true,
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
DepartmentSchema.statics.findByTenant = function (tenantId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

DepartmentSchema.statics.createForTenant = function (tenantId, businessData) {
  return this.create({ ...businessData, tenantId });
};

const Department =
  mongoose.models.Department ||
  mongoose.model("Department", DepartmentSchema);




const jobTittleSchema = new mongoose.Schema({
    Name:{
        type:String,
        required:true,
        unique:true,
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
jobTittleSchema.statics.findByTenant = function (tenantId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

jobTittleSchema.statics.createForTenant = function (tenantId, businessData) {
  return this.create({ ...businessData, tenantId });
};

const jobTittle =
  mongoose.models.jobTittle ||
  mongoose.model("jobTittle", jobTittleSchema);



module.exports = {
    jobTittle,
    Department
}