const jwt = require("jsonwebtoken");

const AuthCheck = async (req, res, next) => {
  const token =
    req?.body?.token ||
    req?.query?.token ||
    req?.headers["x-access-token"] ||
    req?.headers["authorization"];

  if (!token) {
    return res.status(400).json({
      status: false,
      message: "Token is required for access this page",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
    //console.log('afterlogin user',req.user);
  } catch (err) {
    return res.status(400).json({
      status: false,
      message: "invalid token",
    });
  }
  //   return next();
};
const isAdmin = (req, res, next) => {
  if (req.user.role != "admin") {
    return res.status(403).json({
      status: false,
      message: "access denied",
    });
  }
  next();
};

module.exports = { AuthCheck, isAdmin };
