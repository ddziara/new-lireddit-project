#!/bin/bash

echo What should the version be?
read VERSION

sudo docker build -t x68st91aadd/lireddit:$VERSION -f Dockerfile-server .
sudo docker login
sudo docker push x68st91aadd/lireddit:$VERSION
