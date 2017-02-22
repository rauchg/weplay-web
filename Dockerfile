FROM node:7

# Create app directory
RUN mkdir -p /usr/src/app/web
WORKDIR /usr/src/app/web

COPY . .


# Install app dependencies
RUN npm install
RUN npm run build

# Setup environment
ENV NODE_ENV production
ENV WEPLAY_PORT 8080
ENV WEPLAY_IO_PORT 8081
ENV WEPLAY_IO_URL "http://io:8081"
ENV WEPLAY_REDIS "redis://redis:6379"
ENV WEPLAY_REDIS_URI "redis:6379"
ENV WEPLAY_LOGSTASH_URI "logstash:5001"

EXPOSE 8080

# Run
CMD [ "npm", "start" ]