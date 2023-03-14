import { useConnectionRef, useGetDoc } from 'recoil-sharedb';
import React, { useEffect, Fragment, useRef } from 'react';
import crypto from 'crypto';
import { getPosition, throttle } from './utils';
import useGante from './useGante';
import { busy } from './use-interaction-event';

const colors = [
  { fill: 'red' },
  { fill: 'green' },
  { fill: 'blue' },
  { fill: 'black' }
];

const localPresenceId = crypto.randomBytes(24).toString('hex');

export default React.memo(function CursorCanvas() {
  const connectionRef = useConnectionRef();
  const getDoc = useGetDoc();
  const containerRef = useRef();
  const { graphRef, user } = useGante();

  useEffect(() => {
    const doc = getDoc('list', '<docId>');
    const presence = connectionRef.current.getPresence(`${doc.collection}.${doc.id}.mousemove`);

    presence.subscribe();


    let domMap = {};
    let length = 0;
    let mouseDown = false;
    const local = presence.create(localPresenceId);

    const onMouseDown = () => {
      mouseDown = true;
    };

    const onMouseUp = () => {
      mouseDown = false;
    };

    const onMouseMove = throttle((e) => {
      if (busy) {
        return;
      }
      if (!mouseDown) {
        local.submit({
          user: user?.userName || user?.phone ? user.phone.slice(-4) : '',
          position: getPosition(graphRef.current, e),
          count: 1
        });
      }
    }, 50);

    const onReceive = (presenceId, update) => {
      if (presenceId === local.presenceId) {
        return;
      }
      if (update) {
        if (domMap[presenceId]) {
          domMap[presenceId].style.transform = `translateX(${update.position.x}px) translateY(${update.position.y - 60}px)`;
        } else {
          if (length < 10) {
            domMap[presenceId] = document.createElement('div');
            const ns = document.createElementNS('http://www.w3.org/2000/svg', "svg");
            ns.setAttribute('viewBox', "0 0 16 16");
            ns.setAttribute('width', 20);
            ns.setAttribute('height', 20);
            ns.innerHTML = `<path fill=${colors[length % colors.length].fill} d="M13.3 9.06 4.67 2.22l1.32 10.93 2.04-2.88 2.43 4.35 1.75-.98-2.44-4.35 3.53-.23z"/>`;
            domMap[presenceId].appendChild(ns);
            const name = document.createElement('div');
            name.className = 'absolute left-[10px]';
            name.innerText = update.user || '匿名用户';
            domMap[presenceId].appendChild(name);

            domMap[presenceId].className='transition-all ease-out duration-75 absolute whitespace-nowrap text-[12px] left-0 pointer-events-none  bg-contain top-0 w-[20px] h-[20px] z-10';
            containerRef.current.appendChild(domMap[presenceId]);
            length ++;
          }
        }
      } else {
        if (domMap[presenceId]) {
          containerRef.current.removeChild(domMap[presenceId]);
          domMap[presenceId] = null;
          length --;
        }
      }
    }

    presence.on('receive', onReceive);

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      presence.off('receive', onReceive);
      presence.destroy();
      local.destroy();
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
    }
  }, [user]);

  return (
    <div ref={containerRef}></div>
  );
});
