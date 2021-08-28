const User = require("mongoose").model("User");
const utils = require("../util/utils");
const provider = require("../util/enums").provider;

exports.getUsers = (_, res) => {
  User.find({}, (err, users) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send(users);
    }
  });
};

exports.getUserById = (req, res) => {
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

exports.createUser = (req, res, next) => {
  const user = new User(req.body);
  user.provider = provider.ADMIN;
  user.save((err, user) => {
    if (err) {
      return next(err);
    }
    res.status(201).send(user);
  });
};

exports.updateUser = (req, res, next) => {
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

exports.deleteUser = (req, res, next) => {
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

exports.deleteAllUsers = (req, res, next) => {
  User.deleteMany({}, (err, doc) => {
    if (err) {
      return next(err);
    }
    const message = doc.deletedCount > 0 ? `Successfully removed ${doc.deletedCount} users` : "No users to remove";
    res.json({ message });
  });
};

exports.createAdminUser = (next) => {
  const adminUser = User.adminUser;
  User.findByIdAndUpdate(adminUser._id, adminUser, (err, user) => {
    const password = utils.createPassword(32);
    if (!user) {
      user = adminUser;
      user.isNew = true;
    }
    // TODO: hash password
    user.hash = password;
    user.salt = "salt here";
    const action = user.isNew ? "created" : "updated";
    user.save((err, newUser) => {
      const message = err ? err.message : `successfully ${action} admin user.`;
      console.log(`-- Adding admin user -> ${message}`);
      console.log(`-- email: ${user.email}, password: ${password}.`);
      next();
    });
  });
};
