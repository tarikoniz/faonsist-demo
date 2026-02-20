import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

async function main(){
  const hash = await bcrypt.hash('1234', 12);
  
  // Ayşe şifresini 1234 yap
  await prisma.user.update({
    where: { email: 'ayse@faonsist.com' },
    data: { password: hash }
  });
  console.log('Ayse sifresi guncellendi: 1234');
  
  // Mehmet şifresini 1234 yap
  await prisma.user.update({
    where: { email: 'mehmet@faonsist.com' },
    data: { password: hash }
  });
  console.log('Mehmet sifresi guncellendi: 1234');

  // Tarik yoksa ekle
  const tarik = await prisma.user.findUnique({ where: { email: 'tarik@faonsist.com' } });
  if (!tarik) {
    await prisma.user.create({
      data: {
        name: 'Tarik Oniz',
        email: 'tarik@faonsist.com',
        phone: '05321234567',
        password: hash,
        role: 'admin',
        active: true,
      }
    });
    console.log('Tarik Oniz olusturuldu: tarik@faonsist.com / 1234');
  } else {
    await prisma.user.update({ where: { email: 'tarik@faonsist.com' }, data: { password: hash } });
    console.log('Tarik sifresi guncellendi: 1234');
  }

  await prisma.$disconnect();
}
main().catch(console.error);
