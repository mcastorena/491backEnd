const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

// Schema defines how the camera's data will be stored in MongoDB
const CameraSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

// Hashes camera password before saving it
CameraSchema.pre('save', function (next) {
  const camera = this;
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(camera.password, salt, null, function(err, hash) {
        if (err) {
          return next(err);
        }
        camera.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

// Create method to compare password input to password saved in database
CameraSchema.methods.comparePassword = function(pw, cb) {
  bcrypt.compare(pw, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('Camera', CameraSchema);
