import { useCallback } from 'react';
import classNames from 'classnames';
import useGante from './useGante';

const HEIGHT = 45;

// <bg, fg> colorpair
const colors = [
  ['#CDC6A5', '#000'],
  ['#AA767C', '#fff'],
  ['#7FBEEB', '#fff'],
  ['#134074', '#fff'],
  ['#eee', '#000']
];

function NodeControlPanel({ node, contextInfo, left, hover }) {
  const { updateItemColor } = useGante();

  const onClickColor = useCallback((e) => {
    const c = colors[e.currentTarget.dataset.color];
    updateItemColor(
      node.id,
      c[0],
      c[1]
    );
  }, [node.id, updateItemColor]);

  return (
    <div
      style={{
        left: (contextInfo?.point?.x || left) - left - 100,
        top: -HEIGHT,
        width: 200,
        height: HEIGHT
      }}
      className={classNames('absolute transition-all ', {
        'hidden': !contextInfo.show
      })}>
      <div className="absolute top-0 w-full bg-gray-300/50 rounded" style={{
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
          </div>
      </div>
    </div>
  );
}

export default NodeControlPanel;
