// Migration script to drop old index
// Run this once: node scripts/migrate-exam-result-index.js

import mongoose from 'mongoose';
import ExamResult from '../lib/db/models/ExamResult.js';

async function migrateIndex() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI not found');
        }

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // Drop the old index
        try {
            await ExamResult.collection.dropIndex('student_1_exam_1');
            console.log('✓ Dropped old index: student_1_exam_1');
        } catch (err) {
            if (err.code === 27 || err.message.includes('index not found')) {
                console.log('✓ Old index already removed');
            } else {
                throw err;
            }
        }

        // Ensure new indexes are created
        await ExamResult.syncIndexes();
        console.log('✓ New indexes created');

        console.log('\n✅ Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrateIndex();
