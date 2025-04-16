FROM node:slim

ENV DB_PATH=/app/data/db.sqlite
ENV TABLES_CREATION_SCRIPT_PATH=/app/src/create-tables.sql

WORKDIR /app

# Copy package files
COPY package*.json ./

RUN npm install

# Copy source code
COPY . .

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]