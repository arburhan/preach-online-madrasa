import { NextResponse } from 'next/server';

// GET - Get all academic semesters (legacy - returns empty for new programs)
export async function GET() {
    // This route exists for backward compatibility
    // New programs use ProgramSemester model instead
    return NextResponse.json([]);
}
