FROM node:alpine
WORKDIR /home/node/srcmap-reverse
COPY package*.json ./
COPY source ./source
COPY rollup-config.js ./
COPY .babelrc ./
RUN npm install && \
    npm run postversion && \
    rm -rf source node_modules package*.json rollup-config.js .babelrc /root/.npm && \
    mv dist/* . && \
    rm -rf dist

EXPOSE 80
CMD ["node", "./srcmap-reverse.js"]
