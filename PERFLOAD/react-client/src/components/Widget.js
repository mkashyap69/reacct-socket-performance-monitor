import React from 'react';
import Cpu from './Cpu';
import Info from './Info';
import Mem from './Mem';
import './widget.css';

function Widget({
  data: {
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
    macAddress,
    isActive,
  },
}) {
  const cpuWidgetId = `cpu-widget-${macAddress}`;
  const memWidgetId = `mem-widget-${macAddress}`;
  const cpu = { cpuLoad,cpuWidgetId };
  const mem = { totalMem, usedMem, freeMem, memUsage,memWidgetId };
  const info = { macAddress, osType, upTime, cpuType, noOfCores, clockSpeed };


  let notActiveDiv = '';
  if (!isActive) {
    notActiveDiv = <div className="not-active">Offline</div>;
  }

  return (
    <div className="widget col-sm-12">
      {notActiveDiv}
      <Cpu cpuData={cpu} />
      <Mem memData={mem} />
      <Info infoData={info} />
    </div>
  );
}

export default Widget;
