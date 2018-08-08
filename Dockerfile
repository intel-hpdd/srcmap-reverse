FROM node:alpine as builder
WORKDIR /build
COPY . .
RUN npm install
RUN npm run postversion

FROM node:alpine
WORKDIR /usr/src/srcmap-reverse
COPY --from=builder /build/dist .

EXPOSE 80
CMD ["node", "./srcmap-reverse.js"]
