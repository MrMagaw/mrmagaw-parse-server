// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');

var databaseURI = process.env.DATABASE_URI || process.env.MONGODB_URI;
var cloud = process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js';
var appId = process.env.APP_ID || 'myAppId';
var masterKey = process.env.MASTER_KEY || '';
var serverURL = process.env.SERVER_URL || 'http://localhost:1337/parse';
var appName = process.env.APP_NAME || 'myApp';
var user = process.env.DASH_USER || 'dev';
var pass = process.env.DASH_PASS;

if (!pass) {
  console.log('PASSWORD NOT SET. THIS IS A BIG NO NO.');
  pass = 'I should have set the password.';
}
if (!databaseURI) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
  databaseURI = 'mongodb://localhost:27017/dev';
}

var api = new ParseServer({
  databaseURI: databaseURI,
  cloud: cloud,
  appId: appId,
  masterKey: masterKey,
  serverURL: serverURL,
  liveQuery: {
    classNames: ["SongList"]
  }
});

var dashboard = new ParseDashboard({
  apps: [{
    serverURL: serverURL,
    appId: appId,
    masterKey: masterKey,
    appName: appName
  }],
  users: [{
    user: user,
    pass: pass
  }],
}, true);
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
// and the Parse dashboard on the /dashboard URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
var dashMountPath = process.env.PARSE_DASHBOARD_MOUNT || '/dashboard';
app.use(mountPath, api);
app.use(dashMountPath, dashboard);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
