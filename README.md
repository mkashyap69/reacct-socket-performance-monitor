# react-socket-performance-monitor
A machine performance monitor made using react, redis, clusters and socket.io.

React for frontend part, os module from NodeJS for getting the performance data, and socket.io for sending the performance data continuosly from server to ui.
Mongo DB is used for storing performance data and unique macAddress of the computers.

For the app to be scalable, cluster from NodeJs is used so that any number of computers can join the server and code for diff computers can be run on diff threads of the main computer instead of using the single thread for all the connected computers, this will help the app to become scalable.

