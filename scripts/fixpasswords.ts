import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

async function main(){
  const hash = await bcrypt.hash('1234', 12);

  // Tüm kullanıcıların şifrelerini 1234 yap
  const emails = [
    'ayse@faonsist.com',
    'mehmet@faonsist.com',
    'tarik@faonsist.com',
    'hafsar@faonsist.com',
    'test@faonsist.com',
    'demo@faonsist.com',
  ];

  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.update({ where: { email }, data: { password: hash } });
      console.log(`✓ ${user.name} (${email}) sifresi guncellendi: 1234`);
    } else {
      console.log(`✗ ${email} bulunamadi`);
    }
  }

  await prisma.$disconnect();
}
main().catch(console.error);
