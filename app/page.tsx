import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CoursesSection from "@/components/home/CoursesSection";
import TeachersSection from "@/components/home/TeachersSection";
import CTASection from "@/components/home/CTASection";
import connectDB from "@/lib/db/mongodb";
import Teacher from "@/lib/db/models/Teacher";
import FAQSection from "@/components/faq/FAQSection";

export default async function HomePage() {
  await connectDB();

  // Fetch approved teachers from new Teacher model
  const teachers = await Teacher.find({
    isApproved: true
  })
    .select('name image qualifications')
    .limit(6)
    .lean();

  // Serialize teachers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializedTeachers = teachers.map((teacher: any) => ({
    _id: teacher._id.toString(),
    name: teacher.name,
    image: teacher.image,
    teacherQualifications: teacher.qualifications,
  }));

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <CoursesSection />
      <TeachersSection teachers={serializedTeachers} />
      <CTASection />
      <FAQSection limit={5} showViewAll={true} showHeader={true} />
    </div>
  );
}
