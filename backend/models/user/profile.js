const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    happy: {
      type: Boolean,
      required: true,
      default: true,
    },
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
  },
  { _id: false }
);

const Profile = mongoose.model("Profile", ProfileSchema);
Profile.Schema = ProfileSchema;

module.exports = Profile;
