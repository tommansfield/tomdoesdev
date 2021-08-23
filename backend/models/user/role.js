var mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { versionKey: false }
);

const Role = mongoose.model("Role", RoleSchema);
Role.Schema = RoleSchema;

Role.ADMIN = new Role({
  _id: new mongoose.mongo.ObjectId("6120f9e95fe7c26cb4c26d1b"),
  name: "Admin",
  description: "Administator",
});
Role.USER = new Role({
  _id: new mongoose.mongo.ObjectId("6120f9e95fe7c26cb4c26d1a"),
  name: "User",
  description: "Standard user",
});
Role.standardRoles = [Role.USER, Role.ADMIN];

module.exports = Role;
