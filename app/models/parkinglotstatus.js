
const mongoose = require('mongoose');

// Schema defines how status messages will be stored in MongoDB

const ParkingLotStatusSchema = new mongoose.Schema({
  parkinglot_ID: {
    type: String,
    required: true
  },
  confidence: {
    type: String,
    required: true
  }
},
{
  timestamps: true		// Saves createdAt and updatedAt
});

module.exports = mongoose.model('ParkingLotStatus', ParkingLotStatusSchema);
