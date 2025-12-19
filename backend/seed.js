import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Food from "./models/FoodItem.js";
import FoodRequest from "./models/FoodRequest.js";
import Notification from "./models/Notification.js";
import connectDB from "./config/db.js";

dotenv.config();

const users = [
    {
        name: "Admin User",
        email: "admin@jirani.com",
        password: "password123",
        role: "admin",
        status: "active",
        phone: "+254700000000",
        verificationStatus: "approved"
    },
    {
        name: "John Donor",
        email: "donor@jirani.com",
        password: "password123",
        role: "donor",
        phone: "+254711111111",
        verificationStatus: "approved", 
        status: "active"
    },
    {
        name: "Jane Receiver",
        email: "receiver@jirani.com",
        password: "password123",
        role: "receiver",
        phone: "+254722222222",
        verificationStatus: "approved",
        status: "active"
    },
    {
        name: "Mike Rider",
        email: "rider@jirani.com",
        password: "password123",
        role: "rider",
        phone: "+254733333333",
        verificationStatus: "approved",
        status: "active",
        vehicleDetails: {
            type: "bike",
            plateNumber: "KAA 123A",
            model: "Yamaha",
            color: "Red"
        }
    }
];

const seedData = async () => {
    try {
        await connectDB();

        console.log("Cleaning existing data...");
        await User.deleteMany();
        await Food.deleteMany();
        await FoodRequest.deleteMany();
        await Notification.deleteMany();

        console.log("Seeding Users...");
        const createdUsers = await User.create(users);
        
        console.log(`✅ ${createdUsers.length} users created`);
        console.log("Admin: admin@jirani.com / password123");
        console.log("Donor: donor@jirani.com / password123");
        console.log("Receiver: receiver@jirani.com / password123");
        console.log("Rider: rider@jirani.com / password123");

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
