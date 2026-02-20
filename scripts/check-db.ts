import { prisma } from '../lib/prisma';
async function main() {
  const members = await prisma.channelMember.findMany({ include: { channel: { select: { legacyId: true, name: true } }, user: { select: { name: true } } } });
  console.log('ChannelMember kayıtları:', members.length);
  members.forEach((m: any) => console.log(' ', m.channel?.legacyId, '/', m.channel?.name, '->', m.user?.name));
  await prisma.$disconnect();
}
main();
