// Import dependencies
const express = require('express');
const config = require('../config/main');
const jwt = require('jsonwebtoken');
const mongo = require('mongodb').MongoClient;
const objectID = require('mongodb').ObjectID;
const assert = require('assert');
// Set up middleware

// Load models
const CameraStatus = require('./models/camerastatus');

const ParkingLotStatus = require('./models/parkinglotstatus');

const OverlayImage = require('./models/overlayimage');
const OverlayCoordinates = require('./models/overlaycoordinates');
const url = 'localhost:3000/api/';
// Export the routes for our app to use
module.exports = function(app) {
  // API Route Section


  // Create API group routes
  const apiRoutes = express.Router();

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
        //nested 4 loop
        for(var k = 0; k <masterFile.status.length; k++){
          if(req.body.status[i].id == masterFile.status[k].id){
            //console.log(masterFile.status[i].id);
            if(req.body.status[i].confidence ==0 ){
              masterFile.status[k].confidence =0;
              //break;
            }
            else if(req.body.status[i].confidence > masterFile.status[k].confidence ){
              masterFile.status[k].confidence = req.body.status[i].confidence;
              //break;
            }
          }
        }
      }
      var tempArray;

      console.log(req.body.parkinglot_ID);
      //console.log(tempArray.status[1]);
      ParkingLotStatus.findOneAndUpdate({"parkinglot_ID":req.body.parkinglot_ID}, {$set: {"status": masterFile.status}},{new: true},
        //the callback function
        (err, parkinglot) => {
          // Handle any possible database errors
          if (err) return res.status(500).send(err);
          return res.send(parkinglot);
        }
      );

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
    }).catch(next);
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

  apiRoutes.get('/camerastatus/:id',function(req,res,next){
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
  apiRoutes.get('/status', function (req, res) {
    ParkingLotStatus.find({},
      (err, lots)=>{
        if (err) return res.status(500).send(err);
        return res.send(lots);
    });
  });


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


  // Set url for API group routes
  app.use('/api', apiRoutes);
};
