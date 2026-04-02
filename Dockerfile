FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

ENV MONGO_URL=mongodb://root:example@mongodb:27017/bonial?authSource=admin

EXPOSE 3000

CMD ["npm", "run", "dev"]
