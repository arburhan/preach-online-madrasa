import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import LongCourse from '@/lib/db/models/LongCourse';
import Semester from '@/lib/db/models/Semester';
import { requireAuth } from '@/lib/auth/rbac';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string }> }
) {
    try {
        const user = await requireAuth();
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'অনুমতি নেই' }, { status: 403 });
        }

        const { programId } = await params;
        const body = await request.json();

        await connectDB();

        // 1. Fetch the program to check limits
        const program = await LongCourse.findById(programId);
        if (!program) {
            return NextResponse.json({ error: 'প্রোগ্রাম পাওয়া যায়নি' }, { status: 404 });
        }

        // 2. Count existing semesters using the program's array for accuracy
        const existingSemesterCount = program.semesters.length;

        if (existingSemesterCount >= program.totalSemesters) {
            return NextResponse.json(
                {
                    error: `এই কোর্সে ${program.totalSemesters} টির বেশি সেমিস্টার তৈরি করা যাবে না`,
                    code: 'LIMIT_EXCEEDED'
                },
                { status: 400 }
            );
        }

        // 3. Check if semester number already exists for this program
        const semesterNumber = (existingSemesterCount + 1); // Auto-assign next number
        // Check manually just in case of race condition or manual override if we allowed input
        const duplicate = await Semester.findOne({ program: programId, number: semesterNumber });
        if (duplicate) {
            return NextResponse.json(
                { error: `সেমিস্টার ${semesterNumber} ইতিমধ্যে বিদ্যমান` },
                { status: 400 }
            );
        }

        // 4. Create the semester
        // HACK: Try to drop the unique index on 'number' if it exists to fix legacy DB state
        try {
            await Semester.collection.dropIndex('number_1');
        } catch (e) {
            // Index might not exist or already dropped, ignore
        }

        const semester = await Semester.create({
            program: programId,
            number: semesterNumber,
            titleBn: body.titleBn || `সেমিস্টার ${semesterNumber}`,
            descriptionBn: body.descriptionBn || 'বিবরণ নেই',
            level: body.level || 'basic', // Default or from input
            duration: body.duration || 3,
            status: 'active'
        });

        // 5. Update program with new semester reference
        await LongCourse.findByIdAndUpdate(programId, {
            $push: { semesters: semester._id }
        });

        return NextResponse.json(semester, { status: 201 });

    } catch (error) {
        console.error('Semester creation error:', error);
        return NextResponse.json(
            { error: 'সেমিস্টার তৈরি করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
