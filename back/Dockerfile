FROM node:15
RUN apt-get update
RUN apt-get install -y ffmpeg
WORKDIR srv
COPY package.json package-lock.json ./
RUN npm install -D
COPY . ./
RUN npx eslint src/ --ext .ts
RUN npm run build
CMD ["node", "--enable-source-maps", "./build/src/index.js"]