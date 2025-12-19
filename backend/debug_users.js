
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema({
    email: String,
    role: String
}, { strict: false });

const User = mongoose.model('User', userSchema);

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/jirani-eats")
    .then(async () => {
        const users = await User.find({});
        console.log("--- USERS ---");
        users.forEach(u => console.log(`${u.email}: ${u.role}`));
        console.log("-------------");
        process.exit();
    })
    .catch(err => { console.error(err); process.exit(1); });
