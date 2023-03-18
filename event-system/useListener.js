import { useEffect, useRef } from 'react';
import { createEventListener } from 'tiny-event-manager';

export default function useListener(domRef, eventName, listener) {
  const listenerRef = useRef(null);

  listenerRef.current = listener;

  useEffect(() => {
    const sub = createEventListener(domRef.current, eventName, (e) => {
      listenerRef.current(e);
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);
}
