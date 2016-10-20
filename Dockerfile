FROM node:argon

# Create app directory
RUN mkdir -p /usr/src/app/web
WORKDIR /usr/src/app/web

COPY . .


# Install app dependencies
RUN npm install --production
RUN npm -g install browserify
RUN browserify client/app.js > public/main.js

# Setup environment
ENV NODE_ENV PRODUCTION
ENV WEPLAY_PORT 8080
ENV WEPLAY_IO_PORT 8081
ENV WEPLAY_IO_URL "http://$IO_PORT_8081_TCP_PORT"
ENV WEPLAY_REDIS "redis://redis:$REDIS_PORT_6379_TCP_PORT"
ENV WEPLAY_REDIS_URI "redis:$REDIS_PORT_6379_TCP_PORT"

EXPOSE 8080

# Run
CMD [ "node", "index.js" ]