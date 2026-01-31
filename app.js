require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const userRoutes=require("./routes/UserRoutes");
const leaveTypeRoutes=require("./routes/leaveTypeRoutes");
const leaveRequestRoutes=require("./routes/leaveRequestRoutes");
const cors = require("cors");
const app = express();
const { connectDB } = require("./lib/db");
const leaveRequest = require("./model/leaveRequest");

app.use(express.json());
app.use(cors());


//routes
app.get("/", (req, res) => {
  console.log("GET / route HIT");
  res.send("Welcome to the Authentication API");
});
app.use("/api/auth", authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/leave-types",leaveTypeRoutes);
app.use("/api/leave-requests",leaveRequestRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
