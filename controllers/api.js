'use strict';

const async = require('async');
const request = require('request');
const cheerio = require('cheerio');
const graph = require('fbgraph');
const LastFmNode = require('lastfm').LastFmNode;
const tumblr = require('tumblr.js');
const GitHub = require('github');
const Twit = require('twit');
const stripe = require('stripe')(process.env.STRIPE_SKEY);
const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const Linkedin = require('node-linkedin')(process.env.LINKEDIN_ID, process.env.LINKEDIN_SECRET, process.env.LINKEDIN_CALLBACK_URL);
const clockwork = require('clockwork')({ key: process.env.CLOCKWORK_KEY });
const paypal = require('paypal-rest-sdk');
const lob = require('lob')(process.env.LOB_KEY);
const ig = require('instagram-node').instagram();
var fs = require('fs');
var xml2js = require('xml2js');
var Cloudant = require('cloudant');
var me = 'd4765faa-c920-486a-b58b-46b3549edd0f-bluemix'; // Set this to your own account
var password = '7b7660a00d15373e83cacd52e628ef9de665bc995a9080cec7d3174bf8b18036';

/**
 * GET /api
 * List of API examples.
 */
exports.getApi = (req, res) => {
  res.render('api/index', {
    title: 'API Examples'
  });
};



/**
 * GET /api/facebook
 * Facebook API example.
 */
exports.getFacebook = (req, res, next) => {
  const token = req.user.tokens.find(token => token.kind === 'facebook');
  graph.setAccessToken(token.accessToken);
  async.parallel({
    getMyProfile: (done) => {
      graph.get(`${req.user.facebook}?fields=id,name,email,first_name,last_name,gender,link,locale,timezone`, (err, me) => {
        done(err, me);
      });
    },
    getMyFriends: (done) => {
      graph.get(`${req.user.facebook}/friends`, (err, friends) => {
        done(err, friends.data);
      });
    }
  },
  (err, results) => {
    if (err) { return next(err); }
    res.render('api/facebook', {
      title: 'Facebook API',
      me: results.getMyProfile,
      friends: results.getMyFriends
    });
  });
};

/**
 * GET /api/linkedin
 * LinkedIn API example.
 */
exports.getLinkedin = (req, res, next) => {
  const token = req.user.tokens.find(token => token.kind === 'linkedin');
  const linkedin = Linkedin.init(token.accessToken);
  linkedin.people.me((err, $in) => {
    if (err) { return next(err); }
    res.render('api/linkedin', {
      title: 'LinkedIn API',
      profile: $in
    });
  });
};

/**
 * GET /api/upload
 * File Upload API example.
 */

exports.getFileUpload = (req, res) => {
  res.render('api/upload', {
    title: 'File Upload'
  });
};

exports.postFileUpload = (req, res) => {
  req.flash('success', { msg: 'File was uploaded successfully.' });
  console.log("Value");
  console.log(req.file.originalname);
  console.log(req.file.path);
  var parser = new xml2js.Parser();
fs.readFile(req.file.path, function(err, data) {
    parser.parseString(data, function (err, result) {
        var dive={'name':req.file.originalname};
        dive.AvgDepth=result.Dive.AvgDepth;
        dive.Duration=result.Dive.Duration;
        dive.StartPressure=result.Dive.StartPressure;
        dive.EndPressure=result.Dive.EndPressure;
        dive.MaxDepth=result.Dive.MaxDepth;
        dive.StartTime=result.Dive.StartTime;
        dive.latitude= "xx.yyyyy";
        dive.longitude= "xx.yyyyy";
        dive.club="-----";
        dive.samples=result.Dive.DiveSamples;
        console.log(JSON.stringify(dive));
        // Initialize the library with my account.
        var cloudant = Cloudant({account:me, password:password});
        // Specify the database we are going to use (alice)...
        var suunto = cloudant.db.use('suunto')
        suunto.insert(dive, function(err, body) {
          if (!err)
       console.log(body)
       })
    });
});
  res.redirect('/api/upload');
};

exports.getGoogleMaps = (req, res) => {
  res.render('api/google-maps', {
    title: 'Dives Location'
  });
};

  exports.getInfo = (req, res) => {
    res.render('api/info', {
      title: 'Dives Info'
    });
};
