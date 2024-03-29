const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log("MongoDB connected");
  } catch (e) {
    console.log("Error to connect MongoDB");

    //exit process
    process.exit(1);
  }
};

module.exports = connectDB;
