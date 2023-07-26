# build React app
FROM node:14 as build
WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build

# server React app production build
FROM nginx:1.24-alpine as production

# Create a non-root user and give the ownership of the app to this user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -D -S -G appgroup appuser && \
    chown -R appuser:appgroup /var/cache/nginx && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Switch to non-root user
USER appuser

EXPOSE 9010
CMD ["nginx", "-g", "daemon off;"]