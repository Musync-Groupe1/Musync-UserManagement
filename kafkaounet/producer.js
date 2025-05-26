const { producer } = require('./client');

async function startProducer() {
  await producer.connect();
  console.log('Producteur Kafka connecté');
}

async function sendMessage(topic, message) {
  await producer.send({
    topic,
    messages: [
      { value: JSON.stringify(message) },  // Convertir en string
    ],
  });
  console.log(`Message envoyé sur le topic ${topic}`);
}

module.exports = { startProducer, sendMessage };
