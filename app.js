require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");

const dbConnect = require("./app/config/dbconfig");
const userProductRoutes = require("./app/routes/userbasedauth");
const authRoutes = require("./app/routes/authroutes"); // ← Use the new routes file
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const { AuthCheck } = require("./app/middleware/authcheck");
dbConnect();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
// app.use("/api/products", userProductRoutes);
// app.use("/api/auth", authRoutes); // ← Now this will work

app.use("/products", userProductRoutes); // Web routes
app.use("/auth", authRoutes); // Web routes

// Home route
app.get("/", (req, res) => {
  res.render("index", {
    title: "Home",
    products: [],
    user: req.user || null,
  }); //
});
// app.get("/products", (req, res) => {
//   res.render("index", { title: "Home", products: [], user: req.user || null }); //
// });

app.listen(3006, () => {
  console.log("server port is 3006");
});
