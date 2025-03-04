import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      console.log('support service worker');
      navigator.serviceWorker.register('/service-worker.js');
    }
  }, []);

  return (
    <div>
      <Component {...pageProps} />
      <ToastContainer></ToastContainer>
    </div>

  )

}

export default MyApp
