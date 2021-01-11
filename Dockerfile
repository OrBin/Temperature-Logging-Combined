FROM node:10-alpine as client-builder
WORKDIR /usr/src/app
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build


FROM tiangolo/uvicorn-gunicorn-fastapi:python3.8-slim
MAINTAINER Or Bin "orbin50@gmail.com"

WORKDIR /app
COPY server/requirements.txt .
RUN pip install -r ./requirements.txt
EXPOSE 80
COPY --from=client-builder /usr/src/app/dist ./static
COPY server/ .
