import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CoursesSection from "@/components/home/CoursesSection";
import TeachersSection from "@/components/home/TeachersSection";
import CTASection from "@/components/home/CTASection";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";

export default async function HomePage() {
  await connectDB();

  // Fetch approved teachers (support both old and new data)
  const teachers = await User.find({
    role: 'teacher',
    $or: [
      { approvalStatus: 'approved' },
      { isTeacherApproved: true }
    ]
  })
    .select('name image teacherQualifications')
    .limit(6)
    .lean();

  // Serialize teachers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializedTeachers = teachers.map((teacher: any) => ({
    _id: teacher._id.toString(),
    name: teacher.name,
    image: teacher.image,
    teacherQualifications: teacher.teacherQualifications,
  }));

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <CoursesSection />
      <TeachersSection teachers={serializedTeachers} />
      <CTASection />
    </div>
  );
}
