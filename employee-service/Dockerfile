# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml (if you have one)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Stage 2: Create production image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally in production image
RUN npm install -g pnpm

# Copy only necessary files from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

# Expose the port your Express app runs on (default: 3000)
EXPOSE 3000

# Environment variables (set at runtime or in docker-compose)
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="postgresql://user:password@postgres:5432/dbname?schema=public"
ENV REDIS_URL="redis://redis:6379"

# Start the application
CMD ["pnpm", "start"]