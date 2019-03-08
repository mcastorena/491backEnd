const mongoose = require('mongoose');

// Schema defines how status messages will be stored in MongoDB

const CameraStatusSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  parkinglot_ID: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  }
},
{
  timestamps: true		// Saves createdAt and updatedAt
});

module.exports = mongoose.model('CameraStatus', CameraStatusSchema);
