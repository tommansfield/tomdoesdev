const mongoose = require("mongoose");

exports.connectToDB = (callback) => {
  mongoose
    .connect(process.env.DATABASE_URL, {
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
