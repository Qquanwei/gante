import { Suspense, useState, useRef, useCallback, useMemo } from 'react';
import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import * as json1 from 'ot-json1';
import useGante from './useGante';
import * as atoms from './atom';
import * as actions from './action';
import { useSetRecoilState } from 'recoil';
import { useRecoilValueMemo as useRecoilValue } from 'recoil-enhance';
import useInteractionEvent from './use-interaction-event';
import NodeControlPanel from './node-control-panel';
import NodeFormModal from './node-form-modal';
import { positionToDay, getRangeDays } from './utils';
import DraggleBar from './draggle-bar';

const Node = React.memo(({id, index }) => {
  const item = useRecoilValue(atoms.thatNode(id));
  const updateItemProperty = actions.useUpdateItemProperty();
  const SINK_HEIGHT = useRecoilValue(atoms.SINK_HEIGHT);
  const SPOT_WIDTH = useRecoilValue(atoms.SPOT_WIDTH);
  const swapItem = actions.useSwapItem();
  const startTime = useRecoilValue(atoms.startTime);
  const setCurrentId = useSetRecoilState(atoms.currentNodeId);
  const currentId = useRecoilValue(atoms.currentNodeId);
  const setCurrentFeatures = useSetRecoilState(atoms.currentFeatures);

  const [contextInfo, setContextInfo] = useState({
    show: false,
    point: null
  });

  const width = useRecoilValue(atoms.thatNodeWidth(id));
  const left = useRecoilValue(atoms.thatNodeLeft(id));
  const days = useRecoilValue(atoms.thatNodeDays(id));
  const hover = currentId === item.id;

  const ref = useInteractionEvent(id, {
    onChange: (event, args) => {
      switch(event) {
        case 'hover':
          setCurrentFeatures({});
          if (args) {
            setCurrentId(item.id);
          } else {
            setContextInfo({
              show: false
            });
            setCurrentId(null);
          }
          break;

        case 'lock-item':
          {
            if (args.lock) {
              setCurrentId(item.id);
            } else {
              setCurrentId(null);
            }
            break;
          }

        case 'connect':
          {
            updateItemProperty(item.id, 'connectTo', [].concat(item.connectTo || [], args.targetNodeId));
            updateItemProperty(args.targetNodeId, (target, doc) => {
              if (target.from) {
                if (target?.from?.indexOf(item.id) === -1) {
                  doc.submitOp(json1.insertOp(['from', target?.from?.length || 0], item.id));
                }
              } else {
                doc.submitOp(json1.insertOp(['from'], [item.id]));
              }
            });
            break;
          }
        case 'resize':
          {
            if (args.left) {
              const newBeginTime = positionToDay(
                SPOT_WIDTH,
                startTime,
                args.left,
                Math.floor
              ).valueOf();
              if (newBeginTime <= item.endTime) {
                updateItemProperty(item.id, 'startTime', newBeginTime, 'endTime', item.endTime);
              }
            }
            if (args.width) {
              const newEndTime = positionToDay(
                SPOT_WIDTH,
                startTime,
                (args.left || left) + args.width,
                Math.floor
              ).valueOf();
              if (item.startTime <= newEndTime) {
                updateItemProperty(item.id, 'startTime', item.startTime, 'endTime', newEndTime);
              }
            }
          }
          break;

        case 'enter-move':
          setCurrentFeatures(v => ({
            ...v,
            movex: true
          }));
          break;
        case 'leave-move':
          setCurrentFeatures(v => ({
            ...v,
            movex: false
          }));
          break;

        case 'move':
          {
            const newBeginTime = positionToDay(SPOT_WIDTH, startTime, args.left);
            const newEndTime = newBeginTime.add(days - 1, 'day');
            setContextInfo({
              show: false
            });
            updateItemProperty(item.id, 'startTime', newBeginTime.valueOf(), 'endTime', newEndTime.valueOf());
          }
          break;

        case 'enter-sort':
          setCurrentFeatures(v => ({
            ...v,
            sort: true
          }));
          break;
        case 'leave-sort':
          setCurrentFeatures(v => ({
            ...v,
            sort: false
          }));
          break;
        case 'sort':
          {
            const { position } = args;
            const toIndex = Math.floor(args.position.y / SINK_HEIGHT) - 2;
            if (toIndex !== index && toIndex >= 0 && Number.isInteger(toIndex)) {
              swapItem(
                index,
                toIndex
              );
            }
            break;
          }

        case 'click':
          {
            if (args) {
              const { point } = args;
              setContextInfo({
                show: !contextInfo.show,
                point
              });
            }
          }
        default:
          break;
      }
    }
  }, {
    move: !item.lock,
    drop: false
  });

  const top = index * SINK_HEIGHT + 7;

  const closeContext = useCallback(() => {
    setContextInfo({ show: false });
  }, []);

  return (
    <div ref={ref}
      data-id={`node-${item.id}`}
      className={classNames("absolute transition-all duration-150 select-none text-left flex items-center box-border whitespace-nowrap cursor-pointer", {
        'rounded': !item.lock,
        "z-10": hover,
        'ring-2 ring-sky-500 ring-offset-4 ring-offset-white outline-none': hover && !item.lock,
        'ring-2 ring-sky-300 ring-offset-1 ring-offset-white outline-none': hover && item.lock,
        'outline outline-white': !hover && !item.lock,
      })}
      style={{
        left,
        top,
        height: SINK_HEIGHT- 15,
        width,
        color: item.fgcolor || '#000',
        background: item.color || '#eee'
      }}>
      <div className={classNames("flex-start h-full", {
        'opacity-0': !hover || item.lock
      })}
        data-role="left-dragger">
        <DraggleBar />
      </div>

      <span className={"grow px-2 sticky right-[2px] left-[2px]"}>
        { item.title }
      </span>

      <div data-role="ignore-events">
        <NodeControlPanel node={item} close={closeContext}
          contextInfo={contextInfo} left={left} hover={hover}/>

        <NodeFormModal node={item}
          close={closeContext} contextInfo={contextInfo} top={top} left={left} hover={hover}/>

        <div className={classNames("absolute left-full w-7 flex top-0 items-center", {
          hidden: !hover && !(item.connectTo && item.connectTo.length !== 0)
        })} style={{ height: SINK_HEIGHT - 12 }}>
          <div data-role="anchor" className="absolute right-[3px] w-2 h-2 rounded-full bg-sky-500 ring ring-gray-100 ring-offset-gray-300" />
        </div>


      </div>
      <div className={classNames("ml-auto sticky right-[2px] text-xs mr-2", {
        hidden: !item.lock,
      })}>
        锁定
      </div>

      <div className={classNames("flex-end h-full",{
        'opacity-0': !hover || item.lock
      })}
        data-role="right-dragger">
        <DraggleBar />
      </div>
    </div>
  );
});

export default React.memo(function Nodes() {
  const list = useRecoilValue(atoms.list);
  const [showNodeContext, setShowNodeContext] = useState(null);

  return (
    <div>
      {
        list.map((item, index) => {
          return (
            <Suspense key={item} fallback={<div>加载中</div>}>
              <Node id={item} index={index} />
            </Suspense>
          );
        })
      }
    </div>
  );
});
