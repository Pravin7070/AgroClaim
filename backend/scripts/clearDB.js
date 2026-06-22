const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const clearDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is not defined in .env');
            return;
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        const collections = await mongoose.connection.db.collections();

        for (let collection of collections) {
            // Keep indices but remove documents
            await collection.deleteMany({});
            console.log(`Cleared collection: ${collection.collectionName}`);
        }

        console.log('Database cleared successfully (models/schemas preserved).');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing database:', error);
        process.exit(1);
    }
};

clearDB();
