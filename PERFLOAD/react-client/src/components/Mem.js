import React from 'react';
import drawCircle from '../utilities/canvasLoadAnimation';

function Mem(props) {
  const { totalMem, freeMem, memUsage } = props.memData;
  const canvas = document.querySelector(`${props.memData.memWidgetId}`);
  drawCircle(canvas, memUsage * 100);
  const totalMemGB = ((totalMem / 1073741824) * 100) / 100;
  const freeMemGB = Math.floor((freeMem / 1073741824) * 100) / 100;
  return (
    <div className="col-sm-3 mem">
      <h3>Memory Usage</h3>
      <div className="canvas-wrapper">
        <canvas
          className={props.memData.memWidgetId}
          width="200"
          height="200"
        ></canvas>
        <div className="mem-text">{memUsage * 100}%</div>
      </div>
      <div>Total Memory: {totalMemGB}gb</div>
      <div>Free Memory: {freeMemGB}gb</div>
    </div>
  );
}

export default Mem;
