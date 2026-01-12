const LeaveType=require('../model/leaveType');

exports.createLeavetype=async(req,res)=>{
    const {name,code,description,maxPerYear,carryForward,paid,active}=req.body;
    try{
        const existingLeaveType=await LeaveType.findOne({$or:[{name : {$regex : name,$options:'i'}},{code:{$regex : code,$options:'i'}}]});
        if(existingLeaveType){
            return res.status(400).json({message:"Leave Type with this name or code already exists"});
        }
        const newLeaveType=await LeaveType.create({name,code,description,maxPerYear,carryForward,paid,active});
        return res.status(202).json({message:"Leave type created succesfully"});
    }catch(error){
        console.error(error);
        return res.status(500).json({message:"Internal server Error"});
    }
}

exports.getAllLeaveType=async(req,res)=>{
   // console.log("Fetching all leave types api HIT ");
    try{
        const leaveTypes=await LeaveType.find({active:true}).sort("name");
        res.status(200).json({
        message: "Leave types fetched successfully",
        count: leaveTypes.length,
        leaveTypes,
    });
    }catch(error){
        console.error(error);   
        return res.status(500).json({message:"Internal server Error"});
    }       
}

exports.updateLeaveType=async(req,res)=>{
    const {id}=req.params;
    const {name,code,description,maxPerYear,carryForward,paid,active}=req.body;
    try{
        const leaveType=await LeaveType.findById(id);
        const updated=await LeaveType.findByIdAndUpdate(id,req.body,{new:true});
        if(!leaveType){
            return res.status(404).json({message:"Leave type not found"});
        }
        return res.status(200).json({messgae:"Leave type updated succesfully",updated});
    }catch(error){
        return res.status(500).json({message:"Internal server Error"});
    }   
}

exports.deleteLeaveType=async(req,res)=>{
    try{
        const {id}=req.params;
        const leaveType=await LeaveType.findByIdAndUpdate(id, { active: false},{new:true});
        if(!leaveType){
            return res.status(404).json({message:"Leave type not found"});
        }
        return res.status(200).json({message:"Leave type deleted (soft) successfully"});
    }catch(error){
        return res.status(500).json({message:"Internal server Error"});
    }
};