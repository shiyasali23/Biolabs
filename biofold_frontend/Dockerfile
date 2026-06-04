FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --prefer-offline --no-audit --progress=false
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runner
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/biofold.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 3001
CMD ["nginx", "-g", "daemon off;"]
