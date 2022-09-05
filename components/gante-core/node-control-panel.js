import { useCallback, useRef } from 'react';
import { Transition } from '@headlessui/react';
import classNames from 'classnames';
import useGante from './useGante';
import * as actions from './action';

const HEIGHT = 45;
const WIDTH = 280;

// <bg, fg> colorpair
const colors = [
  ['#eee', '#000'],
  ['#000', '#fff'],
  ['#CDC6A5', '#000'],
  ['#AA767C', '#fff'],
  ['#7FBEEB', '#fff'],
  ['#134074', '#fff'],
];

function NodeControlPanel({ node, contextInfo, left, hover }) {
  const { updateItemColor, deleteItem, updateItemLock } = useGante();
  const leftRef = useRef(0);

  const updateItemProperty = actions.useUpdateItemProperty();

  const onClickColor = useCallback((e) => {
    const c = colors[e.currentTarget.dataset.color];
    updateItemProperty(node.id, 'color', c[0], 'fgcolor', c[1]);
  }, [node.id, updateItemProperty]);

  const onClickDelete = useCallback(() => {
    deleteItem(node.id);
  }, [node.id, deleteItem]);

  const onClickLock = useCallback(() => {
    updateItemLock(node.id, !node.lock);
  }, [node.id, node.lock]);

  const show = hover && contextInfo.show;

  if (show) {
    leftRef.current = (contextInfo?.point?.x || left) - left - (WIDTH/2);
  }

  return (
    <Transition show={show}
                enter="transition-opacity duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100" >
      <div
        style={{
          left: leftRef.current,
          top: -HEIGHT,
          width: WIDTH,
          height: HEIGHT
        }}
        className='absolute'>
        <div className="absolute top-0 w-full bg-gray-300/80 rounded" style={{
               height: HEIGHT - 10
             }}>
          <div className="flex cursor-auto items-center justify-start px-[8px] h-full">
            {
              colors.map((color, index) => {
                return (
                  <div key={index} onClick={onClickColor} data-color={index} style={{ background: color[0], width: 24, height: 24 }} className="cursor-pointer rounded-full ml-[8px] border border-white"></div>
                )
              })
            }

            <span className="mr-auto ml-2  text-[12px] text-black cursor-pointer" onClick={onClickLock}>
              {
                node.lock ? '解锁' : '锁定'
              }
            </span>
            <span
              className={classNames("px-1 ml-1 bg-white-500 text-[12px] cursor-pointer text-red-500", {
                hidden: node.lock
              })} onClick={onClickDelete}>
              删除
            </span>
          </div>
        </div>
      </div>
    </Transition>
  );
}

export default NodeControlPanel;
