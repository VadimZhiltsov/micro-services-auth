FROM node:10

WORKDIR /usr/src/app

RUN npm install -g nodemon

COPY package*.json ./
COPY . .

RUN npm install
EXPOSE 80

CMD [ "nodemon", "src/index.js" ]

