FROM node:18

WORKDIR /usr/src/tag4me

COPY . /usr/src/tag4me/

RUN yarn install 

ENTRYPOINT [ "yarn", "start" ]