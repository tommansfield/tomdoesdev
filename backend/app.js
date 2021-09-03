"use strict";

// Express
const express = require("express");
const app = express();
const http = require("http");
const https = require("https");

// Environmental variables
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
dotenvExpand(dotenv.config());

// Environment
const environment = require("./util/enums").environment;
const env = process.env.ENV || environment.DEV;

// MongoDB
const mongoose = require("./config/mongoose");

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Keypair creator
const keypair = require("./auth/keypair");

// Authentication
const passport = require("./config/passport");
app.use(passport.initialize());

// Cors
const cors = require("cors");
app.use(cors());

// Favicon
const serveFavicon = require("serve-favicon");
app.use(serveFavicon(`${__dirname}/public/favicon.ico`));

// Logger
const morgan = require("morgan");
app.use(morgan(":date: HTTP :method -> :url -> :response-time -> :remote-addr"));

// Routes
app.use(`/auth`, require("./routes/auth.routes"));
app.use(`/${process.env.APP_CONTEXT}`, require("./routes/index.routes"));
app.use(`/${process.env.APP_CONTEXT}/admin`, require("./routes/admin.routes"));
app.use(`/${process.env.APP_CONTEXT}/users`, require("./routes/user.routes"));

// Error handler
const errorHandler = require("./util/error-handler.js");
app.use(errorHandler);

// Application startup
function startApplication() {
  console.log(`Starting application (environment: ${env})..`);
  keypair.generateKeyPair(() => {
    mongoose.connectToDB(() => {
      const certificates = require("./auth/certificates");
      certificates.readCertificates((credentials) => {
        let server;
        if (credentials) {
          console.log("Starting server (protocol: https)..");
          server = https.createServer(credentials, app);
        } else {
          console.log("Starting server (protocol: http)..");
          server = http.createServer(app);
        }
        server.listen(process.env.APP_PORT, () => {
          console.log(`${process.env.APP_NAME} app listening on port ${process.env.APP_PORT}!`);
        });
      });
    });
  });
}

// Launch application
startApplication();
