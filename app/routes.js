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
  apiRoutes.put(['/status/','/camerastatus/'], function(req,res,next){
    //console.log(req.params.id);
    const camerastatus = new CameraStatus();
    const parkinglotstatus = new ParkingLotStatus();
    ParkingLotStatus.findOneAndUpdate(req.params.id,req.body,{new: true},
    // the callback function
    (err, parkinglotstatus) => {
    // Handle any possible database errors
        if (err) return res.status(500).send(err);
        return res.send(parkinglotstatus);
    }
    );
    CameraStatus.findOneAndUpdate(req.params.id,req.body,{new: true},
      // the callback function
      (err, todo) => {
      // Handle any possible database errors
          if (err) return res.status(500).send(err);
          return res.send(todo);
      }
      );
  });
  apiRoutes.put('/status', updateMaster);
  apiRoutes.post('/camerastatus', function (req, res, next) {
    var myField = req.body.myField;
    const camerastatus = new CameraStatus();
    CameraStatus.create(req.body).then(function(camerastatus){
      res.send(camerastatus);
    }).catch(next);
    req.Info = myField;
    return next();
  }, updateMaster);  
  
  function updateMaster(req,res,next){
    ParkingLotStatus.findOneAndUpdate({_id:req.Info.params.id},req.body).then(function(){
      ParkingLotStatus.findOne({_id:req.params.id}).then(function(status){
        res.send(status);
      });
    });
    // const _id = req.params.id;
    // CameraStatus.findOneAndUpdate({_id},
    //   req.body,
    //     {new: true},
    //     (err, camerastatus) =>{
    //     if (err){
    //       res.status(400).json(err);
    //     }
    //     res.json(camerastatus);
    //   });
    // var item = {
    //   parkinglot_ID: req.body.id,
    //   status: req.body.status
    // };
    // var id = req.body.id;
    // mongo.connect(url,function(err, db){
    //   assert.equal(null, err);
    //   db.collection('parkinglotstatuses').updateOne({"parkinglot_ID":objectID(id)},{$set:item},function(err, result){
    //     assert.equal(null,err);
    //     console.log('Item updated');
    //     db.close();
    //   });
    // });
    //return res.send();
    // id = id.extend(id, req.body);
    // id.save(function(err) {
    //   if (err) {
    //       return res.send('/status', {
    //           errors: err.errors,
    //           id: id
    //       });
    //   } else {
    //       res.jsonp(id);
    //   }
    // });
  }
  //PUT masterfile(tomas)
  // apiRoutes.put('/status/:id',function(req,res,next){
  //   ParkingLotStatus.findByIdAndUpdate({_id:req.params.id},req.body).then(function(){
  //     ParkingLotStatus.findOne({_id:req.params.id}).then(function(status){
  //       res.send(status);
  //     });
    
  //   });
  // });
  // POST parking lot "master file" *for testing purposes*
  // apiRoutes.post('/status', function (req, res, next) {
  //     const lotstatus = new ParkingLotStatus();
  //     ParkingLotStatus.create(req.body).then(function(status){
  //       res.send(status);
  //     }).catch(next);
  //     // lotstatus.parkinglot_ID = req.body.parkinglot_ID;
  //     // lotstatus.status = req.body.status;

  //     // // Save the status message if there are no errors
  //     // lotstatus.save(function (err) {
  //     //     if (err)
  //     //         res.status(400).send(err);

  //     //     res.status(201).json({ message: 'Status message sent!' });
  //     // });
  // });
  // //delete masterfile(tomas)
  apiRoutes.delete('/status/:id',function(req,res,next){
    ParkingLotStatus.findByIdAndDelete({_id:req.params.id}).then(function(status){
      res.send(status);
    });
  });
  // GET messages for a parking lot
  apiRoutes.get('/status', function (req, res) {
      ParkingLotStatus.find({ $or: [{ 'parkinglot_ID': req.query.parkinglot_ID }, { 'parkinglot_ID': req.query.parkinglot_ID }] }, function (err, messages) {
          if (err)
              res.status(400).send(err);

          res.status(202).json(messages);
      });
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
  //apiRoutes.get('/overlayimage', function (req, res) {
  //    OverlayImage.find({ $or: [{ 'parkinglot_ID': req.body.parkinglot_ID }, { 'parkinglot_ID': req.body.parkinglot_ID }] }, function (err, messages) {
  //        if (err)
  //            res.status(400).send(err);

  //        res.status(400).json(messages);
  //    });
  //});

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
  //apiRoutes.get('/overlaycoordinates', function (req, res) {
  //    OverlayCoordinates.find({ $or: [{ 'parkinglot_ID': req.body.parkinglot_ID }, { 'parkinglot_ID': req.body.parkinglot_ID }] }, function (err, messages) {
  //        if (err)
  //            res.status(400).send(err);

  //        res.status(202).json(messages);
  //    });
  //});


  // Set url for API group routes
  app.use('/api', apiRoutes);
};
