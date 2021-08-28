var mongoose = require("mongoose");
var provider = require("../../util/enums").provider;
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
      type: provider,
      required: true,
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

module.exports = User;
