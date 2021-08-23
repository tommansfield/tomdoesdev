"use strict";

// Express
const express = require("express");
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mongoose
const mongoose = require("./config/mongoose.js");

// Environmental variables
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
dotenvExpand(dotenv.config());

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
const startApplication = () => {
  mongoose.connectToDB(() => {
    app.listen(process.env.PORT, () =>
      console.log(`${process.env.APP_NAME} app listening on port ${process.env.PORT}!`)
    );
  });
};

// Launch application
startApplication();
