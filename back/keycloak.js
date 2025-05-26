// keycloak.js
const session = require('express-session');
const Keycloak = require('keycloak-connect');

const memoryStore = new session.MemoryStore();

const keycloak = new Keycloak({ store: memoryStore }, {
  "realm": "Musync",
  "auth-server-url": "http://localhost:8181/",
  "ssl-required": "external",
  "resource": "Musync-client",
  "confidential-port": 0
});

module.exports = { keycloak, memoryStore };
