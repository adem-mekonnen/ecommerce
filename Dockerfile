# Use an official Node runtime as a parent image
FROM node:20-bullseye

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the app
COPY . .

# Expose the dev port
EXPOSE 3000

# Default command (overridden by docker compose in dev)
CMD ["npm", "run", "dev"]
