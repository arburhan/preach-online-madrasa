// Export all models from a single entry point
export { default as User, UserRole } from './User';
export type { IUser } from './User';

export { default as Course, CourseStatus, CourseLevel } from './Course';
export type { ICourse } from './Course';

export { default as Lesson } from './Lesson';
export type { ILesson } from './Lesson';

export { default as Progress } from './Progress';
export type { IProgress } from './Progress';

export { default as Note } from './Note';
export type { INote } from './Note';

export { default as Order, OrderStatus, PaymentMethod } from './Order';
export type { IOrder } from './Order';

// Semester-based curriculum models
export { default as Semester, SemesterLevel } from './Semester';
export type { ISemester } from './Semester';

export { default as Subject, SubjectType } from './Subject';
export type { ISubject } from './Subject';

export { default as Exam, ExamType, QuestionType } from './Exam';
export type { IExam, IQuestion } from './Exam';

export { default as ExamResult, Grade } from './ExamResult';
export type { IExamResult, IAnswer } from './ExamResult';

export { default as StudentSemester } from './StudentSemester';
export type { IStudentSemester, ISubjectProgress, ISemesterResult } from './StudentSemester';
