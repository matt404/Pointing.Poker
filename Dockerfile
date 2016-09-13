FROM ubuntu:16.04

MAINTAINER matt404 <docker@mswis.com>

# update the OS
RUN apt-get update
RUN apt-get dist-upgrade -y
RUN apt-get update

# install dependencies
RUN apt-get -y install curl npm
RUN npm cache clean -f
RUN npm install -g n
RUN n stable

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

# Load application layer last to preserve caching
WORKDIR /opt/app
ADD . /opt/app

EXPOSE 3000

CMD ["node", "app.js"]
