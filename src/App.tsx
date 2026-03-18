import { useState } from 'react';
import { ConfigPage, LotteryPage } from './components';
import type { LotteryConfig } from './types';

type Page = 'config' | 'lottery';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('config');
  const [config, setConfig] = useState<LotteryConfig | null>(null);

  const handleConfigComplete = (newConfig: LotteryConfig) => {
    setConfig(newConfig);
    setCurrentPage('lottery');
  };

  return (
    <div>
      {currentPage === 'config' && (
        <ConfigPage onConfigComplete={handleConfigComplete} />
      )}
      {currentPage === 'lottery' && config && (
        <LotteryPage config={config} />
      )}
    </div>
  );
}

export default App;
