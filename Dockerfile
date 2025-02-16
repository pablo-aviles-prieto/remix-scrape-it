FROM node:18-alpine
FROM mcr.microsoft.com/playwright:focal

# Set the timezone to Madrid (Europe/Madrid) via environment variable
ENV TZ='Europe/Madrid'

RUN mkdir -p /home/app
WORKDIR /home/app

COPY package*.json .

RUN npm ci

COPY . .

RUN npx playwright install

RUN npm run build

CMD ["npm", "run", "start"]