const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing
  await prisma.transaction.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // Create User
  const user = await prisma.user.create({
    data: {
      email: 'alex@example.com',
      name: 'Alex Sterling',
      password: 'hashed_password_here', // In real app, use bcrypt
    },
  });

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Food', icon: 'ShoppingCart', color: '#27AE60', type: 'expense' } }),
    prisma.category.create({ data: { name: 'Income', icon: 'Banknote', color: '#003366', type: 'income' } }),
    prisma.category.create({ data: { name: 'Housing', icon: 'Home', color: '#00A8E8', type: 'expense' } }),
    prisma.category.create({ data: { name: 'Transportation', icon: 'Car', color: '#64748B', type: 'expense' } }),
  ]);

  const foodCat = categories.find(c => c.name === 'Food');
  const incomeCat = categories.find(c => c.name === 'Income');
  const housingCat = categories.find(c => c.name === 'Housing');

  // Create Transactions
  await prisma.transaction.createMany({
    data: [
      {
        title: "Whole Foods Market",
        subtitle: "Groceries & Household",
        categoryId: foodCat.id,
        userId: user.id,
        date: new Date("2023-10-24"),
        amount: 142.30,
      },
      {
        title: "Tech Corp Salary",
        subtitle: "Monthly Payroll",
        categoryId: incomeCat.id,
        userId: user.id,
        date: new Date("2023-10-20"),
        amount: 8400.00,
      },
      {
        title: "Skyline Apartments",
        subtitle: "Rent Payment",
        categoryId: housingCat.id,
        userId: user.id,
        date: new Date("2023-10-01"),
        amount: 2100.00,
      }
    ]
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
