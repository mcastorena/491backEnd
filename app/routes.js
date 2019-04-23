// Import dependencies
const passport = require('passport');
const express = require('express');
const config = require('../config/main');
const jwt = require('jsonwebtoken');
const mongo = require('mongodb').MongoClient;
const objectID = require('mongodb').ObjectID;
const assert = require('assert');
// Set up middleware
const requireAuth = passport.authenticate('jwt', { session: false });

// Load models
const Camera = require('./models/camera');
const CameraStatus = require('./models/camerastatus');

const ParkingLotStatus = require('./models/parkinglotstatus');

const OverlayImage = require('./models/overlayimage');
const OverlayCoordinates = require('./models/overlaycoordinates');
const url = 'localhost:3000/api/';
// Export the routes for our app to use
module.exports = function(app) {
  // API Route Section

  // Initialize passport for use
  app.use(passport.initialize());

  // Change bodyparser limit
//const bodyParser = require('body-parser');

//  app.use(bodyParser.urlencoded({
//   extended: true,
//   limit: '50mb',
//   parameterLimit: 100000
//   }))

//  app.use(bodyParser.json({
//   limit: '50mb',
//   parameterLimit: 100000
//  }))

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
  // apiRoutes.post('/camerastatus', requireAuth, function (req, res) {
  //     const camerastatus = new CameraStatus();
  //     camerastatus.id = req.body.id;
  //     camerastatus.parkinglot_ID = req.body.parkinglot_ID;
  //     camerastatus.status = req.body.status;

  //     // Save the status message if there are no errors
  //     camerastatus.save(function (err) {
  //         if (err)
  //             res.status(400).send(err);

  //         res.status(201).json({ message: 'Status message sent!' });
  //     });
  // });

  // GET status for authenticated camera
  apiRoutes.get('/camerastatus', function(req, res) {
    CameraStatus.find({$or : [{'id': req.query.id}, {'id': req.query.id}]}, function(err, messages) {
      if (err)
        res.status(400).send(err);

      res.status(202).json(messages);
    });
    });
  //LOOK HERE FOR CHANGES
  apiRoutes.put(['/status/:id','/camerastatus/:id'], function(req,res,next){
    //console.log(req.params.id);
    //const camerastatus = new CameraStatus();
    //const parkinglotstatus = new ParkingLotStatus();
    CameraStatus.findOne({parkinglot_ID:req.params.id},function(err, parkinglot){
      CameraStatus.findOneAndUpdate(req.params.camera_ID,req.body,{new: true},
        // the callback function
        (err, camerastatus) => {
        // Handle any possible database errors
            if (err) return res.status(500).send(err);
        }
      );
    });
    ParkingLotStatus.findOne({parkinglot_ID:req.params.id},function(err, parkinglot){
      //console.log(req.body.status.length);
      var masterFile = parkinglot;
      for(var i = 0; i < req.body.status.length; i++){
          if(req.body.status[i].id == masterFile.status[i].id){
            //console.log(masterFile.status[i].id);
            if(req.body.status[i].confidence ==0 ){
              masterFile.status[i].confidence =0;
              //break;
            }
            else if(req.body.status[i].confidence > masterFile.status[i].confidence ){
              masterFile.status[i].confidence = req.body.status[i].confidence;
              //break;
            }
          }
      }
      var tempArray;
      // console.log(parkinglot.status.length);
      // console.log(parkinglot.status[1]);
      // for(var j = 0; j < parkinglot.status.length; j++){
      //   //tempArray[j] = parkinglot.status[j];
      //   console.log(parkinglot.status[j]);
      // }
      //console.log(req.body.parkinglot_ID);
      //console.log(tempArray.status[1]);
      ParkingLotStatus.findOneAndUpdate(req.body.parkinglot_ID, masterFile,{new: true},
        //the callback function
        (err, parkinglot) => {
          // Handle any possible database errors
          if (err) return res.status(500).send(err);
          return res.send(parkinglot);
        }
      );
      // for(var i = 0; i < req.body.status.length; i++){
      //   console.log(masterFile.status[i]);
      // }
      // var camParkingSpots = JSON.parse(JSON.stringify(req.body.status));                                      // Get all parking spots as JSON object from camera's request
      // var masterParkingSpots = JSON.parse(JSON.stringify(parkinglot.status));                                        // Get all parking spots as JSON object from masterfile object
      //console.log(masterParkingSpots[0].confidence);
      // for (var i = 0; i < camParkingSpots.length; i++) {                                      // For all camera parking spots compare against 
      //     var camParkingSpace = camParkingSpots[i];
      //     for (var j = 0; j < masterParkingSpots.length; j++) {
      //         var masterParkingSpace = masterParkingSpots[j];
      //         console.log(masterParkingSpace[i]);
      //         if (camParkingSpace.id == masterParkingSpace.id) {
      //             if (camParkingSpace.confidence == 0) {                                      // If camParkingSpace confidence status == 0, update
      //                 masterParkingSpots[j].confidence = camParkingSpace.confidence;
      //                 break;
      //             } else if (camParkingSpace.confidence > masterParkingSpace.confidence) {    // If camParkingSpace confidence > masterParkingSpace confidence, update
      //                 masterParkingSpots[j].confidence = camParkingSpace.confidence;
      //                 //console.log(masterParkingSpace[j].confidence);
      //                 break;
      //             } else {                                                                    // If camParkingSpace confidence < masterParkingSpace confidence, do not update
      //                 break;
      //             }
      //         }
      //     }
      // }
      // for(var i =0; i <masterParkingSpots.length; i++){
      //   ParkingLotStatus.findOneAndUpdate(masterParkingSpots[i].id,masterParkingSpots[i].confidence,{new: true},
      //     // the callback function
      //     (err, parkinglotstatus) => {
      //     // Handle any possible database errors
      //         if (err) return res.status(500).send(err);
      //         //return res.send(parkinglotstatus);
      //     }
      //   );
      // }
      //console.log(parkinglot.parkinglot_ID);
      //ParkingLotStatus.findOneAndUpdate(parkinglot.parkinglot_ID,parkinglot.confidence,{new: true},
        // the callback function
        // (err, parkinglotstatus) => {
        // // Handle any possible database errors
        //     if (err) return res.status(500).send(err);
        // }
      //);
      //  parkinglot.status = JSON.stringify(masterParkingSpots);                                        // Turn array back to string and update lot.status then save
      //  parkinglot.save();
      //return res.send(parkinglot);
    });
  });
  //post a new camera 
  apiRoutes.post('/camerastatus', function (req, res, next) {
    //var myField = req.body.myField;
    const camerastatus = new CameraStatus();
    CameraStatus.create(req.body).then(function(camerastatus){
      res.send(camerastatus);
    }).catch(next);
  });  
  
  // POST parking lot "master file" *for testing purposes*
  apiRoutes.post('/status', function (req, res, next) {
      const lotstatus = new ParkingLotStatus();
      ParkingLotStatus.create(req.body).then(function(status){
        res.send(status);
      }).catch(next);
  });
  // //delete masterfile(tomas)
  apiRoutes.delete('/status/:id',function(req,res,next){
    ParkingLotStatus.findByIdAndDelete({_id:req.params.id}).then(function(status){
      res.send(status);
    });
  });
  //get (tomas)
  apiRoutes.get('/status/:id',function(req,res,next){
    ParkingLotStatus.findOne(
      {parkinglot_ID: req.params.id},
      // the callback function
      (err, parkinglotstatus) => {
      // Handle any possible database errors
          if (err) return res.status(500).send(err);
          return res.send(parkinglotstatus);
      }
      );
  });
  // GET messages for a parking lot
  apiRoutes.get('/status', function (req, res) {
      ParkingLotStatus.find({ $or: [{ 'parkinglot_ID': req.query.parkinglot_ID }, { 'parkinglot_ID': req.query.parkinglot_ID }] }, 
      function (err, messages) {
          if (err)
              res.status(400).send(err);

          res.status(202).json(messages);
      });
  });
  apiRoutes.get('/camerastatus/:id',function(req,res,next){
    // var temp = req;
    // console.log(temp.body.status[1].confidence);
    // if(temp.body.status[1].confidence< camerastatus.i)
    CameraStatus.findOne(

      {parkinglot_ID: req.params.id},
      // the callback function
      (err, camerastatus) => {
      // Handle any possible database errors
          if (err) return res.status(500).send(err);
          return res.send(camerastatus);
      }
      );
  });
  //apiRoutes.get('/status', function (req, res) {
  //    ParkingLotStatus.find({ $or: [{ 'parkinglot_ID': req.body.parkinglot_ID }, { 'parkinglot_ID': req.body.parkinglot_ID }] }, function (err, messages) {
  //        if (err)
  //            res.status(400).send(err);

  //        res.status(202).json(messages);
  //    });
  //});

  // POST to create a new overlay image entry
  apiRoutes.post('/overlayimage', function (req, res) {
      const overlayimage = new OverlayImage();
      overlayimage.parkinglot_ID = req.body.parkinglot_ID;
      overlayimage.data = req.body.data;

      // Save the status message if there are no errors
      overlayimage.save(function (err) {
          if (err){
             return res.status(400).send(err);}

          res.status(201).json({ message: 'Overlay Image saved!' });
      });
  });

  // GET to return an overlay image
  apiRoutes.get('/overlayimage', function (req, res) {
      OverlayImage.find({ $or: [{ 'parkinglot_ID': req.query.parkinglot_ID }, { 'parkinglot_ID': req.query.parkinglot_ID }] }, function (err, messages) {
          if (err)
              res.status(400).send(err);

          res.status(202).json(messages);
      });
  });
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
      OverlayCoordinates.find({ $or: [{ 'parkinglot_ID': req.query.parkinglot_ID }, { 'parkinglot_ID': req.query.parkinglot_ID }] }, function (err, messages) {
          if (err)
              res.status(400).send(err);

          res.status(202).json(messages);
      });
  });
  apiRoutes.get('/overlaycoordinates', function (req, res) {
     OverlayCoordinates.find({ $or: [{ 'parkinglot_ID': req.body.parkinglot_ID }, { 'parkinglot_ID': req.body.parkinglot_ID }] }, function (err, messages) {
         if (err)
             res.status(400).send(err);

         res.status(202).json(messages);
     });
  });


  // Set url for API group routes
  app.use('/api', apiRoutes);
};
