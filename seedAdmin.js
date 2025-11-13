// seedAdmin.js

require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, Admin } = require('./models');

const seedAdmin = async () => {
    try {
        await sequelize.sync();
        const adminExists = await Admin.findOne({ where: { username: "admin" } });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash("admin123", 10);

            const newAdmin = await Admin.create({
                username: "admin",
                password: hashedPassword,
            });

            console.log("✅ Admin user created: admin / admin123");
        } else {
            console.log("⚠️ Admin user already exists");
        }

        await sequelize.close();
    } catch (error) {
        console.error("❌ Error creating admin:", error);
        process.exit(1);
    }
};

seedAdmin();
