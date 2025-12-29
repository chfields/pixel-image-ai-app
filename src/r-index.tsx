import React from 'react';
import { createRoot } from 'react-dom/client';
import { Providers } from './providers';
import App from './pages/app';

const root = createRoot(document.body);
root.render(
  <Providers>
    <main className="w-full h-full flex items-center justify-center">
      <App />
    </main>
  </Providers>
);