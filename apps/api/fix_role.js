import prisma from './lib/prisma.js';

async function main() {
  await prisma.profile.updateMany({
    data: { role: 'CREATOR' }
  });
  console.log('Roles updated to CREATOR');
}

main().catch(console.error).finally(() => process.exit(0));
