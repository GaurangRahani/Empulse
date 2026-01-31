const LeaveRequest = require("../model/leaveRequest");
const LeaveType = require("../model/leaveType");

//healper function
const getOverlapDays = (start, end, rangeStart, rangeEnd) => {
  const s = start < rangeStart ? rangeStart : start;
  const e = end > rangeEnd ? rangeEnd : end;

  if (s > e) return 0;

  return Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
};

// Create a new leave request
exports.createLeaveRequest = async (req, res) => {
  const { leaveTypeId, fromDate, toDate, reason, attachment } = req.body;
  try {
    const employeeId = req.user.id;
    if (!leaveTypeId || !fromDate || !toDate || !reason) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }
    const leaveType = await LeaveType.findById(leaveTypeId);
    if (!leaveType || !leaveType.active) {
      return res.status(400).json({ message: "Invalid leave type" });
    }
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (end < start) {
      return res
        .status(400)
        .json({ message: "From date cannot be later than to date" });
    }
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const overlappingRequests = await LeaveRequest.find({
      employeeId,
      fromDate: { $lte: end },
      toDate: { $gte: start },
      status: { $in: ["PENDING", "APPROVED"] },
    });

    if (overlappingRequests.length > 0) {
      return res.status(400).json({
        message:
          "You have overlapping leave requests in the selected date range",
      });
    }

    if (leaveType.maxPerYear != null) {
      const startYear = new Date(fromDate).getFullYear();
      const endYear = new Date(toDate).getFullYear();

      for (let y = startYear; y <= endYear; y++) {
        const yearStart = new Date(y, 0, 1);
        const yearEnd = new Date(y, 11, 31, 23, 59, 59, 999);

        const existingLeaves = await LeaveRequest.find({
          employeeId,
          leaveTypeId,
          status: { $in: ["PENDING", "APPROVED"] },
          $and: [
            { fromDate: { $lte: yearEnd } },
            { toDate: { $gte: yearStart } },
          ],
        });

        let alreadyAppliedDays = 0;

        for (const leave of existingLeaves) {
          alreadyAppliedDays += getOverlapDays(
            leave.fromDate,
            leave.toDate,
            yearStart,
            yearEnd,
          );
        }

        const newLeaveDaysInThisYear = getOverlapDays(
          new Date(fromDate),
          new Date(toDate),
          yearStart,
          yearEnd,
        );

        if (
          alreadyAppliedDays + newLeaveDaysInThisYear >
          leaveType.maxPerYear
        ) {
          return res.status(400).json({
            message: `Max ${leaveType.maxPerYear} days per year exceeded for ${leaveType.name} in year ${y}`,
          });
        }
      }
    }

    const newLeaveRequest = await LeaveRequest.create({
      employeeId,
      leaveTypeId,
      fromDate: start,
      toDate: end,
      totalDays,
      reason,
      attachment,
    });
    return res.status(201).json({
      message: "Leave request created successfully",
      leaveRequest: newLeaveRequest,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//change leave request status
exports.updateLeaveStatus = async (req, res) => {
  try {
    const leaveId = req.params.id;
    const hrId = req.user.id;

    const { status, rejectReason } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be APPROVED or REJECTED" });
    }

    if (
      status === "REJECTED" &&
      (!rejectReason || rejectReason.trim() === "")
    ) {
      return res
        .status(400)
        .json({ message: "Reject reason is required when rejecting leave" });
    }

    const leave = await LeaveRequest.findById(leaveId);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.status !== "PENDING") {
      return res.status(400).json({ message: "Leave already processed" });
    }

    leave.status = status;
    leave.processedBy = hrId;

    if (status === "REJECTED") {
      leave.rejectReason = rejectReason;
    } else {
      leave.rejectReason = null;
    }

    await leave.save();

    return res.status(200).json({
      message: `Leave ${status.toLowerCase()} successfully`,
      leave,
    });
  } catch (error) {
    console.error("Update Leave Status Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//get all leave requests
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      employeeId,
      leaveTypeId,
      fromDate,
      toDate,
    } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (employeeId) {
      filter.employeeId = employeeId;
    }
    if (leaveTypeId) {
      filter.leaveTypeId = leaveTypeId;
    }
    if (fromDate && toDate) {
      filter.fromDate = { $lte: new Date(toDate) };
      filter.toDate = { $gte: new Date(fromDate) };
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [leaveRequests, total] = await Promise.all([
      LeaveRequest.find(filter)
        .populate("employeeId")
        .populate("leaveTypeId")
        .populate("processedBy")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      LeaveRequest.countDocuments(filter),
    ]);
    return res.status(200).json({
      leaveRequests,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get All Leave Requests Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
//get leave requests of logged in employee
exports.getEmployeeLeaveRequests = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const leaveRequests = await LeaveRequest.find({ employeeId }).populate(
      "leaveTypeId",
    );
    return res.status(200).json({ leaveRequests });
  } catch (error) {
    console.error("Get Employee Leave Requests Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
