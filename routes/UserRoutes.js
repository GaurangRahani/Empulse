const express = require("express");
const {
  createUser,
  getAllUsers,
  getUserById,
  deleteUserById
} = require("../controller/userController");
const authMiddleware = require("../middleware/authMiddleware");
const rolemiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", 
    authMiddleware, 
    rolemiddleware(["HR", "CEO"]),
 createUser);
router.get("/", authMiddleware, rolemiddleware(["HR", "CEO"]), getAllUsers);
router.get("/:id", authMiddleware, rolemiddleware(["HR", "CEO"]), getUserById);
router.delete("/:id", authMiddleware, rolemiddleware(["HR", "CEO"]),deleteUserById);
module.exports = router;
