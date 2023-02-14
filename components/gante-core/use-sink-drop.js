import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import * as atoms from './atom';

export default function useSinkDrop(sinkRef) {
  const SPOT_WIDTH = useRecoilValue(atoms.SPOT_WIDTH);
  const SINK_HEIGHT = useRecoilValue(atoms.SINK_HEIGHT);

  useEffect(() => {
    const fakeEle = document.createElement('div');
    fakeEle.style.width = SPOT_WIDTH + 'px';
    fakeEle.style.height = SINK_HEIGHT + 'px';
    fakeEle.className = 'absolute opacity-0 bg-sky-500/70';
    fakeEle.style.zIndex = 1000;
    sinkRef.current.appendChild(fakeEle);

    const dragEnter = (e) => {
      fakeEle.style.opacity = 1;
      fakeEle.style.left = e.clientX + 'px';
      fakeEle.style.top = e.clientY + 'px';
      console.log('dragEnter', e.clientX);
    };
    const dragLeave = () => {
      console.log('leave');
      //fakeEle.style.opacity = 0;
    };
    const drop = () => {};

    const sinkEle = sinkRef.current;
    sinkEle.addEventListener('dragenter', dragEnter);
    //sinkEle.addEventListener('mousemove', dragEnter);
    sinkEle.addEventListener('dragleave', dragLeave);
    sinkEle.addEventListener('drop', drop);

    return () => {
      sinkEle.removeEventListener('dragenter', dragEnter);
      sinkEle.removeEventListener('dragleave', dragLeave);
      sinkEle.removeEventListener('drop', drop);
      sinkEle.removeChild(fakeEle);
    };
  }, [SPOT_WIDTH, SINK_HEIGHT]);
}
