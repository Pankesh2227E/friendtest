FROM node:20-alpine

WORKDIR /app

# Install dependencies first for optimal layer caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy application files
COPY . .

ENV NODE_ENV=production

# Render injects PORT dynamically; server.js binds to process.env.PORT || 3000
EXPOSE 3000

CMD ["node", "server.js"]

