FROM node:20-alpine as builder
WORKDIR /app
COPY package.json pnpm-lock.yaml .npmrc ./
RUN corepack enable
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM alpine:3.14 as weaviate
ARG WEAVIATE_VERSION=1.25.1
WORKDIR /app
RUN wget https://github.com/weaviate/weaviate/releases/download/v${WEAVIATE_VERSION}/weaviate-v${WEAVIATE_VERSION}-linux-amd64.tar.gz && \
  tar -xzf weaviate-v${WEAVIATE_VERSION}-linux-amd64.tar.gz

FROM node:20-alpine
ENV NUXT_DATA_PATH=/app/data
ENV NUXT_MIGRATIONS_PATH=/app/migrations
ENV NODE_ENV=production
ENV NITRO_PORT=3000
EXPOSE 3000
WORKDIR /app
RUN apk update && apk add git musl-dev
COPY --from=weaviate /app/weaviate /bin/weaviate
COPY docker/start.sh .
COPY server/db/migrations /app/migrations
RUN mkdir /app/data
COPY --from=builder /app/.output .output
CMD ["./start.sh"]
