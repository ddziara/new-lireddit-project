FROM node:16
ARG BUILD_CONTEXT

# Create app directory
WORKDIR /usr/src/app

# install yarn 3
RUN corepack enable
RUN yarn set version 3.5.1

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json ./
COPY yarn.lock ./
COPY .yarnrc.yml ./
COPY tsconfig.json ./
COPY ./packages/$BUILD_CONTEXT/package.json packages/$BUILD_CONTEXT/
COPY ./.yarn/plugins .yarn/plugins
COPY ./.yarn/sdks .yarn/sdks

RUN yarn
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY ./packages/$BUILD_CONTEXT packages/$BUILD_CONTEXT

# Compile typescript files
RUN yarn workspace server build

ENV NODE_ENV production

EXPOSE 8080
CMD node packages/$BUILD_CONTEXT/dist/index.js
USER node



