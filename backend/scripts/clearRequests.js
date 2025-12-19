
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FoodRequest from '../models/FoodRequest.js'; 

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const clearData = async () => {
    await connectDB();
    try {
        await FoodRequest.deleteMany({});
        console.log('Food Requests Cleared!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

clearData();
