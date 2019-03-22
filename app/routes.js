// Import dependencies
const passport = require('passport');
const express = require('express');
const config = require('../config/main');
const jwt = require('jsonwebtoken');

// Set up middleware
const requireAuth = passport.authenticate('jwt', { session: false });

// Load models
const Camera = require('./models/camera');
const CameraStatus = require('./models/camerastatus');

const ParkingLotStatus = require('./models/parkinglotstatus')

const OverlayImage = require('./models/overlayimage')
const OverlayCoordinates = require('./models/overlaycoordinates')

// Export the routes for our app to use
module.exports = function(app) {
  // API Route Section

  // Initialize passport for use
  app.use(passport.initialize());

  // Change bodyparser limit
var bodyParser = require('body-parser');

 app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb',
  parameterLimit: 100000
  }))

 app.use(bodyParser.json({
  limit: '50mb',
  parameterLimit: 100000
 }))

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

  // POST to create a new message from the authenticated camera
  apiRoutes.post('/camerastatus', requireAuth, function (req, res) {
      const camerastatus = new CameraStatus();
      camerastatus.id = req.body.id;
      camerastatus.parkinglot_ID = req.body.parkinglot_ID;
      camerastatus.status = req.body.status;

      // Save the status message if there are no errors
      camerastatus.save(function (err) {
          if (err)
              res.status(400).send(err);

          res.status(201).json({ message: 'Status message sent!' });
      });
  });

  // GET messages for authenticated camera
  apiRoutes.get('/camerastatus', function(req, res) {
    CameraStatus.find({$or : [{'id': req.body.id}, {'id': req.body.id}]}, function(err, messages) {
      if (err)
        res.status(400).send(err);

      res.status(400).json(messages);
    });
    });

  // GET messages for a parking lot
  apiRoutes.get('/status', function (req, res) {
      ParkingLotStatus.find({ $or: [{ 'parkinglot_ID': req.body.parkinglot_ID }, { 'parkinglot_ID': req.body.parkinglot_ID }] }, function (err, messages) {
          if (err)
              res.status(400).send(err);

          res.status(400).json(messages);
      });
  });

  // POST to create a new overlay image entry
  apiRoutes.post('/overlayimage', function (req, res) {
      const overlayimage = new OverlayImage();
      overlayimage.parkinglot_ID = req.body.parkinglot_ID;
      overlayimage.data = req.body.data;

      // Save the status message if there are no errors
      overlayimage.save(function (err) {
          if (err)
              res.status(400).send(err);

          res.status(201).json({ message: 'Overlay Image saved!' });
      });
  });

  // GET to return an overlay image
  apiRoutes.get('/overlayimage', function (req, res) {
      OverlayImage.find({ $or: [{ 'parkinglot_ID': req.body.parkinglot_ID }, { 'parkinglot_ID': req.body.parkinglot_ID }] }, function (err, messages) {
          if (err)
              res.status(400).send(err);

          res.status(400).json(messages);
      });
  });

  // POST to create a new overlay coordinates entry
  apiRoutes.post('/overlaycoordinates', function (req, res) {
      const overlaycoordinates = new OverlayCoordinates();
      overlaycoordinates.parkinglot_ID = req.body.parkinglot_ID;
      overlaycoordinates.data = req.body.data;

      // Save the status message if there are no errors
      overlaycoordinates.save(function (err) {
          if (err)
              res.status(400).send(err);

          res.status(201).json({ message: 'Overlay Coordinates saved!' });
      });
  });

  // GET to return overlay coordinates
  apiRoutes.get('/overlaycoordinates', function (req, res) {
      OverlayCoordinates.find({ $or: [{ 'parkinglot_ID': req.body.parkinglot_ID }, { 'parkinglot_ID': req.body.parkinglot_ID }] }, function (err, messages) {
          if (err)
              res.status(400).send(err);

          res.status(400).json(messages);
      });
  });


  // Set url for API group routes
  app.use('/api', apiRoutes);
};
