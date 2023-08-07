const mongoose = require("mongoose");

const connectToDb = () => {
  try {
    const url = process.env.MONGO;
    mongoose.connect(url, () => console.log("db connected successfully"));
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectToDb;
