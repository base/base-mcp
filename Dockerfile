FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production || npm install

COPY . .
RUN npm run build

ENTRYPOINT ["node", "build/index.js"]
