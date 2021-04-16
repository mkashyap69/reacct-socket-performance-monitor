//socket.io server that will serve both node and react clients

const express = require('express'),
  cluster = require('cluster'),
  net = require('net'),
  sio = require('socket.io'),
  sio_redis = require('socket.io-redis'),
  farmhash = require('farmhash'),
  socketMain = require('./socketMain');

var port = 8181,
  num_processes = require('os').cpus().length;

if (cluster.isMaster) {
  // This stores our workers. We need to keep them to be able to reference
  // them based on source IP address. It's also useful for auto-restart,
  // for example.
  var workers = [];

  // Helper function for spawning worker at index 'i'.
  var spawn = function (i) {
    workers[i] = cluster.fork();

    // Optional: Restart worker on exit
    //if for some reason the worker dies it will spawn a new one
    workers[i].on('exit', function (code, signal) {
      spawn(i);
    });
  };

  // Spawn workers.
  //spawning workers for each threads
  for (var i = 0; i < num_processes; i++) {
    spawn(i);
  }

  // Helper function for getting a worker index based on IP address.
  // This is a hot path so it should be really fast. The way it works
  // is by converting the IP address to a number by removing non numeric
  // characters, then compressing it to the number of slots we have.
  //
  // Compared against "real" hashing (from the sticky-session code) and
  // "real" IP number conversion, this function is on par in terms of
  // worker index distribution only much faster.
  var worker_index = function (ip, len) {
    return farmhash.fingerprint32(ip) % len; // Farmhash is the fastest and works with IPv6, too
  };

  // Create the outside facing server listening on our port.
  //in this case we are going to start up a tcp connection via the net module instead of the
  //http module. Express will use http, but we need an independent tcp port open for
  //cluster to work,. This is the port that will face the internet
  var server = net.createServer(
    { pauseOnConnect: true },
    function (connection) {
      // We received a connection and need to pass it to the appropriate
      // worker. Get the worker for this connection's source IP and pass
      // it the connection.
      var worker =
        workers[worker_index(connection.remoteAddress, num_processes)];
      worker.send('sticky-session:connection', connection);
    }
  );
  server.listen(port);
  console.log(`Master listening on port ${port}`);
} else {
  // Note we don't use a port here because the master listens on it for us.
  var app = new express();

  // Here you might use middleware, attach routes, etc.

  // Don't expose our internal server to the outside.
  var server = app.listen(0, 'localhost'),
    io = sio(server, {
      cors: {
        origin: 'http://localhost:3000',
        methods: ['GET'],
      },
    });

  // Tell Socket.IO to use the redis adapter. By default, the redis
  // server is assumed to be on localhost:6379. You don't have to
  // specify them explicitly unless you want to change them.
  io.adapter(sio_redis({ host: 'localhost', port: 6379 }));

  // Here you might use Socket.IO middleware for authorization etc.
  //on connection, send the socket over to our module with socket stuff
  io.on('connection', (socket) => {
    socketMain(io, socket);
  });

  // Listen to messages sent from the master. Ignore everything else.
  process.on('message', function (message, connection) {
    if (message !== 'sticky-session:connection') {
      return;
    }

    // Emulate a connection event on the server by emitting the
    // event with the connection the master sent us.
    server.emit('connection', connection);

    connection.resume();
  });
}
