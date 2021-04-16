const mongoose = require('mongoose');

const Machine = mongoose.Schema({
  macAddress: String,
  cpuLoad: Number,
  freeMem: Number,
  totalMem: Number,
  usedMem: Number,
  memUsage: Number,
  osType: String,
  upTime: Number,
  cpuType: String,
  noOfCores: Number,
  cpuLoad: Number,
});

module.exports = mongoose.model('Machine', Machine);
