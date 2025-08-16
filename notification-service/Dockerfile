# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production || npm install --legacy-peer-deps --production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start the service
CMD ["node", "dist/index.js"]
