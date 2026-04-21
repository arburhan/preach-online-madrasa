/**
 * Script: Add test WhatsApp links to all published courses (for development)
 * Run: node scripts/seed-whatsapp-links.mjs
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

    // Find all published courses without WhatsApp links
    const courses = await db.collection('courses').find({
        status: 'published',
        $or: [
            { whatsappGroupLinkMale: { $exists: false } },
            { whatsappGroupLinkMale: null },
            { whatsappGroupLinkMale: '' },
        ]
    }).toArray();

    console.log(`\nFound ${courses.length} published courses without WhatsApp links\n`);

    for (const course of courses) {
        const result = await db.collection('courses').updateOne(
            { _id: course._id },
            {
                $set: {
                    whatsappGroupLinkMale: 'https://chat.whatsapp.com/test-male-link',
                    whatsappGroupLinkFemale: 'https://chat.whatsapp.com/test-female-link',
                }
            }
        );
        console.log(`✅ Updated: ${course.titleBn} (modified: ${result.modifiedCount})`);
    }

    console.log('\n✅ Done! Now go to teacher panel and replace with real links.\n');
    await client.close();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
