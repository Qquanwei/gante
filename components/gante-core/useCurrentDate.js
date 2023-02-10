import { useEffect, useState } from 'react';

export default function useCurrentDate() {
  const [date, setDate] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(Date.now());
    }, 60 * 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return date;
}
