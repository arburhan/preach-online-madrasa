// Migration script to verify all existing users
// Run with: npx ts-node scripts/verify-existing-users.ts

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI!;

async function main() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!\n');

    const db = mongoose.connection.db;
    if (!db) {
        throw new Error('Database connection not established');
    }

    // Update all students
    const studentResult = await db.collection('students').updateMany(
        { isEmailVerified: { $ne: true } },
        { $set: { isEmailVerified: true } }
    );
    console.log(`Students updated: ${studentResult.modifiedCount}`);

    // Update all teachers
    const teacherResult = await db.collection('teachers').updateMany(
        { isEmailVerified: { $ne: true } },
        { $set: { isEmailVerified: true } }
    );
    console.log(`Teachers updated: ${teacherResult.modifiedCount}`);

    console.log('\n✅ All existing users have been marked as email verified!');

    await mongoose.disconnect();
    process.exit(0);
}

main().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
