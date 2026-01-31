// Export all models from a single entry point

// User models (separated by role)
export { default as Student } from './Student';
export type { IStudent } from './Student';

export { default as Teacher } from './Teacher';
export type { ITeacher, TeacherApprovalStatus } from './Teacher';

export { default as Admin } from './Admin';
export type { IAdmin } from './Admin';

// Legacy User export (for backwards compatibility during migration)
export { default as User, UserRole } from './User';
export type { IUser } from './User';

// Course models
export { default as Course, CourseStatus, CourseLevel } from './Course';
export type { ICourse } from './Course';

export { default as Lesson } from './Lesson';
export type { ILesson } from './Lesson';

export { default as Section } from './Section';
export type { ISection } from './Section';

export { default as Progress } from './Progress';
export type { IProgress } from './Progress';

export { default as Note } from './Note';
export type { INote } from './Note';

export { default as Order, OrderStatus, PaymentMethod } from './Order';
export type { IOrder } from './Order';

// Subject and Exam models

export { default as Subject, SubjectType } from './Subject';
export type { ISubject } from './Subject';

export { default as Exam, ExamType, QuestionType } from './Exam';
export type { IExam, IQuestion } from './Exam';

export { default as ExamResult, Grade } from './ExamResult';
export type { IExamResult, IAnswer } from './ExamResult';



// Long course program model
export { default as Program } from './LongCourse';
export type { IProgram } from './LongCourse';

// System Settings
export { default as SystemSetting } from './SystemSetting';
export type { ISystemSetting } from './SystemSetting';
