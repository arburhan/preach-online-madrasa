// Migration script to reorder all content (lessons + exams) by creation date
// Run with: node scripts/migrate-content-order.mjs

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function migrateContentOrder() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI not found in .env.local');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('✓ Connected to MongoDB');

        const db = mongoose.connection.db;
        const lessonsCollection = db.collection('lessons');
        const examsCollection = db.collection('exams');
        const coursesCollection = db.collection('courses');

        // Get all courses
        const courses = await coursesCollection.find({}).toArray();
        console.log(`\nFound ${courses.length} courses to process`);

        let totalUpdated = 0;

        for (const course of courses) {
            const courseId = course._id;
            console.log(`\n📚 Processing course: ${course.titleBn || course.titleEn || courseId}`);

            // Get all lessons for this course
            const lessons = await lessonsCollection.find({ course: courseId }).toArray();

            // Get all exams for this course
            const exams = await examsCollection.find({ course: courseId }).toArray();

            if (lessons.length === 0 && exams.length === 0) {
                console.log('  ⏭️  No content found, skipping...');
                continue;
            }

            // Combine all content with type marker
            const allContent = [
                ...lessons.map(l => ({ ...l, contentType: 'lesson' })),
                ...exams.map(e => ({ ...e, contentType: 'exam' }))
            ];

            // Sort by createdAt
            allContent.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                return dateA - dateB;
            });

            console.log(`  📋 Total content: ${lessons.length} lessons + ${exams.length} exams = ${allContent.length} items`);
            console.log('  🔄 Reordering by creation date...');

            // Assign new order based on createdAt sequence
            for (let i = 0; i < allContent.length; i++) {
                const item = allContent[i];
                const newOrder = i + 1; // Start from 1

                if (item.order !== newOrder) {
                    if (item.contentType === 'lesson') {
                        await lessonsCollection.updateOne(
                            { _id: item._id },
                            { $set: { order: newOrder } }
                        );
                    } else {
                        await examsCollection.updateOne(
                            { _id: item._id },
                            { $set: { order: newOrder } }
                        );
                    }
                    totalUpdated++;
                    console.log(`     ${i + 1}. [${item.contentType.toUpperCase()}] "${item.titleBn}" → order: ${newOrder}`);
                } else {
                    console.log(`     ${i + 1}. [${item.contentType.toUpperCase()}] "${item.titleBn}" ✓ (already ${newOrder})`);
                }
            }
        }

        console.log(`\n✅ Migration complete! Updated ${totalUpdated} items.`);
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

migrateContentOrder();
