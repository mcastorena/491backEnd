const mongoose = require('mongoose');

// Schema defines how overlay images will be stored in mongoDB

const OverlayCoordinatesSchema = new mongoose.Schema({
    parkinglot_ID: {
        type: String,
        required: true
    },
    data: {
        type: String,
        required: true
    }
},
{
    timestamps: true		// Saves createdAt and updatedAt
});

module.exports = mongoose.model('OverlayCoordinates', OverlayCoordinatesSchema);
