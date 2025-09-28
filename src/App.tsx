import React from 'react';
import { Routes, Route, useParams, useSearchParams } from 'react-router-dom';

import KanbanBoard from './components/Board';
import BucketView from './components/BucketView';
import BucketCreation from './components/BucketCreation';
import NotFound from './components/NotFound';
import { useKanbanStore } from './store/kanbanStore';
import './App.scss';
import { CodeGenBack } from './components/CodeGenBack';

// Component wrapper for BucketView to extract params
function BucketViewWrapper(): React.JSX.Element {
  const { bucket } = useParams<{ bucket: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const getBucketConfig = useKanbanStore(state => state.getBucketConfig);
  const buckets = useKanbanStore(state => state.buckets);

  if (!bucket) {
    return <KanbanBoard />;
  }

  // Check if bucket exists
  const bucketConfig = getBucketConfig(bucket);

  // If bucket doesn't exist and we have buckets loaded, show creation form
  if (!bucketConfig && buckets.length > 0) {
    return <BucketCreation bucketName={bucket} />;
  }

  // If no buckets are loaded yet, or bucket exists, show the bucket view
  return <BucketView bucket={bucket} token={token} />;
}

function App(): React.JSX.Element {
  return (
    <>
    <CodeGenBack />
    <div className='app'>
      <Routes>
        <Route path='/' element={<KanbanBoard />} />
        <Route path='/bucket/:bucket' element={<BucketViewWrapper />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
    </>
  );
}

export default App;
