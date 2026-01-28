// Migration script to drop old ExamResult index
// Run with: node --loader tsx scripts/migrate-exam-result-index.mjs

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function migrateIndex() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI not found in .env.local');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('✓ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('examresults');

        // Get current indexes
        const indexes = await collection.indexes();
        console.log('\nCurrent indexes:');
        indexes.forEach(idx => {
            console.log(`  - ${idx.name}`);
        });

        // Drop the old index
        try {
            await collection.dropIndex('student_1_exam_1');
            console.log('\n✓ Dropped old index: student_1_exam_1');
        } catch (err) {
            if (err.code === 27 || err.message.includes('index not found')) {
                console.log('\n✓ Old index not found (may have been already removed)');
            } else {
                throw err;
            }
        }

        // Create new indexes
        console.log('\nCreating new indexes...');

        await collection.createIndex(
            { student: 1, exam: 1, attemptNumber: 1 },
            { unique: true, name: 'student_1_exam_1_attemptNumber_1' }
        );
        console.log('✓ Created: student_1_exam_1_attemptNumber_1 (unique)');

        await collection.createIndex(
            { student: 1, exam: 1, isLatest: 1 },
            { name: 'student_1_exam_1_isLatest_1' }
        );
        console.log('✓ Created: student_1_exam_1_isLatest_1');

        // Show final indexes
        const finalIndexes = await collection.indexes();
        console.log('\nFinal indexes:');
        finalIndexes.forEach(idx => {
            console.log(`  - ${idx.name}`);
        });

        console.log('\n✅ Migration complete!');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

migrateIndex();
