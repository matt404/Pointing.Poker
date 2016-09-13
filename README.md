# Pointing.Poker

This is the official repo for http://pointing.poker.  Pointing.Poker is an
application that allows teams to estimate agile stories.  The goal is to give
each team member the opportunity to vote before the votes are displayed to the
group, thereby facilitating important discussion.

#### Develop and Debug

First install the dependencies:

* PointingPoker requires Redis, some options include:  1) You can
install redis server on your local host or 2) run redis from a container.

**Ubuntu Instructions**

```
sudo apt-get -y install redis-server npm
sudo npm cache clean -f
npm install -g n
n stable
```

To start the application:
`npm start`


#### Docker Usage

To build the docker container:

`docker build -t matt404/pointingpoker .`

To run the application in a local docker container:

```
docker run -d -p 3000:3000 matt404/pointingpoker
```

Check the container status

`docker ps`

To stop the container: (use the command above to get the container id)

`docker stop <container id>`

Attach to a container with new terminal session:

`docker exec -i -t 243c463e6d6f /bin/bash`

You can remove dangling Docker images by running:

`docker rmi -f $(docker images -qf dangling=true)`

To download and start the application from a fresh Docker host:
```
docker pull redis
docker pull pull matt404/pointingpoker

docker network create ppoker_default

docker run -d --name ppoker_redis -v redis:/var/lib/redis/data --net ppoker_default -p 6379:6379 redis

docker run -d -p 3000:3000 --net ppoker_default --link ppoker_redis:redis -e "REDIS_ADDR=ppoker_redis" -i -t matt404:pointingpoker
```
