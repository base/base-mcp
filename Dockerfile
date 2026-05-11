FROM node:22-bookworm-slim AS builder
WORKDIR /app

RUN corepack enable
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

COPY . .
RUN yarn build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build

USER node
ENTRYPOINT ["node", "build/index.js"]
