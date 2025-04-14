FROM node:slim

ENV DB_PATH=/app/data/db.sqlite
ENV TABLES_CREATION_SCRIPT_PATH=/app/src/create-tables.sql

WORKDIR /app

COPY package.json .
COPY package-lock.json .
ENV SQLITE_DB_PATH=/app/data/db.sqlite

RUN npm install

COPY src src

CMD ["npm", "run", "start"]