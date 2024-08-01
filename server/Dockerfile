FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx tsc --project tsconfig.json

FROM node:18-alpine
WORKDIR /app
RUN mkdir -p /app/bin
COPY --from=builder /app/dist ./
COPY --from=builder /app/src/database/migrations ./database/migrations
COPY --from=builder /app/src/public/ ./public
COPY --from=builder /app/package*.json ./
RUN npm install --only=production
EXPOSE 7878
CMD ["node", "app.js"]
