FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx tsc --project tsconfig.json

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./
COPY --from=builder /app/src/database/migrations ./database/migrations
COPY --from=builder /app/package*.json ./
RUN npm install --only=production
RUN mkdir -p /app/bin
EXPOSE 7878
CMD ["node", "app.js"]
