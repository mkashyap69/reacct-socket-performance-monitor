import { useState, useEffect } from 'react';
import './App.css';
import Widget from './components/Widget';
import socket from './utilities/socketConnection';

function App() {
  let widgets = [];
  const [perfData, setPerfData] = useState({});

  useEffect(() => {
    socket.on('data', (data) => {
      const currentState = { ...perfData };

      currentState[data.macAddress] = data;
      setPerfData(currentState);
    });
  }, [perfData]);

  //converting objects to array
  Object.entries(perfData).forEach(([key, value]) => {
    widgets.push(<Widget key={key} data={value} />);
  });

  return <div className="App">{widgets}</div>;
}

export default App;
