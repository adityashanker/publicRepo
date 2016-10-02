#!/bin/bash
# Runner Script to setup all the required dependencies/packages

#Update the system
sudo apt-get update

#Check whether all the required files exist in the directory

if [ ! -f server.js ]
then
	echo "server.js does not exist! Exiting..."
	exit 1
fi

if [ ! -f package.json ]
then
	echo "package.json does not exist! Exiting..."
	exit 1
fi

if [ ! -f jsonitem.js ]
then
	echo "jsonitem.js does not exist! Exiting..."
	exit 1
fi

#Check whether the "app" directory already exists
if [ -d app ]
then
	echo "app already exists in the current directory! Please delete/change the directory and try again..."
	exit 1
fi	

#Install/Upgrade nodejs and npm

sudo apt-get install nodejs npm build-essential  
sudo ln -s /usr/bin/nodejs /usr/bin/node

#Setting up mongodb locally on the instance
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927

#The following line is intended to be used with Ubuntu 14.04
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list

#Please uncomment this line if Ubuntu 12.04 is being used
#echo "deb http://repo.mongodb.org/apt/ubuntu precise/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list

sudo apt-get update
sudo apt-get install -y mongodb-org

#Creating the directory and the project structure

mkdir app
mkdir app/models

#Relocate files into directory
mv server.js app/server.js
mv package.json app/package.json
mv jsonitem.js app/models/jsonitem.js

#Change directory into appFolder
cd app

#Installing required modules
npm install

#Installing forever globally
sudo npm install -g forever

#Running the server
forever start server.js

echo "Setup Done! Please check the url http://<instance-DNS>:8080/api to see if the server is running"














