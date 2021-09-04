const Role = require("mongoose").model("Role");
const User = require("mongoose").model("User");

module.exports.getRoles = (req, res, next) => {
  Role.find({}, (err, roles) => {
    if (err) {
      return next(err);
    }
    res.send(roles);
  });
};

module.exports.getRoleById = (req, res, next) => {
  Role.findById(req.params.id, (err, role) => {
    if (err) {
      return next(err);
    }
    if (!role) {
      const error = `No role found with id: ${req.params.id}`;
      return res.status(404).json({ error });
    }
    res.send(role);
  });
};

module.exports.getUsersByRoleId = (req, res, next) => {
  User.find({ "roles._id": req.params.id }, (err, users) => {
    if (err) {
      return next(err);
    }
    res.send(users);
  });
};

module.exports.createRole = (req, res, next) => {
  const role = new Role(req.body);
  role.save((err, role) => {
    if (err) {
      return next(err);
    }
    res.status(201).send(role);
  });
};

module.exports.updateRole = (req, res, next) => {
  Role.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
    (err, role) => {
      if (err) {
        return next(err);
      }
      if (!role) {
        const error = `No role found with id: ${req.params.id}`;
        return res.status(404).json({ error });
      } else {
        res.send(role);
      }
    }
  );
};

module.exports.deleteRole = (req, res, next) => {
  Role.findByIdAndRemove(req.params.id, (err, role) => {
    if (err) {
      return next(err);
    }
    if (!role) {
      const error = `No role found with id: ${req.params.id}`;
      return res.status(404).json({ error });
    }
    role.remove();
    res.send(role);
  });
};

module.exports.deleteAllRoles = (req, res, next) => {
  Role.deleteMany({}, (err, doc) => {
    if (err) {
      console.log("yep");
      return next(err);
    }
    const message =
      doc.deletedCount > 0
        ? `Successfully removed ${doc.deletedCount} roles`
        : "No roles to remove";
    res.json({ message });
  });
};

module.exports.createStandardRoles = (req, res, next) => {
  if (Role.standardRoles.length) {
    let addedRoles = 0;
    Role.standardRoles.some((standardRole, index) => {
      Role.findByIdAndUpdate(standardRole._id, standardRole, (err, role) => {
        if (err) {
          return next(err);
        }
        if (!role) {
          role = standardRole;
          role.isNew = true;
          addedRoles++;
        }
        role.save((err, newRole) => {
          if (err) {
            return next(err);
          }
          if (index === Role.standardRoles.length - 1) {
            const result = addedRoles
              ? `Successfully added ${addedRoles} role(s).`
              : "Standard roles already exist.";
            const message = err ? err.message : result;
            if (res) {
              return res.json({ message });
            } else {
              console.log(`-- Adding standard roles -> ${message}`);
              next();
            }
          }
        });
      });
    });
  }
};
