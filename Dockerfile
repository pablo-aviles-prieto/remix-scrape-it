FROM node:20-alpine
FROM mcr.microsoft.com/playwright:focal

RUN mkdir -p /home/app
WORKDIR /home/app

COPY package*.json .

RUN npm ci

COPY . .

RUN npx playwright install

RUN npm run build

CMD ["npm", "run", "start"]