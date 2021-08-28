const User = require("../models/user/user");
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

exports.deleteAllUsers = (_, res, next) => {
  User.deleteMany({}, (err, doc) => {
    if (err) {
      return next(err);
    }
    const message = doc.deletedCount > 0 ? `Successfully removed ${doc.deletedCount} users` : "No users to remove";
    res.json({ message });
  });
};
