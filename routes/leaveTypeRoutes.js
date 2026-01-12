const express=require('express');
const router=express.Router();
const {createLeavetype,getAllLeaveType,updateLeaveType,deleteLeaveType}=require('../controller/leaveTypeController');
const authMiddleware = require("../middleware/authMiddleware");
const rolemiddleware = require("../middleware/roleMiddleware");



router.post('/',authMiddleware,rolemiddleware(["HR","CEO"]),createLeavetype);
router.get('/',authMiddleware,rolemiddleware(["HR","CEO"]),getAllLeaveType);
router.put('/:id',authMiddleware,rolemiddleware(["HR","CEO"]),updateLeaveType);
router.patch('/delete/:id',authMiddleware,rolemiddleware(["HR","CEO"]),deleteLeaveType);

module.exports=router;