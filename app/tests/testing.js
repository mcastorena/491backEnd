const assert = require('assert');
const expect = require('chai').expect
const request = require('supertest');
//const app = require('../app')
const app = require('../routes');

// let req = {
//     body: {},
// };

// let res = {
//     sendCalledWith: '',
//     send: function(arg) { 
//         this.sendCalledWith = arg;
//     }
// };

describe('Unit testing the /camerastatus route', function() {
    it('should return OK status', function() {
      return request('54.186.186.248:3000/api')
        .get('/camerastatus')
        .then(function(response){
            assert.equal(response.status, 202);
        })
    });

});

describe('Unit testing the get /status route', function() {
    it('should return OK status', function() {
      return request('54.186.186.248:3000/api')
        .get('/status')
        .then(function(response){
            assert.equal(response.status, 200);
        })
    });

});

describe('Unit testing the get /overlayimage route', function() {
    it('should return OK status', function() {
      return request('54.186.186.248:3000/api')
        .get('/overlayimage')
        .then(function(response){
            assert.equal(response.status, 202);
        })
    });

});

describe('Unit testing the /overlaycoordinates route', function() {
    it('should return OK status', function() {
      return request('54.186.186.248:3000/api')
        .get('/overlaycoordinates')
        .then(function(response){
            assert.equal(response.status, 202);
        })
    });

});

describe('Unit testing the /camerastatus/:id route', function() {
    it('should return OK status', function() {
      return request('54.186.186.248:3000/api')
        .get('/camerastatus/0')
        .then(function(response){
            assert.equal(response.status, 200);
        })
    });

});

describe('Unit testing the /status/:id route', function() {
    it('should return OK status', function() {
      return request('54.186.186.248:3000/api')
        .get('/status/0')
        .then(function(response){
            assert.equal(response.status, 200);
        })
    });

});

// describe('Unit testing the /status/:id route', function() {
//     it('should return OK status', function() {
//       return request('54.186.186.248:3000/api')
//         .delete('/status/0')
//         .then(function(response){
//             assert.equal(response.status, 202);
//         })
//     });

// });

describe('Unit testing the /status/:id','/camerastatus/:id route', function() {
    it('should return OK status', function() {
      return request('54.186.186.248:3000/api')
        .put('/status/')
        .then(function(response){
            assert.equal(response.status, 202);
        })
    });

});

describe('Unit testing the /camerastatus route', function() {
    it('should return OK status', function() {
      return request('54.186.186.248:3000/api')
        .post('/camerastatus')
        .then(function(response){
            assert.equal(response.status, 202);
        })
    });

});

describe('Unit testing the /overlayimage route', function() {
    it('should return OK status', function() {
      return request('54.186.186.248:3000/api')
        .post('/overlayimage')
        .then(function(response){
            assert.equal(response.status, 202);
        })
    });

});

describe('Unit testing the /overlaycoordinates route', function() {
    it('should return OK status', function() {
      return request('54.186.186.248:3000/api')
        .post('/overlaycoordinates')
        .then(function(response){
            assert.equal(response.status, 202);
        })
    });

});