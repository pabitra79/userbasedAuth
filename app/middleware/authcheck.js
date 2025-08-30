const jwt = require("jsonwebtoken");
const User = require("../model/authschema");

const AuthCheck = async (req, res, next) => {
  let token =
    req?.body?.token ||
    req?.query?.token ||
    req?.headers["x-access-token"] ||
    req?.headers["authorization"] ||
    req?.cookies?.token; // Add cookie support

  // Handle Bearer token format
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    // Check if it's an API request
    if (req.originalUrl.includes("/api/")) {
      return res.status(400).json({
        status: false,
        message: "Token is required for access this page",
      });
    }

    // For web requests, redirect to login
    return res.redirect("/auth/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get full user info
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      if (req.originalUrl.includes("/api/")) {
        return res.status(401).json({
          status: false,
          message: "User not found",
        });
      }
      return res.redirect("/auth/login");
    }

    req.user = user; // Store full user object
    next();
  } catch (err) {
    if (req.originalUrl.includes("/api/")) {
      return res.status(400).json({
        status: false,
        message: "invalid token",
      });
    }

    // Clear invalid cookie and redirect
    res.clearCookie("token");
    return res.redirect("/auth/login");
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    if (req.originalUrl.includes("/api/")) {
      return res.status(403).json({
        status: false,
        message: "access denied",
      });
    }

    return res.render("error", {
      title: "Access Denied",
      message: "Admin access required",
    });
  }
  next();
};

module.exports = { AuthCheck, isAdmin };
