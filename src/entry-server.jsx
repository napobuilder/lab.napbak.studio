import React, { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import TusasongDashboard from './pages/TusasongDashboard.jsx';

export function render(url = '/') {
  let appHtml = '';
  
  if (url === '/vip/tusasong') {
    appHtml = renderToString(
      <StrictMode>
        <TusasongDashboard />
      </StrictMode>
    );
  } else if (url === '/piano') {
    appHtml = renderToString(
      <StrictMode>
        <App initialRoute="piano" />
      </StrictMode>
    );
  } else if (url === '/vip' || url === '/deal' || url === '/reels') {
    appHtml = renderToString(
      <StrictMode>
        <App initialRoute="vip" />
      </StrictMode>
    );
  } else if (url === '/curso') {
    appHtml = renderToString(
      <StrictMode>
        <App initialRoute="curso" />
      </StrictMode>
    );
  } else if (url === '/gracias-curso') {
    appHtml = renderToString(
      <StrictMode>
        <App initialRoute="gracias-curso" />
      </StrictMode>
    );
  } else {
    appHtml = renderToString(
      <StrictMode>
        <App initialRoute="analyzer" />
      </StrictMode>
    );
  }

  return { appHtml };
}
