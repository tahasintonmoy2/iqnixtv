import { PrismaClient } from "@/lib/generated/prisma";

const databse = new PrismaClient();

async function main() {
  try {
    await databse.contentLanguage.createMany({
      data: [
        { name: "English" },
        { name: "Japanese" },
        { name: "Korean" },
        { name: "Chinese" },
        { name: "Hindi" },
      ],
    });

    console.log("Success language");
  } catch (error) {
    console.log("Error databse categories", error);
  } finally {
    await databse.$disconnect();
  }
}

main();
