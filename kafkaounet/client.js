const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'mon-microservice',        // Nom du client Kafka (unique)
  brokers: ['localhost:9092'],         // Adresse(s) du broker Kafka
  // ssl, sasl etc. à configurer si nécessaire
});

const producer =  kafka.producer({
  allowAutoTopicCreation: true, 
});
const consumer = kafka.consumer({ groupId: 'mon-groupe-consommateurs' });

module.exports = { kafka, producer, consumer };
