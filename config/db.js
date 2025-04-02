import mongoose from "mongoose";
import colors from "colors";
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(
      `connected to mambalam database ${conn.connection.host}`.bgWhite.black
    );
  } catch (error) {
    console.log(`error :( ${error}`.bgRed.white);
  }
};

export default connectDB;
