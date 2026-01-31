# Use the official Node.js image as the base
FROM node:22

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application
COPY . .

# Build TypeScript
RUN npm run build

# Set environment variables (optional: override in production)
ENV PORT=5001

# Expose the port
EXPOSE 5001

# Start the server
CMD ["node", "dist/server.js"]
