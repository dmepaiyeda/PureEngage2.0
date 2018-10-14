const express = require('express');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const url = require('url');
const request = require('request');
const workspace = require('genesys-workspace-client-js');
const authentication = require('genesys-authentication-client-js');
const ProvisioningApi = require('genesys-provisioning-client-js');
const Statistics = require('genesys-statistics-client-js');
const uuid = require('uuid/v4');


const app = express();

const server = require('http').Server(app);

// Socket.io is used to send messages to webapp
const io = require('socket.io')(server);

// Totally awesome and optimized storage in javascript object (please don't judge me)
const storage = {
  // This is the environment url
  apiUrl: "https://gapi-use1.genesyscloud.com",
  // This is the environment client id
  clientId: "b219ac0408a14a33ac4333382fc776c3",
  // This is the environment client secret
  clientSecret: "es33SiFOzMaaZ6KQ57jQ7L167owt2KOeaJq0BXEEdtlcY6V5",
  // This is your service port
  port: 3001,
  // This is needed as a header to authorize requests
  apiKey: "iB4b9IG8536FQCKiPlyXL9wJYfKbALKT4GZW9VGu"
};

const authClient = new authentication.ApiClient();
authClient.basePath = `${storage.apiUrl}/auth/v3`;
authClient.defaultHeaders = {
  'x-api-key': storage.apiKey
};

const provisioningApi = new ProvisioningApi.ProvisioningApi(storage.apiKey, storage.apiUrl, false);
const workspaceApi = new workspace(storage.apiKey, storage.apiUrl);
const statisticsApi = new Statistics(storage.apiKey, storage.apiUrl);

// Serve webapp
app.use(express.static('webapp', {
  extensions: ['html', 'htm']
}));

// Router W/auth
require('./routes/session')(app, io, workspaceApi, storage, request, statisticsApi, provisioningApi);

app.use((req, res, next) => {
  if (storage.user) {
    next();
  } else {
    res.status(403).json('Forbidden');
  }
});

// Router Wauth
require('./routes/targets')(app, workspaceApi);
require('./routes/voice')(app, workspaceApi, storage);
require('./routes/provisioning')(app, request, provisioningApi, storage);
require('./routes/statistics')(app, storage, statisticsApi)
// Event Controllers
require('./controllers/events')(workspaceApi, io, storage);

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

server.listen(storage.port, () => {
  console.info(`Server started on port: ${storage.port}`);
});
