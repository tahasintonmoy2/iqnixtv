import { currentUser } from "@/lib/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const handleAuth = async () => {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error("Unauthorized");
  }
  return { userId: user.id };
};

export const ourFileRouter = {
  videoImage: f({ image: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => ({ success: true })),
  movieVideo: f({ video: { maxFileSize: "2GB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => ({ success: true })),
  episodeVideo: f({ video: { maxFileCount: 1, maxFileSize: "2GB" } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => ({ success: true })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;