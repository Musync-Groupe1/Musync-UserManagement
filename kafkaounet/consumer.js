const { consumer } = require('./client');

async function startConsumer(topic, messageHandler) {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const msg = message.value.toString();
      console.log(`Message reçu sur ${topic}:`, msg);

      try {
        const data = JSON.parse(msg);
        await messageHandler(data);
      } catch (error) {
        console.error('Erreur lors du traitement du message Kafka:', error);
      }
    },
  });

  console.log(`Consommateur Kafka abonné au topic ${topic}`);
}

module.exports = { startConsumer };
