import { PrismaClient } from "@/lib/generated/prisma";

const databse = new PrismaClient();

async function main() {
  try {
    await databse.genre.createMany({
      data: [
        { name: "Action" },
        { name: "Adventure" },
        { name: "Animation" },
        { name: "Comedy" },
        { name: "Crime" },
        { name: "Documentary" },
        { name: "Drama" },
        { name: "Family" },
        { name: "Fantasy" },
        { name: "History" },
        { name: "Horror" },
        { name: "Music" },
        { name: "Mystery" },
        { name: "Romance" },
        { name: "Romance Comedy" },
        { name: "Rom-Com" },
        { name: "Science Fiction" },
        { name: "TV Movie" },
        { name: "Thriller" },
        { name: "Medical" },
        { name: "Legal" },
        { name: "Law" },
        { name: "Political" },
        { name: "Martial Arts" },
        { name: "Sports" },
        { name: "War" },
        { name: "Slice of Life" },
        { name: "School" },
        { name: "Urban" },
        { name: "Youth" },
        { name: "Sweet Love" },
        { name: "Mandarin" },
        { name: "Chinese Mandarin" },
        { name: "Chinese Cantonese" },
        { name: "Cantonese" },
        { name: "Japanese Anime" },
        { name: "Novel Adaptation" },
        { name: "Fantasy" },
        { name: "Anime" },
        { name: "Mystery" },
        { name: "Sci-Fi" },
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
