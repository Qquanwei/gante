import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import sortBy from 'ramda/src/sortBy';
import * as R from 'ramda';
import { useRecoilValueMemo as useRecoilValue } from 'recoil-enhance';
import hotkeys from 'hotkeys-js';
import path from 'ramda/src/path';
import classNames from 'classnames';
import useGante from './useGante';
import useCurrentDate from './useCurrentDate';
import { connectTo } from './svgtool';
import useGrabEvent from './use-grab-event';
import * as atoms from './atom';
import { useCreateNewNode, useEnlargeEditor } from './action';
import {
  Position, getPosition, positionToDay, dayToRect, getRangeDays,
  getScrollingElement
} from './utils';

/*
  泳道，绘制一个通道, 绘制连线
*/
export default React.memo(function Sink() {
  const {
    sinkRef,
    graphRef,
    updateItemConnect,
    setGotoTodayImpl,
  } = useGante();
  const createNewItem = useCreateNewNode();
  const list = useRecoilValue(atoms.list);
  const SINK_HEIGHT = useRecoilValue(atoms.SINK_HEIGHT);
  const SPOT_WIDTH = useRecoilValue(atoms.SPOT_WIDTH);
  const currentId = useRecoilValue(atoms.currentNodeId);
  const currentNode = useRecoilValue(atoms.currentNode);
  const currentFeatures = useRecoilValue(atoms.currentFeatures);
  const currentTime = useCurrentDate();
  const grabElementRef = useGrabEvent({});
  const [currentSelectConnect, setCurrentSelectConnect] = useState(null);
  const startTime = useRecoilValue(atoms.startTime);
  const OFFSET_DAY = getRangeDays(startTime, currentTime);
  const todayRectRef = useRef(null);
  const enlargeEditor = useEnlargeEditor();
  const connections = useRecoilValue(atoms.connections);
  const autoGotoTodayFlagRef = useRef(false);

  const { x: left } = useMemo(() => {
    if (!currentNode) {
      return {
        x: -99
      };
    }
    return dayToRect(SPOT_WIDTH, startTime, currentNode.startTime, currentNode.endTime);
  }, [currentNode, startTime, SPOT_WIDTH]);

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
      const position = getPosition(graphRef.current, event);
      const beginTime = positionToDay(SPOT_WIDTH, startTime, position.x);
      const idx= Math.ceil(position.y / SINK_HEIGHT);
      createNewItem({
        title: '新建任务',
        startTime: beginTime.valueOf(),
        endTime: beginTime.valueOf() + 7 * 24 * 60 * 60 * 1000,
      }, Math.max(idx - 1, 0));
    }
  }, [startTime, SPOT_WIDTH, createNewItem]);

  useEffect(() => {
    const gotoToday = () => {
      const scrollElement = getScrollingElement(todayRectRef.current);
      scrollElement.scrollLeft =  SPOT_WIDTH * (OFFSET_DAY - 15);
    };

    setGotoTodayImpl(gotoToday);

    if (!autoGotoTodayFlagRef.current) {
      gotoToday();
      autoGotoTodayFlagRef.current = true;
    }

    return () => {
      setGotoTodayImpl(null);
    }
  }, [setGotoTodayImpl, OFFSET_DAY, SPOT_WIDTH]);




  useEffect(() => {
    hotkeys('delete,backspace', () => {
      if (currentSelectConnect) {
        updateItemConnect(currentSelectConnect[0], currentSelectConnect[1], false);
      }
    });

    return () => {
      hotkeys.unbind('delete,backspace');
    };
  }, [currentSelectConnect, updateItemConnect]);

  const onClickEnlarge = useCallback((type) => {
    return () => {
      enlargeEditor(type);
    }
  }, [enlargeEditor]);

  const memLinEle = useMemo(() => {
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
  }, [list.length, currentFeatures, SINK_HEIGHT]);

  // 处理connectTo
  const connectToEle = useMemo(() => {
    return R.sortBy(R.prop('weight'))(connections.map(({ fromPoint, toPoint, node, tNode}, index) => {
      const selected = (
        currentSelectConnect && currentSelectConnect[0] === node.id && currentSelectConnect[1] === tNode.id
      );
      return {
        fromPoint,
        toPoint,
        node,
        tNode,
        selected,
        weight: selected ? Infinity : index
      }
    })).map(({ selected, fromPoint, toPoint, node, tNode}, index) => {
      const d = connectTo(fromPoint, toPoint);
      // 增加 custom-order 相当于改变path的层级，达到zIndex的效果
      return (
        <path
          custom-order={selected ? Infinity : index}
          className={classNames({
            ['stroke-sky-500 ring ring-gray-100 ring-offset-gray-500 ring-offset-2']: selected
          })}
          onMouseLeave={() => onMouseLeaveConnectLine(node, tNode)}
          onMouseOver={() => onMouseOverConnectLine(node, tNode)}
          onClick={() => onClickConnectLine(node, tNode)} key={index} d={d} markerEnd="url(#triangle)" ></path>
      );
    });
  }, [currentSelectConnect, connections, onMouseLeaveConnectLine, onMouseOverConnectLine, onClickConnectLine]);


  return (
    <div ref={sinkRef} className="relative" >
      <svg
        ref={grabElementRef}
        width="100%"
        height="100%"
        onClick={onClickEmptySVG}
        style={{ height: Math.max(list.length + 20, 20) * SINK_HEIGHT}} className="bg-gray-200 cursor-grab">
        <g>
          {
            memLinEle
          }
        </g>
        {/* 今天的区域 */}
        <rect
          width={SPOT_WIDTH}
          height="100%"
          ref={todayRectRef}
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
          strokeLinejoin="round"
          fill="transparent">
          {
            connectToEle
          }
        </g>
      </svg>

      <div>
        {
          list.length === 0 ? (
            <div className="fixed top-[100px] left-[100px] text-[#aaa]">小tip: 双击空白区域创建一条任务</div>
          ) : null
        }
      </div>

      <div className="absolute top-0 bottom-0 left-0 w-[60px] bg-white/30 hover:bg-white/50 cursor-pointer" onClick={onClickEnlarge('left')}></div>
      <div className="absolute top-0 bottom-0 right-0 w-[30px] bg-white/30 hover:bg-white/50 cursor-pointer" onClick={onClickEnlarge('right')}></div>
    </div>
  );
});
