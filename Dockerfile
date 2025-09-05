# Etapa de build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Etapa de execução
FROM node:20-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app ./
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 8000

CMD ["npm", "run", "start:prod"]
