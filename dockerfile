FROM alpine:latest


EXPOSE 80
EXPOSE 443


RUN apk update
RUN apk add nodejs --version 20.3.1
RUN apk add npm
RUN apk add ffmpeg


WORKDIR /usr/app

COPY package.json /usr/app
RUN npm install


COPY . /usr/app


CMD ["npm", "run", "serve"]





