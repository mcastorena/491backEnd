const mongoose = require('mongoose');

// Schema defines how status messages will be stored in MongoDB
const arraySchema = new mongoose.Schema({
  id:{
    type:String,
    required: true
  },
  confidence:{
    type:String,
    required:true
  }

});
const CameraStatusSchema = new mongoose.Schema({
  parkinglot_ID: {
    type: String,
    required: true
  },
  camera_ID: {
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

module.exports = mongoose.model('CameraStatus', CameraStatusSchema);
