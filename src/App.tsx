import React from 'react';

import KanbanBoard from './components/Board';
import BucketView from './components/BucketView';
import { useRouter } from './hooks/useRouter';
import './App.scss';

function App(): React.JSX.Element {
  const { currentRoute, isBucketView } = useRouter();

  console.log('currentRoute', currentRoute, isBucketView);
  return (
    <div className='app'>
      {isBucketView && currentRoute.params.bucket ? (
        <BucketView
          bucket={currentRoute.params.bucket}
          token={currentRoute.params.token}
        />
      ) : (
        <KanbanBoard />
      )}
    </div>
  );
}

export default App;
