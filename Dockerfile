FROM node:24-alpine AS builder

## Working directory: everything works from here
WORKDIR /app

## Install the pnpm version pinned by packageManager so frozen-lockfile stays stable
RUN npm install -g pnpm@9.0.0

## Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
## Copy package to apps
COPY apps ./apps
## Copy packages into app/packages
COPY packages ./packages
## Copy turbo - this files builds pipeline
COPY turbo.json ./

## Frozen lock - Exact dependencies
RUN pnpm install --frozen-lockfile

## Build the app
RUN pnpm build

## This image is tiny and perfect for serving static files. No Node. No pnpm. No build tools. Just a web server.
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 5050

CMD ["nginx", "-g", "daemon off;"]
