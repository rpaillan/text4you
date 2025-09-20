import React from 'react';
import { Routes, Route, useParams, useSearchParams } from 'react-router-dom';

import KanbanBoard from './components/Board';
import BucketView from './components/BucketView';
import './App.scss';

// Component wrapper for BucketView to extract params
function BucketViewWrapper(): React.JSX.Element {
  const { bucket } = useParams<{ bucket: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  if (!bucket) {
    return <KanbanBoard />;
  }

  return <BucketView bucket={bucket} token={token} />;
}

function App(): React.JSX.Element {
  return (
    <div className='app'>
      <Routes>
        <Route path='/' element={<KanbanBoard />} />
        <Route path='/bucket/:bucket' element={<BucketViewWrapper />} />
      </Routes>
    </div>
  );
}

export default App;
