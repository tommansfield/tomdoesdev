const router = require("express").Router();
const roleService = require("../services/role.service");

// Roles
router.get("/roles", roleService.getRoles);
router.get("/roles/:id", roleService.getRoleById);
router.get("/roles/:id/users", roleService.getUsersByRoleId);
router.post("/roles", roleService.createRole);
router.post("/roles/addall", roleService.createStandardRoles);
router.patch("/roles/:id", roleService.updateRole);
router.delete("/roles/deleteall", roleService.deleteAllRoles);
router.delete("/roles/:id", roleService.deleteRole);
module.exports = router;
