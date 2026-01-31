const express = require("express");
const router = express.Router();
const {
  createLeaveRequest,
  updateLeaveStatus,
  getAllLeaveRequests,
  getEmployeeLeaveRequests,
} = require("../controller/leaveRequestController");
const authMiddleware = require("../middleware/authMiddleware");
const rolemiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware);

router.post("/", createLeaveRequest);
router.get("/", rolemiddleware("HR"), getAllLeaveRequests);
router.get("/employee", getEmployeeLeaveRequests);
router.patch("/:id", rolemiddleware("HR"), updateLeaveStatus);

module.exports = router;
