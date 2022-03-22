#!/bin/sh
# Simple script to start bot in background
screen -d -m -S giraffebot -L -Logfile giraffebot.log node ./index.js
