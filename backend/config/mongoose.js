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

exports.connectToDB = (callback) => {
  mongoose
    .connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(async () => {
      console.log("Connected to MongoDB successfully..");
      callback();
    })
    .catch((e) => {
      console.error("Error while attemping to connect to MongoDB");
      console.error(e);
    });
};
