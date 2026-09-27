FROM node:22.23.2-alpine3.24

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY src ./src

USER node

EXPOSE 8080

CMD ["node", "src/server.js"]
