import { useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      console.log('support service worker');
      navigator.serviceWorker.register('/service-worker.js');
    }
  }, []);

  return <Component {...pageProps} />
}

export default MyApp
