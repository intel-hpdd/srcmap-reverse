FROM node:6
WORKDIR /home/node/srcmap-reverse
COPY package*.json ./
COPY source ./source
COPY test ./test
COPY *config*.js ./
COPY .babelrc ./
COPY test/fixtures/built-fd5ce21b.js.map.json /tmp
RUN npm install && npm run postversion

EXPOSE 80
CMD ["node", "./dist/srcmap-reverse.js"]
