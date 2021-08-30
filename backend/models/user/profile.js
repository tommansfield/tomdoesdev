const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    photoUrl: {
      type: String,
      required: false,
    },
  },
  { _id: false }
);

ProfileSchema.virtual("fullName").get(() => {
  return `${this.firstName} ${this.lastName}`;
});

const Profile = mongoose.model("Profile", ProfileSchema);
Profile.Schema = ProfileSchema;

module.exports = Profile;
