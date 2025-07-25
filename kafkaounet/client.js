const { Kafka } = require('kafkajs');
require('dotenv').config();

const KAFKA_BROKERS= process.env.KAFKA_BROKERS || 'localhost:9092'

const kafka = new Kafka({
  clientId: 'mon-microservice',        // Nom du client Kafka (unique)
  brokers: [KAFKA_BROKERS],         // Adresse(s) du broker Kafka
  // ssl, sasl etc. à configurer si nécessaire
});

const producer =  kafka.producer({
  allowAutoTopicCreation: true, 
});
const consumer = kafka.consumer({ groupId: 'mon-groupe-consommateurs' });

module.exports = { kafka, producer, consumer };
