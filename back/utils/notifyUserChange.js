const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendMessage } = require('../../kafkaounet/producer.js');

async function notifyUserChange(action, userId, explicitProfileId = null) {
  try {
    // Si c'est une suppression, on n'envoie que l'ID de l'utilisateur
    if (action === 'deleted') {
      const topic = `user.${action}`; // user.delete
      const message = { user_id: userId };
      await sendMessage(topic, message);
      console.log(`[Kafka] Notification envoyée sur topic "${topic}": ${JSON.stringify(message)}`);
      return;
    }

    // Sinon on récupère les détails usuels
    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    const profile = explicitProfileId
      ? await prisma.profile.findUnique({ where: { profile_id: explicitProfileId } })
      : await prisma.profile.findFirst({ where: { user_id: userId } });
    const socialMedia = await prisma.usersocialmedia.findMany({
      where: { user_id: userId },
      include: { socialmedia: true }
    });

    // Aplatir le profil si on l'a
    const flatProfile = profile
      ? {
          profile_id: profile.profile_id,
          profile_picture: profile.profile_picture || null,
          pictures: profile.pictures || null,
          is_private: profile.is_private ?? null,
          is_certified: profile.is_certified ?? null,
          description: profile.description ?? null,
          accepted_age_gap: profile.accepted_age_gap ?? null,
          accepted_distance: profile.accepted_distance ?? null,
          targeted_gender: profile.targeted_gender ?? null,
          favorite_musician: profile.favorite_musician ?? null,
          favorite_music: profile.favorite_music ?? null,
          favorite_musical_style: profile.favorite_musical_style ?? null,
        }
      : {};

    // Compose le message complet
    const message = {
      user: user || null,
      ...flatProfile,
      social_media: socialMedia || [],
      timestamp: new Date().toISOString(),
    };

    const topic = `user.${action}`; // ex: user.create, user.update
    await sendMessage(topic, message);
    console.log(`[Kafka] Notification envoyée sur topic "${topic}":\n${JSON.stringify(message, null, 2)}`);

  } catch (error) {
    console.error('Erreur dans notifyUserChange:', error);
  }
}

module.exports = { notifyUserChange };
