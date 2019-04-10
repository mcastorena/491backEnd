// Include our packages in our main server file
const express = require('express');
app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const passport = require('passport');
const config = require('./config/main');
const cors = require('cors');
const port = 3000;

// Use body-parser to get POST requests for API use
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Log requests to console
app.use(morgan('dev'));

// Home route. We'll end up changing this to our main front end index later.
app.get('/', function(req, res) {
  res.send('Relax. We will put the home page here later.');
});

// Connect to database
mongoose.connect(config.database);

require('./app/routes')(app);

//error handling(tomas)
app.use(function(err, req,res, next){
  //console.log(err);
  res.status(422).send({error:err.message});
});
// Start the server
app.listen(port);
console.log('Your server is running on port ' + port + '.');

if(process.env.NODE_ENV !== 'production') {
  process.once('uncaughtException', function(err) {
    console.error('FATAL: Uncaught exception.');
    console.error(err.stack||err);
    setTimeout(function(){
      process.exit(1);
    }, 100);
  });
}