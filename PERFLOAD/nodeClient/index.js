// This is a node client take system performance data and send it to the socket server

//node module for getting sys performance data
const os = require('os');
const io = require('socket.io-client');
let socket = io('http://localhost:8181');

socket.on('connect', () => {
  const ni = os.networkInterfaces();
  let macAddress;
  for (key in ni) {
    //for testing purpose
    macAddress = Math.floor(Math.random() * 3) + 1;
    break;

    if (!ni[key][0].internal) {
      if (ni[key][0].mac === '00:00:00:00:00:00') {
        macAddress = Math.random().toString(36).substr(2, 15);
      } else {
        macAddress = ni[key][0].mac;
      }

      break;
    }
  }

  performanceData().then((allPerformanceData) => {
    allPerformanceData.macAddress = macAddress;
    socket.emit('initPerfData', allPerformanceData);
  });

  socket.emit('clientAuth', '5rfhfbr54frj543');
  let perfDataInterval = setInterval(() => {
    performanceData().then((allPerformanceData) => {
      allPerformanceData.macAddress = macAddress;

      socket.emit('perfData', allPerformanceData);
    });
  }, 1000);

  socket.on('disconnect', () => {
    clearTimeout(perfDataInterval);
  });
});

function performanceData() {
  return new Promise(async (resolve, reject) => {
    const cpus = os.cpus();
    //What do we need to know from node about performance?
    //- CPU load (current)
    // - Memory load (current)
    //  - free
    const freeMem = os.freemem();
    //  - total
    const totalMem = os.totalmem();
    const usedMem = totalMem - freeMem;

    const memUsage = Math.floor((usedMem / totalMem) * 100) / 100;
    //- OS Type
    const osType = os.type() == 'Darwin' ? 'Mac' : os.type();
    //- uptime
    const upTime = os.uptime();
    //- CPU Info
    //    - Type
    const cpuType = cpus[0].model;
    //    - Number of Cores
    const noOfCores = cpus.length;
    //    - Clock Speed
    const clockSpeed = cpus[0].speed;
    const cpuLoad = await getCpuLoad();
    const isActive = true;

    resolve({
      freeMem,
      totalMem,
      usedMem,
      memUsage,
      osType,
      upTime,
      cpuType,
      noOfCores,
      clockSpeed,
      cpuLoad,
      isActive,
    });
  });
}

//cpus is all cores and we need the average of all the cores
//which will give us the cpu average

function cpuAverage() {
  const cpus = os.cpus();
  //get ms in each mode, but this number is since reboot
  //so get it now and get it in 100ms and compare
  let idleMs = 0;
  let totalMs = 0;

  //lope through each core
  cpus.forEach((core) => {
    for (type in core.times) {
      totalMs += core.times[type];
    }
    idleMs += core.times.idle;
  });

  return {
    idle: idleMs / cpus.length,
    total: totalMs / cpus.length,
  };
}

//because the times property is time since boot, we will get
//now times, and 100ms from now times, Compare them, that will give us current load

function getCpuLoad() {
  return new Promise((resolve, reject) => {
    const start = cpuAverage();
    setTimeout(() => {
      const end = cpuAverage();
      const idleDiff = end.idle - start.idle;
      const totalDiff = end.total - start.total;
      //calc % load
      const percentageLoad = 100 - Math.floor((100 * idleDiff) / totalDiff);
      resolve(percentageLoad);
    }, 100);
  });
}
