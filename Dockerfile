FROM node:15 as back
RUN apt-get update
RUN apt-get install -y ffmpeg
WORKDIR srv
COPY back/package.json back/package-lock.json ./
RUN npm install
COPY back/ .
RUN npm run build
VOLUME /srv/public
CMD ["node", "--enable-source-maps", "./build/src/index.js"]

FROM node:15 as front
WORKDIR front/
COPY front/package.json front/package-lock.json ./
RUN npm install
COPY front/ .
RUN npm run ng build --prod
FROM nginx:1.19 as nginx
COPY --from=front front/dist/Onga /usr/share/nginx/html
COPY config/nginx/nginx.conf /etc/nginx/nginx.conf
COPY config/nginx/default.conf /etc/nginx/conf.d/default.conf
RUN mkdir /usr/share/nginx/html/files
VOLUME /usr/share/nginx/html/files
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80