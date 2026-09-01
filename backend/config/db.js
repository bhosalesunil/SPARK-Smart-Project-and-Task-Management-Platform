import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/trello_clone";
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
  } catch (error) {
    console.error("DB Error:", error.message);
    console.warn("⚠️ Server will remain running, but database operations will fail until connection is restored.");
  }
};

export default connectDB;
