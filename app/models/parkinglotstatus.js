
const mongoose = require('mongoose');

// Schema defines how status messages will be stored in MongoDB
// Schema defines how status messages will be stored in MongoDB
const arraySchema = new mongoose.Schema({
  "_id": false,
  id:{
    type:String,
    required: true
  },
  confidence:{
    type:String,
    required:true
  }

});
const ParkingLotStatusSchema = new mongoose.Schema({
  "_id": false,
  parkinglot_ID: {
    type: String,
    required: true
  },
  status: {
    type: [arraySchema],
    default: undefined
  }
},
{
  timestamps: true		// Saves createdAt and updatedAt
});

module.exports = mongoose.model('ParkingLotStatus', ParkingLotStatusSchema);
