# Use the official Node.js image as a parent image
FROM node:20.15.1

# # Copy library scripts to execute
# COPY scripts/*.sh /tmp/scripts/

# Set the working directory
WORKDIR /app/frontend

# Copy package.json and package-lock.json
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Start the app
CMD ["npm", "start", "--port", "3001"]