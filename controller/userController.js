const User = require("../model/User");
const bcrypt = require("bcryptjs");

exports.createUser = async (req, res) => {
  // console.log("CREATE USER API HIT");
  const {
    name,
    email,
    password,
    role,
    designation,
    department,
    phone,
    address,
    joiningDate,
    shift,
    workLocation,
    dob,
    gender,
    salary,
    bankDetails,
    profilePicture,
    active,
  } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      designation,
      department,
      phone,
      address,
      joiningDate,
      shift,
      workLocation,
      dob,
      gender,
      salary,
      bankDetails,
      profilePicture,
      active,
    });
    return res.status(201).json({
      message: "User Created Succesfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//get all users
exports.getAllUsers = async (req, res) => {
  try {
    const {
      search,role,department,workLocation,gender,joiningDate,active,sortBy,sortOrder,page,limit} = req.query;

      if(!page || !limit){
        page=1;return res.status(400).json({message:"page and limit are required" });
        }
      let query={};
      if(search){
        query.$or=[
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { designation: { $regex: search, $options: "i" } },
            { department: { $regex: search, $options: "i" } }
        ]
      }
      if(role){
        query.role=role;
      }
      if(department){
        query.department=department;
      }
      if(gender){
        query.gender=gender;}
      if(joiningDate){
        const date=new Date(joiningDate);
        const nextDate=new Date(date);
        query.joiningDate={
          $gte: date,
          $lt: nextDate
        };
      }
      if(workLocation){
        query.workLocation=workLocation;
      }
      if(active){
        query.active=active==="true";
      }
      let sortQuery={};
      if(sortBy){
        const order=sortOrder==="desc" ? -1 : 1;
        sortQuery[sortBy]=order;
      }else
      {
        sortQuery.createdAt=-1;
      }

      const skip=(page-1)*limit;

      const users = await User.find(query).select("-password").sort(sortQuery).skip(skip).limit(parseInt(limit));
      const totalUsers = await User.countDocuments(query);

    return res.status(200).json({ message: "Users fetched successfully", count: users.length, totalUsers, page: Number(page), limit: Number(limit), totalPages: Math.ceil(totalUsers / Number(limit)), users });
  }catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//get single user by id
exports.getUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User fetched successfully", user });
  } catch (error) {
    console.error("Get user by ID error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//delete user by id
exports.deleteUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user by ID error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
