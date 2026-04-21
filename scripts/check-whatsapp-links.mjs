/**
 * Debug script: Check WhatsApp links in courses and student gender
 * Run: node scripts/check-whatsapp-links.mjs
 */
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

const client = new MongoClient(uri);

async function main() {
    await client.connect();
    const db = client.db();

    console.log('\n=== COURSES WITH WhatsApp LINKS ===');
    const courses = await db.collection('courses').find(
        {},
        { projection: { titleBn: 1, status: 1, whatsappGroupLinkMale: 1, whatsappGroupLinkFemale: 1 } }
    ).toArray();

    courses.forEach(c => {
        const hasMale = !!c.whatsappGroupLinkMale;
        const hasFemale = !!c.whatsappGroupLinkFemale;
        const status = hasMale && hasFemale ? '✅' : hasMale || hasFemale ? '⚠️' : '❌';
        console.log(`${status} [${c.status}] ${c.titleBn}`);
        if (c.whatsappGroupLinkMale) console.log(`   Male  : ${c.whatsappGroupLinkMale}`);
        if (c.whatsappGroupLinkFemale) console.log(`   Female: ${c.whatsappGroupLinkFemale}`);
    });

    console.log('\n=== STUDENTS AND THEIR GENDER ===');
    const students = await db.collection('students').find(
        {},
        { projection: { name: 1, email: 1, gender: 1, enrolledCourses: 1 } }
    ).limit(10).toArray();

    students.forEach(s => {
        const gender = s.gender || '❌ NOT SET';
        const courses = s.enrolledCourses?.length || 0;
        console.log(`👤 ${s.name || s.email} | gender: ${gender} | enrolled: ${courses} courses`);
    });

    await client.close();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
