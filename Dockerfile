FROM node:20-alpine as builder
WORKDIR /app
COPY package.json pnpm-lock.yaml .npmrc ./
RUN corepack enable
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
RUN pnpm tsx contrib/build-migrate.ts

FROM python:3.11-slim
ENV NUXT_DATA_PATH=/app/data
ENV NUXT_MIGRATIONS_PATH=/app/contrib/migrations
ENV NODE_ENV=production
ENV NITRO_PORT=3000
EXPOSE 3000
WORKDIR /app
RUN apt update -y && apt install curl git musl-dev -y && \
  ln -s /usr/lib/x86_64-linux-musl/libc.so /lib/libc.musl-x86_64.so.1 && \
  curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
  apt-get install -y nodejs && \
  pip install chromadb
COPY docker/start.sh .
COPY --from=builder /app/contrib/dist ./contrib
COPY --from=builder /app/.output .output
CMD ["overmind", "start"]
