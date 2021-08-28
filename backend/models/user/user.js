var mongoose = require("mongoose");
var Provider = require("../../util/enums").provider;
var Profile = require("./profile");
var Role = require("./role");
var Settings = require("./settings");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    hash: {
      type: String,
      unique: true,
      required: true,
    },
    salt: {
      type: String,
      unique: true,
      required: true,
    },
    provider: {
      type: String,
      enum: Provider,
      required: true,
      default: Provider.LOCAL,
    },
    lastLogin: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    photoUrl: {
      type: String,
    },
    roles: {
      type: [Role.Schema],
      required: true,
      default: [Role.USER],
    },
    settings: {
      type: Settings.Schema,
      required: true,
      default: new Settings(),
    },
    profile: {
      type: Profile.Schema,
      required: true,
      default: new Profile(),
    },
  },
  { timestamps: true, versionKey: false }
);

const User = mongoose.model("User", UserSchema);

// Admin user (DEV)
User.adminUser = new User({
  _id: new mongoose.mongo.ObjectId("6120f9e95fe7c26cb4c26d1c"),
  email: `admin@${process.env.APP_NAME.toLocaleLowerCase()}.com`,
  hash: "",
  salt: "",
  roles: [Role.ADMIN, Role.USER],
  profile: {
    firstName: "Admin",
    lastName: "Administrator",
  },
  settings: {
    sendEmails: true,
  },
  provider: Provider.ADMIN,
});

module.exports = User;
