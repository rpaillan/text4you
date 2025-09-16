import React from 'react';

import KanbanBoard from './components/Board';
import './App.scss';

function App(): React.JSX.Element {
  return (
    <div className='app'>
      <KanbanBoard />
    </div>
  );
}

export default App;
