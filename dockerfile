FROM node:latest

WORKDIR /usr/src/app

# Copier package.json et package-lock.json d'abord (si ce dernier existe)
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le reste du projet
COPY . .

EXPOSE 3001

CMD ["node", "app.js"]
