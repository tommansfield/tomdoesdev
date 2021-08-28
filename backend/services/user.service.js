const User = require("mongoose").model("User");
const Role = require("mongoose").model("Role");
const authUtils = require("../auth/auth-utils");
const provider = require("../util/enums").provider;

module.exports.getUsers = (_, res) => {
  User.find({}, (err, users) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send(users);
    }
  });
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.sendStatus(404);
    }
    res.send(user);
  });
};

module.exports.createUser = (req, res, next) => {
  const user = new User(req.body);
  user.provider = provider.ADMIN;
  user.save((err, user) => {
    if (err) {
      return next(err);
    }
    res.status(201).send(user);
  });
};

module.exports.updateUser = (req, res, next) => {
  User.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.sendStatus(404);
    }
    res.status(200).send(user);
  });
};

module.exports.deleteUser = (req, res, next) => {
  User.findByIdAndRemove(req.params.id, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.sendStatus(404);
    }
    user.remove();
    res.send(user);
  });
};

module.exports.deleteAllUsers = (req, res, next) => {
  User.deleteMany({}, (err, doc) => {
    if (err) {
      return next(err);
    }
    const message = doc.deletedCount > 0 ? `Successfully removed ${doc.deletedCount} users.` : "No users to remove.";
    res.json({ message });
  });
};

module.exports.createAdminUser = (next) => {
  const adminUser = User.adminUser;
  User.findByIdAndUpdate(adminUser._id, adminUser, (err, user) => {
    const password = authUtils.generatePassword();
    const hashAndSalt = authUtils.generateSaltAndHash(password);
    if (err) {
      return console.error(err);
    }
    if (!user) {
      user = adminUser;
      user.isNew = true;
    }
    user.roles = [Role.ADMIN, Role.USER];
    user.hash = hashAndSalt.hash;
    user.salt = hashAndSalt.salt;
    const action = user.isNew ? "created" : "updated";
    user.save((err, newUser) => {
      const message = err ? err.message : `successfully ${action} admin user.`;
      console.log(`-- Adding admin user -> ${message}`);
      console.log(`-- email: ${user.email}, password: ${password}.`);
      next();
    });
  });
};
