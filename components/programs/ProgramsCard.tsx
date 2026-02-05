import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, Clock, Users, Tag, ArrowRight, Star } from 'lucide-react';

export interface Program {
    _id: string;
    titleBn: string;
    slug?: string;
    thumbnail?: string;
    durationMonths?: number;
    totalSemesters?: number;
    maleInstructors?: string[];
    femaleInstructors?: string[];
    isFree?: boolean;
    price?: number;
    discountPrice?: number;
    isFeatured?: boolean;
    isPopular?: boolean;
}

interface ProgramsCardProps {
    program: Program;
}

export default function ProgramsCard({ program }: ProgramsCardProps) {
    return (
        <div className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
            {/* Thumbnail */}
            <div className="h-68 bg-linear-to-br from-purple-500 to-indigo-600 relative">
                {program.thumbnail ? (
                    <Image
                        src={program.thumbnail}
                        alt={program.titleBn}
                        width={500}
                        height={500}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <GraduationCap className="h-16 w-16 text-white/30" />
                    </div>
                )}
                {program.isFeatured && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-yellow-500 text-white rounded-full text-xs font-medium flex items-center gap-1">
                        <Star className="h-3 w-3 fill-white" />
                        ফিচার্ড
                    </span>
                )}
                {program.isPopular && (
                    <span className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                        জনপ্রিয়
                    </span>
                )}
            </div>

            <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{program.titleBn}</h3>

                {/* Meta */}
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {program.durationMonths || 0} মাস
                    </span>
                    <span className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {program.totalSemesters || 0} সেমিস্টার
                    </span>
                </div>

                {/* Instructors */}
                <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-blue-600">{program.maleInstructors?.length || 0} পুরুষ</span>
                    <span className="text-pink-400">{program.femaleInstructors?.length || 0} মহিলা</span>
                    শিক্ষক
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-green-400">
                    <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4 text-primary" />
                        {program.isFree ? (
                            <span className="text-green-600 font-bold">বিনামূল্যে</span>
                        ) : (
                            <span className="font-bold">
                                {program.discountPrice ? (
                                    <>
                                        <span className="line-through text-muted-foreground text-sm mr-1">
                                            ৳{program.price}
                                        </span>
                                        ৳{program.discountPrice}
                                    </>
                                ) : (
                                    <>৳{program.price || 0}</>
                                )}
                            </span>
                        )}
                    </div>
                    <Link href={`/programs/${program.slug || program._id}`}>
                        <Button size="sm">
                            বিস্তারিত
                            <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
