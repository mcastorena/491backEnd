const mongoose = require('mongoose');

// Schema defines how status messages will be stored in MongoDB

const StatusSchema = new mongoose.Schema({
  id: {
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

module.exports = mongoose.model('Status', StatusSchema);
