FROM node:22-alpine

WORKDIR /app

# Create package.json if it doesn't exist
COPY package*.json ./

ENV NODE_ENV=production

RUN npm ci --only=production

COPY . .

# Fix file permissions before switching user
RUN addgroup app && adduser -S -G app app
RUN chown -R app:app /app

USER app

CMD ["node", "index.js"]