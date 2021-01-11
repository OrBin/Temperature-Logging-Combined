FROM node:10-alpine as builder
WORKDIR /usr/src/app
COPY package.json package.json
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
MAINTAINER Or Bin "orbin50@gmail.com"
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80 443
CMD [ "nginx", "-g", "daemon off;" ]
