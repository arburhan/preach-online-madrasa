// Migration script to add order field to existing exams
// Run with: node scripts/migrate-exam-order.mjs

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function migrateExamOrder() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI not found in .env.local');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('✓ Connected to MongoDB');

        const db = mongoose.connection.db;
        const examsCollection = db.collection('exams');
        const lessonsCollection = db.collection('lessons');

        // Get all exams without order field
        const exams = await examsCollection.find({ order: { $exists: false } }).toArray();

        console.log(`\nFound ${exams.length} exams without order field`);

        if (exams.length === 0) {
            console.log('✓ All exams already have order field');
            await mongoose.disconnect();
            process.exit(0);
        }

        // Group exams by course
        const examsByCourse = {};
        exams.forEach(exam => {
            const courseId = exam.course?.toString();
            if (courseId) {
                if (!examsByCourse[courseId]) {
                    examsByCourse[courseId] = [];
                }
                examsByCourse[courseId].push(exam);
            }
        });

        console.log('\nMigrating exams...');

        for (const [courseId, courseExams] of Object.entries(examsByCourse)) {
            // Get lesson count for this course
            const lessonCount = await lessonsCollection.countDocuments({
                course: new mongoose.Types.ObjectId(courseId)
            });

            console.log(`\nCourse ${courseId}: ${lessonCount} lessons, ${courseExams.length} exams`);

            // Assign order after all lessons
            for (let i = 0; i < courseExams.length; i++) {
                const newOrder = lessonCount + i;
                await examsCollection.updateOne(
                    { _id: courseExams[i]._id },
                    { $set: { order: newOrder } }
                );
                console.log(`  - Set exam "${courseExams[i].titleBn}" order to ${newOrder}`);
            }
        }

        console.log('\n✅ Migration complete!');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

migrateExamOrder();
