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
    const users = await User.find().select("-password");
    return res
      .status(200)
      .json({
        message: "All users fetched successfully",
        count: users.length,
        users,
      });
  } catch (error) {
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
