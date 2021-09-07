const router = require("express").Router();
const authService = require("../services/auth.service");
const userService = require("../services/user.service");
const roleService = require("../services/role.service");

// Users
router.get("/users", authService.authenticateAdmin, userService.getUsers);
router.get("/users/:id", authService.authenticateAdmin, userService.getUserById);
router.post("/users/", authService.authenticateAdmin, userService.createUser);
router.patch("/users/:id", authService.authenticateAdmin, userService.updateUser);
router.delete("/users/deleteall", authService.authenticateAdmin, userService.deleteAllUsers);
router.delete("/users/:id", authService.authenticateAdmin, userService.deleteUser);

// Roles
router.get("/roles", authService.authenticateAdmin, roleService.getRoles);
router.get("/roles/:id", authService.authenticateAdmin, roleService.getRoleById);
router.get("/roles/:id/users", authService.authenticateAdmin, roleService.getUsersByRoleId);
router.post("/roles", authService.authenticateAdmin, roleService.createRole);
router.post("/roles/addall", authService.authenticateAdmin, roleService.createStandardRoles);
router.patch("/roles/:id", authService.authenticateAdmin, roleService.updateRole);
router.delete("/roles/deleteall", authService.authenticateAdmin, roleService.deleteAllRoles);
router.delete("/roles/:id", authService.authenticateAdmin, roleService.deleteRole);
module.exports = router;
