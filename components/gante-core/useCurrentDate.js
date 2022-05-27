import { useEffect, useState } from 'react';

export default function useCurrentDate() {
    const [date, setDate] = useState(() => Date.now());

    useEffect(() => {
        const timer = setTimeout(() => {
            setDate(Date.now());
        }, 60000);

        return () => {
            clearTimeout(timer);
        }
    }, []);

    return date;
}
