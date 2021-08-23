const router = require("express").Router();
const userService = require("../services/user.service");

router.get("/", userService.getUsers);
router.get("/:id", userService.getUserById);
router.post("/", userService.createUser);
router.patch("/:id", userService.updateUser);
router.delete("/deleteall", userService.deleteAllUsers);
router.delete("/:id", userService.deleteUser);
module.exports = router;
