import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Note from '@/lib/db/models/Note';
import { requireAuth } from '@/lib/auth/rbac';

// POST /api/notes - Create new note
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { lessonId, courseId, content, timestamp } = body;

    if (!lessonId || !courseId || !content) {
      return NextResponse.json(
        { error: 'পাঠ, কোর্স এবং নোট আবশ্যক' },
        { status: 400 }
      );
    }

    await connectDB();

    const note = await Note.create({
      user: user.id,
      lesson: lessonId,
      course: courseId,
      content,
      timestamp: timestamp || undefined,
    });

    return NextResponse.json(
      {
        message: 'নোট সংরক্ষণ করা হয়েছে',
        note,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json(
      { error: 'নোট সংরক্ষণ করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

// GET /api/notes?lessonId=xxx or courseId=xxx - Get user's notes
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');
    const courseId = searchParams.get('courseId');

    if (!lessonId && !courseId) {
      return NextResponse.json(
        { error: 'পাঠ বা কোর্স ID আবশ্যক' },
        { status: 400 }
      );
    }

    await connectDB();

    interface NoteQuery {
      user: string;
      lesson?: string;
      course?: string;
    }

    const query: NoteQuery = { user: user.id };
    if (lessonId) query.lesson = lessonId;
    if (courseId) query.course = courseId;

    const notes = await Note.find(query)
      .populate('lesson', 'titleBn titleEn')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    return NextResponse.json(
      { error: 'নোট লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
