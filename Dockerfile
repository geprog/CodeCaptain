FROM node:18-alpine as builder
WORKDIR /app
COPY package.json pnpm-lock.yaml .npmrc ./
RUN corepack enable
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:18-alpine as overmind
WORKDIR /app
RUN apk add --update curl gzip
RUN curl https://github.com/DarthSim/overmind/releases/download/v2.4.0/overmind-v2.4.0-linux-amd64.gz -L -o overmind.gz
RUN gunzip overmind.gz
RUN chmod +x overmind

FROM python:3.11-slim
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
EXPOSE 3000
WORKDIR /app
COPY --from=builder /app/.output .output
COPY --from=overmind /app/overmind /bin/overmind
RUN apt update -y && apt install tmux nodejs -y
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY Procfile .
COPY ai ai
CMD ["overmind", "start"]
