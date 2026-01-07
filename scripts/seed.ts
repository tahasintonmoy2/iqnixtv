import { PrismaClient } from "@/lib/generated/prisma";

const databse = new PrismaClient();

async function main() {
  try {
    await databse.ageRating.createMany({
      data: [
        { name: "7+" },
        { name: "13+" },
        { name: "16+" },
        { name: "18+" },
      ],
    });

    console.log("Success");
  } catch (error) {
    console.log("Error databse categories", error);
  } finally {
    await databse.$disconnect();
  }
}

main();
