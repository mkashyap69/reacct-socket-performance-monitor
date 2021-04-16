const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/perfData', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Machine = require('./models/Machine');

function socketMain(io, socket) {
  let macAddress;
  socket.on('clientAuth', (key) => {
    if (key === '5rfhfbr54frj543') {
      //valid nodeclient
      socket.join('clients');
    } else if (key === '6154fdsfgsdr43432') {
      //valid uiclient
      socket.join('ui');

      Machine.find({}, (err, docs) => {
        docs.forEach((machine) => {
          machine.isActive = false;
          io.to('ui').emit('data', machine);
        });
      });
    } else {
      //an invalid client has joined. Goodbye
      socket.disconnect(true);
    }
  });

  socket.on('disconnect', () => {
    Machine.find({ macAddress }, (err, docs) => {
      if (docs.length > 0) {
        docs[0].isActive = false;
        io.to('ui').emit('data', docs[0]);
      }
    });
  });

  //a machine is connected check to see if it's new
  //if it's not add it
  socket.on('initPerfData', async (data) => {
    //update the socket function scoped variable
    macAddress = data.macAddress;
    const mongooseResponse = await checkAndAdd(data);
    console.log(mongooseResponse);
  });

  socket.on('perfData', (data) => {
    console.log('Tick...');
    io.to('ui').emit('data', data);
  });
}

function checkAndAdd(data) {
  //bcoz we are doing db stuff js will not wait for it so we have to do a promise

  return new Promise((resolve, reject) => {
    Machine.findOne({ macAddress: data.macAddress }, (err, doc) => {
      if (err) {
        throw err;
        reject(err);
      } else if (doc === null) {
        //these are droids we are looking for
        //record is not in db so add it
        let newMachine = new Machine(data);
        newMachine.save();
        resolve('added');
      } else {
        resolve('found');
      }
    });
  });
}

module.exports = socketMain;
