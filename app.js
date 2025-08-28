require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");

const dbConnect = require("./app/config/dbconfig");
const userProductRoutes = require("./app/routes/userbasedauth");
const authRoutes = require("./app/routes/authroutes"); // ← Use the new routes file

dbConnect();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/", userProductRoutes);
app.use("/auth", authRoutes); // ← Now this will work

app.listen(3006, () => {
  console.log("server port is 3006");
});
