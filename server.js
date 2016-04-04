var express = require("express");
var stormpath = require('express-stormpath');
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var CONTACTS_COLLECTION = "contacts";
var LEAGUES_COLLECTION = "leagues";


var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(stormpath.init(app, { 
  application: process.env.STORMPATH_URL,
  web: {
    spa:{
      enabled: true,
      view: path.join(__dirname, 'public', 'index.html')
    },
    register: {
      autoLogin: true,
      form: {
        fields: {
          givenName: {
            enabled: false
          },
          surname: {
            enabled: false
          }
        }
      }
    },        
    expand: {
      customData: true,
    },
    login: {
      enabled: true
    },
    logout: {
      enabled: true
    }
  },
  website: true
}));


// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database 

mongodb.MongoClient.connect(process.env.MONGOLAB_URI, function (err, database) {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    // Save database object from the callback for reuse.
    db = database;
    console.log("Database connection ready");

    // Initialize the app.
    app.on('stormpath.ready', function() {
      app.listen(process.env.PORT || 3000);
    });

});


// Generic error handler used by all endpoints.
function handleError(reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}


// Leagues API routes below

app.get("/leagues/:leagueName", function(req, res) {

  db.collection(LEAGUES_COLLECTION).findOne({ leagueName: req.params.leagueName }, function(err, doc) {
    if(doc == null){
      res.status(202).json(doc);
    }
    else if (err) {
      handleError(err.message, "Error querying league db",502);
    } 
    else {
      res.status(200).json(doc);
    }
  });
});

app.post("/leagues", stormpath.loginRequired, function(req, res) {
  var newLeague = req.body;
  console.log('created league: ' + newLeague);
  newLeague.createDate = new Date();

  db.collection(LEAGUES_COLLECTION).insertOne(newLeague, function(err, doc) {
    if (err) {
      handleError(err.message, "Failed to create new league.");
    } else{
      //req.user.customData.leagues.push('newLeague.leagueName')
      res.status(200).json(doc.ops[0]);
    }
  });
});

app.put("/leagues/:leagueName", stormpath.loginRequired, function(req, res) {
  //to allow a league to be updated, currently logged in user must have created that league
  var leagueName = req.params.leagueName
  req.user.getCustomData(function(err, customData) {
    var leagueNameMatches = 0
    console.log(customData)
    for(x=0; x < customData.leagues.length; x++){
      if( leagueName == customData.leagues[x].leagueName) leagueNameMatches = 1
    }
    if(leagueNameMatches == 0)res.status(407).json(doc);
  });

  var updateDoc = req.body;
  delete updateDoc._id; //needed to be added for mongoDB to not throw error. Error complained of changing the objectID of req.params.id to upadteDoc._id
  db.collection(LEAGUES_COLLECTION).updateOne({leagueName: leagueName}, updateDoc, function(err, doc) {
    if (err) {
      handleError(err.message, "Failed to update league");
    } else {
      res.status(200).json(doc);
    }
  });
});


// Users API routes below
app.get("/verifyLogin", stormpath.loginRequired, function(req, res) {
  res.status(201).json(req.user);
});

app.get("/getCustomData", stormpath.loginRequired, function(req, res) {
  req.user.getCustomData(function(err, customData) {
    res.status(200).json(customData);
  });
});

app.post("/saveUser", stormpath.loginRequired, function(req, res) {
  req.user.customData.leagues = req.body.customData.leagues
  req.user.customData.save(function (err) {
    if (err) {
        handleError(err.message, "Failed to save user");
    }
    else{
      res.status(201).json(req.user);
    }
  })
});