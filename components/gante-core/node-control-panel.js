import { useCallback } from 'react';
import classNames from 'classnames';
import useGante from './useGante';

const HEIGHT = 45;
const WIDTH = 270;

// <bg, fg> colorpair
const colors = [
  ['#CDC6A5', '#000'],
  ['#AA767C', '#fff'],
  ['#7FBEEB', '#fff'],
  ['#134074', '#fff'],
  ['#eee', '#000']
];

function NodeControlPanel({ node, contextInfo, left, hover }) {
  const { updateItemColor, deleteItem } = useGante();

  const onClickColor = useCallback((e) => {
    const c = colors[e.currentTarget.dataset.color];
    updateItemColor(
      node.id,
      c[0],
      c[1]
    );
  }, [node.id, updateItemColor]);

  const onClickDelete = useCallback(() => {
    deleteItem(node.id);
  }, [node.id]);

  return (
    <div
      style={{
        left: (contextInfo?.point?.x || left) - left - (WIDTH/2),
        top: -HEIGHT,
        width: WIDTH,
        height: HEIGHT
      }}
      className={classNames('absolute transition-all ', {
        'hidden': !contextInfo.show
      })}>
      <div className="absolute top-0 w-full bg-gray-300/80 rounded" style={{
             height: HEIGHT - 10
           }}>
        <div className="flex cursor-auto items-center justify-start px-2 h-full">
          {
            colors.map((color, index) => {
              return (
                <div key={index} onClick={onClickColor} data-color={index} style={{ background: color[0], width: 24, height: 24 }} className="cursor-pointer rounded-full ml-2 border border-white"></div>
              )
            })
          }

          <span className="px-1 ml-auto bg-white-500 text-xs cursor-pointer text-red-500 ml-2" onClick={onClickDelete}>删除</span>
          </div>
      </div>
    </div>
  );
}

export default NodeControlPanel;
