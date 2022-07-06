import { useRef, useEffect } from 'react';

export default function useClickOutside(outSideCallback, deps) {
    const ref = useRef(null);

    useEffect(() => {
        const click = (event) => {
            if (ref.current) {
                if (!ref.current.contains(event.target)) {
                    outSideCallback();
                }
            }
        }

        /*
          如果在一个事件正在处理过程中执行 removeEventListener, addEventListener 会导致立即触发click事件，这往往不是我们希望的。所以这里执行一次延时绑定
         */

        setTimeout(() => {
            document.addEventListener('click', click);
        });

        return () => {
            document.removeEventListener('click', click);
        }
    }, deps);

    return ref;
}
