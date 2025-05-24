const fs = require('fs');
const selfsigned = require('selfsigned');

// Définir les informations pour le certificat
const attrs = [
  { name: 'commonName', value: 'localhost' },
  { name: 'countryName', value: 'FR' },
  { name: 'stateOrProvinceName', value: 'Normandie' },
  { name: 'localityName', value: 'Rouen' },
  { name: 'organizationName', value: 'Musync' },
  { name: 'organizationalUnitName', value: 'Développement' },
];

// Générer le certificat SSL
const pems = selfsigned.generate(attrs, { days: 365 });

// Sauvegarder le certificat et la clé privée dans des fichiers
fs.writeFileSync('ssl/cert.pem', pems.cert);
fs.writeFileSync('ssl/key.pem', pems.private);

// Afficher un message de succès
console.log('Certificat SSL généré et sauvegardé dans "ssl/"');
