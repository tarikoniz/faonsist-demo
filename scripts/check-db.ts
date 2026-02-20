import { prisma } from '../lib/prisma';

async function main() {
  // Tüm kanallar ve kullanıcılar
  const channels = await prisma.channel.findMany({ where: { type: 'channel' } });
  const users = await prisma.user.findMany({ select: { id: true, name: true } });

  console.log(`${users.length} kullanıcı, ${channels.length} kanal`);

  // Tüm kullanıcıları tüm genel kanallara ekle
  let added = 0;
  for (const ch of channels) {
    for (const u of users) {
      const exists = await prisma.channelMember.findUnique({
        where: { channelId_userId: { channelId: ch.id, userId: u.id } }
      });
      if (!exists) {
        await prisma.channelMember.create({ data: { channelId: ch.id, userId: u.id } });
        console.log(`  Eklendi: ${u.name} -> ${ch.name}`);
        added++;
      }
    }
  }
  console.log(`\nToplam ${added} üyelik eklendi`);

  // Son durum
  const members = await prisma.channelMember.findMany({
    include: { channel: { select: { name: true } }, user: { select: { name: true } } }
  });
  console.log(`\nGüncel üyelikler (${members.length}):`);
  members.forEach((m: any) => console.log(`  ${m.channel.name} -> ${m.user.name}`));

  await prisma.$disconnect();
}
main();
