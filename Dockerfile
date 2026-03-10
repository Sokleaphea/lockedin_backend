FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build   # compiles TypeScript

EXPOSE 3000

CMD ["npm", "start"]  # runs compiled JS