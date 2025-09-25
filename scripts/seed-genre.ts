import { PrismaClient } from "@/lib/generated/prisma";

const databse = new PrismaClient();

async function main() {
  try {
    await databse.genre.createMany({
      data: [
        { name: "Action" },
        { name: "Adventure" },
        { name: "Medical" },
        { name: "Urban" },
        { name: "Youth" },
        { name: "Sweet Love" },
        { name: "Mandarin" },
        { name: "Novel Adaptation" },
        { name: "Comedy" },
        { name: "Drama" },
        { name: "Fantasy" },
        { name: "Horror" },
        { name: "Mystery" },
        { name: "Romance" },
        { name: "Sci-Fi" },
        { name: "Thriller" },
        { name: "Traditional Costume" },
      ],
    });

    console.log("Success genre");
  } catch (error) {
    console.log("Error databse categories", error);
  } finally {
    await databse.$disconnect();
  }
}

main();
