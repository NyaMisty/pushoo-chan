FROM node:16

RUN mkdir /app

WORKDIR /app

COPY . .

RUN npm i

RUN npm run build

VOLUME /app/user_config

CMD npm run start