import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const categories = ["education", "beauty", "finance", "shopping", "electronic"];

    for (const name of categories) {
        // Check if category already exists to avoid duplicates
        const exists = await prisma.category.findFirst({ where: { name } });
        if (!exists) {
            await prisma.category.create({
                data: { name },
            });
            console.log(`Created category: ${name}`);
        } else {
            console.log(`Category already exists: ${name}`);
        }
    }
}

main()
    .then(async () => {
        console.log("Seeding complete.");
        await prisma.$disconnect();
        process.exit(0);
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
