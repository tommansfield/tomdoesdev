var mongoose = require("mongoose");

var SettingsSchema = new mongoose.Schema(
  {
    rememberMe: {
      type: Boolean,
      required: true,
      default: true,
    },
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
