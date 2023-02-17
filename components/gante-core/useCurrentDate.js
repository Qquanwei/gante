import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export default function useCurrentDate() {
  const [date, setDate] = useState(() => dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(dayjs());
    }, 60 * 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return date;
}
