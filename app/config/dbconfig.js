const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGODB_URL);
    if (db) {
      console.log("Databse conection is succesfully");
    }
  } catch (err) {
    console.log(err, "Database is not connected");
  }
};
module.exports = dbConnect;
