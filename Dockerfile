FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY scripts ./scripts
COPY server.js ./
COPY public ./public

RUN npm install --omit=dev

EXPOSE 3000

CMD ["node", "server.js"]
