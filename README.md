# Pointing.Poker

This is the official repo for http://pointing.poker.  Pointing.Poker is an
application that allows teams to estimate agile stories.  The goal is to give
each team member the opportunity to vote before the votes are displayed to the
group, thereby facilitating important discussion.

#### Develop and Debug

First install the dependencies:

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
`docker build -t matt404:pointingpoker .`

To run the application in a local docker container:
`docker run -d -p 3000:3000 matt404:pointingpoker`

Check the container status
`docker ps`

To stop the container: (use the command above to get the container id)
`docker stop <container id>`
