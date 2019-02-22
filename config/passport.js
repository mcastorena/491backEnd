var JwtStrategy = require('passport-jwt').Strategy;  
var ExtractJwt = require('passport-jwt').ExtractJwt;  
var Camera = require('../app/models/camera');  
var config = require('../config/main');

// Setup work and export for the JWT passport strategy
module.exports = function(passport) {  
  const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
  secretOrKey: config.secret
  };

  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    Camera.findOne({id:jwt_payload.id}, function(err, camera) {
      if (err) {
        return done(err, false);
      }
      if (camera) {
	console.log("Camera found: ");
        done(null, camera);
      } else {
        done(null, false);
      }
    });
  }));
};
