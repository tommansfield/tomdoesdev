var mongoose = require("mongoose");

var SettingsSchema = new mongoose.Schema(
  {
    sendEmails: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { _id: false }
);

const Settings = mongoose.model("Settings", SettingsSchema);
Settings.Schema = SettingsSchema;

module.exports = Settings;
