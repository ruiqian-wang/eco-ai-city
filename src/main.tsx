import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="box-border flex h-dvh max-h-dvh flex-col overflow-hidden bg-[#ebe8e4] p-3">
      <div className="box-border min-h-0 flex-1 w-full overflow-hidden rounded-[20px] ring-2 ring-[#1a1a1a]">
        <App />
      </div>
    </div>
  </StrictMode>,
);
