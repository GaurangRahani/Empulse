const mongoose=require('mongoose');
const { updateMany } = require('./User');

const leaveTypeschema=new mongoose.Schema({
    name:{type:String,required:true,unique:true},
    code:{type:String,required:true,unique:true},
    description:{type:String},
    maxPerYear:{type:Number,required:true},
    carryForward:{type:Boolean,default:false},
    paid:{type:Boolean,default:true},
    active:{type:Boolean,default:true}}
    ,{timestamps:true});

module.exports=mongoose.model('LeaveType',leaveTypeschema);
