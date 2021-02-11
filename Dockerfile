FROM node:alpine3.10

RUN mkdir /app
WORKDIR /app
COPY yarn.lock package.json ./
RUN yarn

RUN mkdir /app/client
WORKDIR /app/client
COPY client/yarn.lock client/package.json ./
RUN yarn

WORKDIR /app
COPY . .
RUN yarn build

CMD ["node", "build"]
