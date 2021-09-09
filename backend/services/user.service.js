const User = require("mongoose").model("User");
const Role = require("mongoose").model("Role");
const crypto = require("../auth/crypto");
const Provider = require("../util/enums").provider;

module.exports.getUsers = (_, res) => {
  User.find({}, (err, users) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send(users);
    }
  });
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.id, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      const error = `No user found with id: ${req.params.id}`;
      return res.status(404).json({ error });
    }
    res.send(user);
  });
};

module.exports.createUser = (req, res, next) => {
  existsByEmail(req, res, () => {
    const user = new User(req.body);
    user.provider = Provider.ADMIN;
    user.save((err, user) => {
      if (err) {
        return next(err);
      }
      res.status(201).send(user);
    });
  });
};

module.exports.updateUser = (req, res, next) => {
  existsByEmail(req, res, () => {
    User.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        const error = `No user found with id: ${req.params.id}`;
        return res.status(404).json({ error });
      }
      res.status(200).send(user);
    });
  });
};

module.exports.deleteUser = (req, res, next) => {
  User.findByIdAndRemove(req.params.id, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      const error = `No user found with id: ${req.params.id}`;
      return res.status(404).json({ error });
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
    res.json({ success: true, message });
  });
};

module.exports.createAdminUser = (next) => {
  const adminUser = User.adminUser;
  User.findByIdAndUpdate(adminUser._id, adminUser, (err, user) => {
    const password = crypto.generatePassword();
    const hashAndSalt = crypto.generateSaltAndHash(password);
    if (err) {
      return next(err);
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
      console.log(`-- email: ${newUser.email}, password: ${password}`);
      next();
    });
  });
};

const existsByEmail = (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (user && user._id !== req.body._id) {
      let error = `Email address already registered.`;
      if (Provider.ADMIN.localeCompare(user.provider) === 0) {
        error = `${error} Please contact an administrator.`;
      } else if (Provider.LOCAL.localeCompare(user.provider) !== 0) {
        error = `${error} Please log in using ${user.provider}.`;
      }
      return res.status(400).json({ error });
    }
    next();
  });
};

module.exports.existsByEmail = existsByEmail;
