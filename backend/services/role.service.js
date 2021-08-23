const Role = require("../models/user/role");
const User = require("../models/user/user");

exports.getRoles = (req, res, next) => {
  Role.find({}, (err, roles) => {
    if (err) {
      return next(err);
    }
    res.send(roles);
  });
};

exports.getRoleById = (req, res, next) => {
  Role.findById(req.params.id, (err, role) => {
    if (err) {
      return next(err);
    }
    if (!role) {
      return res.sendStatus(404);
    }
    res.send(role);
  });
};

exports.getUsersByRoleId = (req, res, next) => {
  console.log(req.params.id);
  User.find({ "roles._id": req.params.id }, (err, users) => {
    if (err) {
      return next(err);
    }
    res.send(users);
  });
};

exports.createRole = (req, res, next) => {
  const role = new Role(req.body);
  role.save((err, role) => {
    if (err) {
      return next(err);
    }
    res.status(201).send(role);
  });
};

exports.createStandardRoles = (req, res, next) => {
  if (Role.standardRoles.length) {
    let addedRoles = 0;
    Role.standardRoles.some((standardRole, index) => {
      Role.findByIdAndUpdate(standardRole._id, standardRole, (err, role) => {
        if (err) {
          return next(err);
        }
        if (!role) {
          role = standardRole;
          addedRoles++;
        }
        role.save((err, role) => {
          if (err) {
            return next(err);
          }
          if (index === Role.standardRoles.length - 1) {
            const message = addedRoles ? `Successfully added ${addedRoles} role(s)` : "Standard roles already exist";
            return res.json({ message });
          }
        });
      });
    });
  }
};

exports.updateRole = (req, res, next) => {
  Role.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, role) => {
    if (err) {
      return next(err);
    }
    if (!role) {
      res.sendStatus(404);
    } else {
      res.send(role);
    }
  });
};

exports.deleteRole = (req, res, next) => {
  Role.findByIdAndRemove(req.params.id, (err, role) => {
    console.log(role);
    if (err) {
      return next(err);
    }
    if (!role) {
      return res.sendStatus(404);
    }
    role.remove();
    res.send(role);
  });
};

exports.deleteAllRoles = (req, res, next) => {
  Role.deleteMany({}, (err, doc) => {
    if (err) {
      return next(err);
    }
    const message = doc.deletedCount > 0 ? `Successfully removed ${doc.deletedCount} roles` : "No roles to remove";
    res.json({ message });
  });
};
