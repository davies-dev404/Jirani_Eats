
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);
        
        users.forEach(u => {
            console.log(`User: ${u.name}, Email: ${u.email}, Role: ${u.role}, ID: ${u._id}`);
        });

        // Find potential admin and fix if needed
        const potentialAdmin = users.find(u => u.email.includes('admin') || u.name.toLowerCase().includes('admin'));
        
        if (potentialAdmin) {
            console.log(`Potential admin found: ${potentialAdmin.name} (${potentialAdmin.email})`);
            if (potentialAdmin.role !== 'admin') {
                console.log(`Fixing role for ${potentialAdmin.name} to 'admin'...`);
                potentialAdmin.role = 'admin';
                await potentialAdmin.save();
                console.log("Role updated to admin.");
            } else {
                console.log("User is already admin.");
            }
        } else {
            console.log("No obvious admin user found.");
        }

        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkUsers();
