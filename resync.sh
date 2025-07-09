#!/bin/bash
git pull
cd client
npm run build
cd ..
cd server
node server.js