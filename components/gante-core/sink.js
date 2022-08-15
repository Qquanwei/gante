import { useMemo, useCallback, useState, useEffect } from 'react';
import sortBy from 'ramda/src/sortBy';
import hotkeys from 'hotkeys-js';
import path from 'ramda/src/path';
import classNames from 'classnames';
import useGante from './useGante';
import useCurrentDate from './useCurrentDate';
import { connectTo } from './svgtool';
import useGrabEvent from './use-grab-event';
import { Position } from './utils';
import moment from 'moment';

/*
  泳道，绘制一个通道, 绘制连线
*/
export default function Sink() {
  const {
    list,
    listMap,
    currentId,
    startTime,
    endTime,
    SINK_HEIGHT,
    SPOT_WIDTH,
    updateItemConnect,
    currentFeatures
  } = useGante();

  const currentTime = useCurrentDate();
  const grabElementRef = useGrabEvent({});
  const currentNode = listMap[currentId];
  const [currentSelectConnect, setCurrentSelectConnect] = useState(null);
  const OFFSET_DAY = moment(currentTime).startOf('day').diff(startTime, 'days');

  const getNodeLeft = useCallback((currentNode) => {
    if (currentNode) {
      const day = moment(currentNode.startTime).diff(moment(startTime).startOf('day'), 'days');
      return day * SPOT_WIDTH;
    }
    return 0;
  }, [startTime]);

  const getNodeWidth = useCallback((item) => {
      const day = moment(item.endTime).diff(moment(item.startTime).startOf('day'), 'days');
      return day * SPOT_WIDTH;
  }, []);

  const getNodeTop = useCallback((item) => {
    return list.indexOf(item) * SINK_HEIGHT + 3;
  }, [list]);


  const left = useMemo(() => {
    return getNodeLeft(currentNode);
  }, [currentNode, getNodeLeft]);

  const onClickConnectLine = useCallback((fromNode, toNode) => {
    setCurrentSelectConnect([
      fromNode.id,
      toNode.id
    ]);
  }, []);

  const onMouseOverConnectLine = useCallback((fromNode, toNode) => {
    setCurrentSelectConnect([
      fromNode.id,
      toNode.id
    ]);
  }, []);

  const onMouseLeaveConnectLine = useCallback((fromNode, tNode) => {
    if (currentSelectConnect &&
        currentSelectConnect[0] === fromNode.id &&
        currentSelectConnect[1] === tNode.id) {
      setCurrentSelectConnect(null);
    }
  }, [currentSelectConnect]);

  const onClickEmptySVG = useCallback((event) => {
    // 双击空白创建
    if (event.detail === 2) {
    }
  }, []);

  useEffect(() => {
    hotkeys('delete,backspace', () => {
      if (currentSelectConnect) {
        updateItemConnect(currentSelectConnect[0], currentSelectConnect[1], false);
      }
    });

    return () => {
      hotkeys.unbind('delete,backspace');
    }
  }, [currentSelectConnect, updateItemConnect]);

  return (
    <div >
      <svg
        ref={grabElementRef}
        width="100%"
        height="100%"
        onClick={onClickEmptySVG}
        style={{ height: Math.max(list.length, 20) * SINK_HEIGHT}} className="bg-gray-200 cursor-grab">
        <g>
          {
            (() => {
              const length = list.length;
              const arg = [];
              for (let index = 0; index < Math.max(length, 20); ++index) {
                const features = (list[index] || {}).id === currentId ? (currentFeatures || {}) : {};

                arg.push(
                  <line key={index}
                        x1={0} y1={(index + 1) * SINK_HEIGHT}
                        x2="100%" y2={(index + 1) * SINK_HEIGHT}
                        className={classNames(
                          "stroke",
                          features.movex ? 'stroke-sky-500 stroke-2' : 'stroke-gray-400/25'
                        )}
                  />
                );
              }

              return arg;
            })()
          }
        </g>
        {/* 今天的区域 */}
        <rect
          width={SPOT_WIDTH}
          height="100%"
          x={SPOT_WIDTH * OFFSET_DAY}
          y="0"
          className="fill-red-500/25"
        />
        <g>
          {
            currentFeatures?.sort && currentNode && (
              <line x1={left} x2={left} y1={0} y2="100%" className="stroke-sky-500 stroke-2"></line>
            )
          }
        </g>

        <defs>
          <marker id="triangle"
                  fill="black"
                  strokeWidth="2px"
                  viewBox="0 0 10 10"
                  refX="1" refY="5"
                  markerUnits="strokeWidth"
                  markerWidth="10" markerHeight="10"
                  orient="auto" >
          </marker>
        </defs>

        <g className="stroke-2 stroke-gray-500"
           strokeDasharray="5,5"
           strokeLinejoin="round" fill="transparent">
          {
            // 处理connectTo
            (() => {
              let arg = [];
              for (let i = 0; i < list.length; ++i) {
                const node = list[i];
                if (node.connectTo && node.connectTo.length) {
                  const left = getNodeLeft(node);
                  const width = getNodeWidth(node);
                  const top = getNodeTop(node);

                  const fromPoint = new Position(
                    left + width + 24 + 45,
                    top + (SINK_HEIGHT - 6)/ 2,
                  );

                  arg = arg.concat(node.connectTo.map((t, idx) => {
                    const k = `${node.id}-${idx}`;
                    const tNode = listMap[t];

                    if (!tNode) {
                      return null;
                    }

                    const tLeft = getNodeLeft(tNode);
                    const tWidth = getNodeWidth(tNode);
                    const tTop = getNodeTop(tNode);

                    const toPoint = new Position(
                      tLeft,
                      tTop + (SINK_HEIGHT - 6) / 2
                    );

                    const d = connectTo(fromPoint, toPoint);
                    const selected = (
                      currentSelectConnect && currentSelectConnect[0] === node.id && currentSelectConnect[1] === tNode.id
                    );
                    // 增加 custom-order 相当于改变path的层级，达到zIndex的效果
                    arg.push(
                      <path
                        custom-order={selected ? Infinity : arg.length}
                        className={classNames({
                          ['stroke-sky-500 ring ring-gray-100 ring-offset-gray-500 ring-offset-2']: selected
                        })}
                        onMouseLeave={() => onMouseLeaveConnectLine(node, tNode)}
                        onMouseOver={() => onMouseOverConnectLine(node, tNode)}
                        onClick={() => onClickConnectLine(node, tNode)} key={k} d={d} markerEnd="url(#triangle)" ></path>
                    );
                  }));
                }
              }

              return sortBy(path(['props', 'custom-order']), arg);
            })()
          }
        </g>
      </svg>
    </div>
  );
}
