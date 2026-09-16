# Build Stage
# ---
FROM node:22 AS builder
WORKDIR /opt/app

RUN npm install -g corepack@latest && corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
RUN rm -rf node_modules && pnpm install --prod --frozen-lockfile --ignore-scripts

# Run Stage
# ---
FROM gcr.io/distroless/nodejs22-debian12

USER nobody

COPY --chown=nobody --from=builder /opt/app /opt/app
WORKDIR /opt/app

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
ENV PATH=/opt/app/node_modules/.bin:$PATH

CMD ["dist/index.js"]
