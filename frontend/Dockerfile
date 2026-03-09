FROM node:22
WORKDIR /app
COPY  package*.json /app/
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5173
CMD [ "npm","start" ]