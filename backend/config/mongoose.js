const mongoose = require("mongoose");
const Environment = require("../util/enums").environment;

// Register models
require("../models/user/role");
require("../models/user/user");

const db = {
  type: process.env.DATABASE_TYPE,
  user: process.env.DATABASE_USERNAME,
  pass: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  name: process.env.DATABASE_NAME,
  opts: process.env.DATABASE_OPTIONS,
};

const url = `${db.type}://${db.user}:${db.pass}@${db.host}/${db.name.toLocaleLowerCase()}${db.opts}`;

module.exports.connectToDB = (done) => {
  let message = "Connecting to MongoDB..";
  mongoose.connect(
    url,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    (err) => {
      if (err) {
        console.error(`${message} ${err.message}`);
      } else {
        console.log(`${message} done.`);
        initializeDB(() => done());
      }
    }
  );
};

const initializeDB = (done) => {
  console.log("Initializing database..");
  initializeUsers(() => {
    initializeRoles(done);
  });
};

const initializeUsers = (done) => {
  // Add admin user (dev only)
  if (process.env.APP_ENV === Environment.DEV) {
    const userService = require("../services/user.service");
    userService.createAdminUser((err) => {
      if (err) {
        return console.error(err.message);
      }
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
