import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getCurrentUser } from '@/lib/auth/rbac';

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Video uploader - only teachers and admins
    videoUploader: f({ video: { maxFileSize: '512MB', maxFileCount: 1 } })
        .middleware(async () => {
            const user = await getCurrentUser();

            if (!user || !['teacher', 'admin'].includes(user.role)) {
                throw new Error('শুধুমাত্র শিক্ষক এবং অ্যাডমিন ভিডিও আপলোড করতে পারবেন');
            }

            return { userId: user.id, userName: user.name };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log('Video upload complete for userId:', metadata.userId);
            console.log('File URL:', file.url);
            console.log('File key:', file.key);

            return {
                uploadedBy: metadata.userId,
                url: file.url,
                key: file.key,
            };
        }),

    // Course thumbnail uploader - teachers and admins
    thumbnailUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
        .middleware(async () => {
            const user = await getCurrentUser();

            if (!user || !['teacher', 'admin'].includes(user.role)) {
                throw new Error('শুধুমাত্র শিক্ষক এবং অ্যাডমিন থাম্বনেইল আপলোড করতে পারবেন');
            }

            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log('Thumbnail upload complete for userId:', metadata.userId);
            console.log('File URL:', file.url);

            return { uploadedBy: metadata.userId, url: file.url };
        }),

    // Lesson attachments uploader - teachers and admins
    attachmentUploader: f({
        pdf: { maxFileSize: '16MB', maxFileCount: 5 },
        image: { maxFileSize: '4MB', maxFileCount: 5 },
    })
        .middleware(async () => {
            const user = await getCurrentUser();

            if (!user || !['teacher', 'admin'].includes(user.role)) {
                throw new Error('শুধুমাত্র শিক্ষক এবং অ্যাডমিন ফাইল আপলোড করতে পারবেন');
            }

            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log('Attachment upload complete for userId:', metadata.userId);
            console.log('File URL:', file.url);

            return { uploadedBy: metadata.userId, url: file.url };
        }),

    // Profile image uploader - all authenticated users
    profileImageUploader: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
        .middleware(async () => {
            const user = await getCurrentUser();

            if (!user) {
                throw new Error('অনুমোদন প্রয়োজন');
            }

            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log('Profile image upload complete for userId:', metadata.userId);
            console.log('File URL:', file.url);

            return { uploadedBy: metadata.userId, url: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
