/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const dotenv = require('dotenv');
const flash = require('express-flash');
const path = require('path');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');
var Cloudant = require('cloudant');
var me;
var password
if(process.env.VCAP_SERVICES)
            {
                services = JSON.parse(process.env.VCAP_SERVICES);
                if(services.cloudantNoSQLDB) //Check if cloudantNoSQLDB service is bound to your project
                {
                    cloudant_url = services.cloudantNoSQLDB[0].credentials.url;  //Get URL and other paramters
                    console.log("Name = " + services.cloudantNoSQLDB[0].name);
                    console.log("URL = " + services.cloudantNoSQLDB[0].credentials.url);
                    console.log("username = " + services.cloudantNoSQLDB[0].credentials.username);
                    console.log("password = " + services.cloudantNoSQLDB[0].credentials.password);
                    me = services.cloudantNoSQLDB[0].credentials.username;
                    password = services.cloudantNoSQLDB[0].credentials.password;
                }
            }
else {
  {
    me = 'd4765faa-c920-486a-b58b-46b3549edd0f-bluemix'; // Set this to your own account
    password = '7b7660a00d15373e83cacd52e628ef9de665bc995a9080cec7d3174bf8b18036';
  }




const upload = multer({ dest: path.join(__dirname, 'uploads'),fileFilter : function(req, file, callback) { //file filter
                        if (['xml'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                            return callback(new Error('Wrong extension type'));
                        }
                        callback(null, true);
                    } });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const apiController = require('./controllers/api');
const contactController = require('./controllers/contact');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();


/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);
app.get('/api/upload', apiController.getFileUpload);
app.post('/api/upload', upload.single('myFile'), apiController.postFileUpload);
app.get('/api/google-maps', apiController.getGoogleMaps);
app.get('/api/info', apiController.getInfo);
app.get('/api/list_dives', function(req, res) {

  var cloudant = Cloudant({account:me, password:password});
  var suunto = cloudant.db.use('suunto')
  suunto.list({include_docs:true},function(err, body) {
    if (!err) {
      body.rows.forEach(function(doc) {
        console.log(doc.doc.AvgDepth);
        console.log(doc.doc.Duration);
        console.log(doc.doc.MaxDepth);

      });
      res.send(body);
    }
  });
});

app.post('/update/dive', function(req, res) {
  var cloudant = Cloudant({account:me, password:password});
  var suunto = cloudant.db.use('suunto');
  var name = req.body.name;
  var club = req.body.club;
  var latitude = req.body.latitude;
  var longitude = req.body.longitude;
    // Update book3
    //console.log("BODY " + JSON.stringify(req.body, null, 2));
    //console.log("ID " + req.body.name );
  suunto.get(name, function(err, response) {
  console.log("REV " + response._rev);
  console.log(JSON.stringify(response, null, 2))
  response.club = club;
  response.latitude = latitude;
  response.longitude = longitude;
  return suunto.insert(response);
  }, function(err, resp) {
  if (err) {
    console.log("error " + err);
    } else {
    console.log("Success " + resp);
    }
  });

});


/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s Express server listening on port %d in %s mode.', chalk.green('✓'), app.get('port'), app.get('env'));
});

module.exports = app;
