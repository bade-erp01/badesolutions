
const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var location = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        index:true,
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
   location.statics.findByTenant = function (tenantId, filter = {}) {
     return this.find({ tenantId, ...filter });
   };
   
   location.statics.createForTenant = function (tenantId, businessData) {
     return this.create({ ...businessData, tenantId });
   };
   
   const Location =
     mongoose.models.location ||
     mongoose.model("location", location);
   

module.exports = Location