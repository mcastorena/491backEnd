const mongoose = require('mongoose');

// Schema defines how status messages will be stored in MongoDB

const CameraStatusSchema = new mongoose.Schema({
  camera_ID: {
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

module.exports = mongoose.model('CameraStatus', CameraStatusSchema);
