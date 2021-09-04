const mongoose = require("mongoose");
const keys = require("../config/keys");
const Environment = require("../util/enums").environment;

// Register models
require("../models/user/role");
require("../models/user/user");

const db = {
  type: process.env.DATABASE_TYPE,
  name: process.env.DATABASE_NAME,
  opts: process.env.DATABASE_OPTIONS,
  host: keys.database.url,
  user: keys.database.username,
  pass: keys.database.password,
};

const url = `${db.type}://${db.user}:${db.pass}@${
  db.host
}/${db.name.toLocaleLowerCase()}${db.opts}`;

exports.connectToDB = (done) => {
  let message = "Connecting to MongoDB..";
  mongoose
    .connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(async () => {
      console.log(`${message} done.`);
      initializeDB(() => done());
    })
    .catch((err) => {
      console.error(message);
      console.error(err);
    });
};

const initializeDB = (done) => {
  console.log("Initializing database..");
  initializeUsers(() => {
    initializeRoles(done);
  });
};

const initializeUsers = (done) => {
  // Add admin user (dev only)
  if (process.env.ENV === Environment.DEV) {
    const userService = require("../services/user.service");
    userService.createAdminUser(() => {
      done();
    });
  } else {
    done();
  }
};

const initializeRoles = (done) => {
  // Add standard roles
  const roleService = require("../services/role.service");
  roleService.createStandardRoles(null, null, () => {
    done();
  });
};
