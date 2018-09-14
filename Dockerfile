FROM nginx:alpine
MAINTAINER Or Bin "orbin50@gmail.com"

COPY . /app
WORKDIR /app

RUN apk add nodejs
RUN npm install && npm install -g @angular/cli
RUN ng build --prod
RUN mv dist/ /tmp/dist && rm -rf ./* && mv /tmp/dist/ dist

COPY nginx.conf /etc/nginx/nginx.conf
