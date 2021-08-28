"use strict";

// Express
const express = require("express");
const app = express();

// Environmental variables
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
dotenvExpand(dotenv.config());
const environment = require("./util/enums").environment;
const env = process.env.ENV || environment.DEV;

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mongoose
const mongoose = require("./config/mongoose.js");

// Favicon
const serveFavicon = require("serve-favicon");
app.use(serveFavicon(__dirname + "/public/favicon.ico"));

// Logger
const morgan = require("morgan");
app.use(morgan(":method :url :response-time"));

// Routes
app.use(`${process.env.APP_CONTEXT}`, require("./routes/index.routes"));
app.use(`${process.env.APP_CONTEXT}/admin`, require("./routes/admin.routes"));
app.use(`${process.env.APP_CONTEXT}/auth`, require("./routes/auth.routes"));
app.use(`${process.env.APP_CONTEXT}/users`, require("./routes/user.routes"));

// Error handler
const errorHandler = require("./config/error-handler.js");
app.use(errorHandler);

// Application startup
function startApplication() {
  mongoose.connectToDB(() => {
    app.listen(process.env.PORT, () => {
      console.log(`${process.env.APP_NAME} app listening on port ${process.env.PORT}! [environment: ${env}]`);
    });
  });
}

// Launch application
startApplication();
