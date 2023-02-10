FROM node:15
WORKDIR /app
COPY package.json .
# the "." above means the "/app" directory
ARG NODE_ENV
# the line above is to accept NODE_ENV as environment variable
RUN if [ "$NODE_ENV" = "development" ]; \
        then npm install; \
        else npm install --only=production; \
        fi
# the if statement above is so that the devDependencies 
# do not get installed in case of production mode
COPY . ./

ENV PORT 3000
EXPOSE $PORT
# Here the PORT is the application's (react)
CMD ["node", "index.js"]
 