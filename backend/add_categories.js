const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = ['เสื้อผ้า', 'อิเล็กทรอนิกส์', 'การศึกษา', 'บันเทิง', 'อาหาร', 'Income'];
  for (let c of cats) {
    await prisma.category.upsert({
      where: { name: c },
      update: {},
      create: { name: c, type: c === 'Income' ? 'income' : 'expense' }
    });
  }
  console.log('Categories synced');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
