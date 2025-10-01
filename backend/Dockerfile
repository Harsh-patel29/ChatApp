FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install nodemon --save-dev
COPY . .

EXPOSE 5000

CMD [ "npm","run", "dev" ]