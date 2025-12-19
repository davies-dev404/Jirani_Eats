import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Food from "./models/FoodItem.js";
import FoodRequest from "./models/FoodRequest.js";
import Notification from "./models/Notification.js";
import connectDB from "./config/db.js";

dotenv.config();

const cleanData = async () => {
    try {
        await connectDB();

        console.log("⚠️  Cleaning existing data...");
        
        const deleteUsers = await User.deleteMany();
        console.log(`- Deleted ${deleteUsers.deletedCount} users`);

        const deleteFood = await Food.deleteMany();
        console.log(`- Deleted ${deleteFood.deletedCount} food items`);

        const deleteRequests = await FoodRequest.deleteMany();
        console.log(`- Deleted ${deleteRequests.deletedCount} food requests`);

        const deleteNotifications = await Notification.deleteMany();
        console.log(`- Deleted ${deleteNotifications.deletedCount} notifications`);

        console.log("✅ Database cleared successfully!");
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

cleanData();
