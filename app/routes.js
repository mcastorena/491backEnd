// Import dependencies
const passport = require('passport');
const express = require('express');
const config = require('../config/main');
const jwt = require('jsonwebtoken');

// Set up middleware
const requireAuth = passport.authenticate('jwt', { session: false });

// Load models
const Camera = require('./models/camera');
const Status = require('./models/status');

// Export the routes for our app to use
module.exports = function(app) {
  // API Route Section

  // Initialize passport for use
  app.use(passport.initialize());

  // Bring in defined Passport Strategy
  require('../config/passport')(passport);

  // Create API group routes
  const apiRoutes = express.Router();

  // Register new cameras
  apiRoutes.post('/register', function(req, res) {
    console.log(req.body);
    if(!req.body.id || !req.body.password) {
      res.status(400).json({ success: false, message: 'Please enter id and password.' });
    } else {
      const newCamera = new Camera({
        id: req.body.id,
        password: req.body.password
      });

      // Attempt to save the camera
      newCamera.save(function(err) {
        if (err) {
          return res.status(400).json({ success: false, message: 'That id already exists.'});
        }
        res.status(201).json({ success: true, message: 'Successfully created new camera.' });
      });
    }
  });

  // Authenticate the camera and get a JSON Web Token to include in the header of future requests.
  apiRoutes.post('/authenticate', function(req, res) {
    Camera.findOne({
      id: req.body.id
    }, function(err, camera) {
      if (err) throw err;

      if (!camera) {
        res.status(401).json({ success: false, message: 'Authentication failed. Camera not found.' });
      } else {
        // Check if password matches
        camera.comparePassword(req.body.password, function(err, isMatch) {
          if (isMatch && !err) {
            // Create token if the password matched and no error was thrown
	    // Token does not expire
            const token = jwt.sign({id: camera.id}, config.secret);
            res.status(200).json({ success: true, token: 'JWT ' + token });
          } else {
            res.status(401).json({ success: false, message: 'Authentication failed. Passwords did not match.' });
          }
        });
      }
    });
  });

  // Protect status routes with JWT
  // GET messages for authenticated camera
  apiRoutes.get('/status', function(req, res) {
    Status.find({$or : [{'id': req.body.id}, {'id': req.body.id}]}, function(err, messages) {
      if (err)
        res.status(400).send(err);

      res.status(400).json(messages);
    });
  });

  // POST to create a new message from the authenticated camera
  apiRoutes.post('/status', requireAuth, function(req, res) {
    const status = new Status();
        status.id = req.user.id;
        status.status = req.body.status;
        
        // Save the status message if there are no errors
        status.save(function(err) {
            if (err)
                res.status(400).send(err);

            res.status(201).json({ message: 'Status message sent!' });
        });
  });


  // Set url for API group routes
  app.use('/api', apiRoutes);
};
