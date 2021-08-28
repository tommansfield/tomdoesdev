const mongoose = require("mongoose");
const keys = require("../config/keys");

const db = {
  type: process.env.DATABASE_TYPE,
  name: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  opts: process.env.DATABASE_OPTIONS,
  user: keys.database.username,
  pass: keys.database.password,
};

const url = `${db.type}://${db.user}:${db.pass}@${db.host}/${db.name.toLocaleLowerCase()}${db.opts}`;

exports.connectToDB = (done) => {
  mongoose
    .connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(async () => {
      console.log("Connected to MongoDB successfully..");
      initializeDB(() => done());
    })
    .catch((e) => {
      console.error("Error while attemping to connect to MongoDB");
      console.error(e);
    });
};

const initializeDB = (done) => {
  console.log("Initializing database...");
  // Add admin user (dev only)
  initializeUsers(() => {
    initializeRoles(done);
  });
};

const initializeUsers = (done) => {
  if (process.env.ENV === "development") {
    const userService = require("../services/user.service");
    userService.createAdminUser(() => {
      // Add standard roles
      done();
    });
  } else {
    done();
  }
};

const initializeRoles = (done) => {
  const roleService = require("../services/role.service");
  roleService.createStandardRoles(null, null, () => {
    done();
  });
};
