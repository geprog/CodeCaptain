FROM node:20-alpine as builder
WORKDIR /app
COPY package.json pnpm-lock.yaml .npmrc ./
RUN corepack enable
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine as overmind
WORKDIR /app
RUN apk add --update curl gzip
RUN curl https://github.com/DarthSim/overmind/releases/download/v2.4.0/overmind-v2.4.0-linux-amd64.gz -L -o overmind.gz
RUN gunzip overmind.gz
RUN chmod +x overmind

FROM python:3.11-slim
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
ENV NUXT_DATA_PATH=/app/data
EXPOSE 3000
WORKDIR /app
RUN apt update -y && apt install tmux nodejs git musl-dev -y
RUN ln -s /usr/lib/x86_64-linux-musl/libc.so /lib/libc.musl-x86_64.so.1
RUN pip install chromadb
COPY Procfile .
COPY --from=overmind /app/overmind /bin/overmind
COPY --from=builder /app/.output .output
CMD ["overmind", "start"]
