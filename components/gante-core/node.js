import { Suspense, useState, useRef, useCallback, useMemo } from 'react';
import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import useGante from './useGante';
import * as atoms from './atom';
import * as actions from './action';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import useInteractionEvent from './use-interaction-event';
import NodeControlPanel from './node-control-panel';
import NodeFormModal from './node-form-modal';
import { positionToDay, getRangeDays } from './utils';
import DraggleBar from './draggle-bar';

function Node({id, index }) {
  const item = useRecoilValue(atoms.thatNode(id));
  const updateItemProperty = actions.useUpdateItemProperty();
  const SINK_HEIGHT = useRecoilValue(atoms.SINK_HEIGHT);
  const SPOT_WIDTH = useRecoilValue(atoms.SPOT_WIDTH);
  const swapItem = actions.useSwapItem();
  const startTime = useRecoilValue(atoms.startTime);
  const setCurrentId = useSetRecoilState(atoms.currentNodeId);
  const setCurrentFeatures = useSetRecoilState(atoms.currentFeatures);
  const [dragMode, setDragMode] = useState(false);

  const [contextInfo, setContextInfo] = useState({
    show: false,
    point: null
  });

  const [hover, setHover] = useState(false);

  const width = useRecoilValue(atoms.thatNodeWidth(id));
  const left = useRecoilValue(atoms.thatNodeLeft(id));
  const days = useRecoilValue(atoms.thatNodeDays(id));

  const ref = useInteractionEvent(id, {
    onChange: (event, args) => {
      switch(event) {
        case 'dragenter':
          setDragMode(true);
          break;

        case 'dragleave':
          setDragMode(false);
          break;

        case 'hover':
          setHover(args);
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
              setHover(args.hover);
            }
            break;
          }

        case 'connect':
          {
            updateItemProperty(item.id, 'connectTo', [].concat(item.connectTo || [], args.targetNodeId));
            updateItemProperty(args.targetNodeId, (target) => {
              return {
                ...target,
                from: [].concat(target.from || [], item.id)
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
              updateItemProperty(item.id, 'startTime', newBeginTime, 'endTime', item.endTime);
            }
            if (args.width) {
              const newEndTime = positionToDay(
                SPOT_WIDTH,
                startTime,
                (args.left || left) + args.width,
                Math.floor
              ).valueOf();
              updateItemProperty(item.id, 'startTime', item.startTime, 'endTime', newEndTime);
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
    move: !item.lock
  });

  const top = index * SINK_HEIGHT + 7;

  return (
    <div ref={ref}
      className={classNames("absolute select-none text-left flex items-center box-border whitespace-nowrap transition-all duration-350 cursor-pointer", {
        'rounded': !item.lock,
        "z-10": hover && !dragMode,
        'ring-2 ring-sky-500 ring-offset-4 ring-offset-white outline-none': hover && !item.lock && !dragMode,
        'outline outline-white': !hover && !item.lock && !dragMode
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
        'opacity-0': !hover || item.lock,
        hidden: dragMode
      })}
        data-role="left-dragger">
        <DraggleBar />
      </div>

      {
        dragMode && (
          (() => {
            const totalDays = getRangeDays(item.startTime, item.endTime) + 1;
            const ans = [];
            for (let i = 0; i < totalDays; ++i) {
              const curDay = dayjs(item.startTime).add(i, 'days');
              ans.push(
                <div className="h-full rounded pointer-events-none box-border border bg-sky-300/20 border-white/30"
                  style={{ width: SPOT_WIDTH }}
                  key={i}></div>
              )
            }
            return ans;
          })()
        )
      }

      <span className={classNames("grow px-2 sticky overflow-hidden right-[2px] left-[2px]", {
        hidden: dragMode
      })}>
        { item.title }
      </span>

      <div data-role="ignore-events" className={classNames({ hidden: dragMode })}>
        <NodeControlPanel node={item} contextInfo={contextInfo} left={left} hover={hover}/>

        <NodeFormModal node={item} contextInfo={contextInfo} top={top} left={left} hover={hover}/>

        <div className={classNames("absolute left-full w-7 flex top-0 items-center", {
          hidden: !hover && !(item.connectTo && item.connectTo.length !== 0)
        })} style={{ height: SINK_HEIGHT - 12 }}>
          <div data-role="anchor" className="absolute right-[3px] w-2 h-2 rounded-full bg-sky-500 ring ring-gray-100 ring-offset-gray-300" />
        </div>


      </div>
      <div className={classNames("ml-auto sticky right-[2px] text-xs mr-2", {
        hidden: !item.lock || dragMode,
      })}>
        锁定
      </div>

      <div className={classNames("flex-end h-full",{
        'opacity-0': !hover || item.lock,
        hidden: dragMode
      })}
        data-role="right-dragger">
        <DraggleBar />
      </div>
    </div>
  );
}

export default React.memo(function Nodes() {
  const list = useRecoilValue(atoms.list);
  const [showNodeContext, setShowNodeContext] = useState(null);

  return (
    <div>
      {
        list.map((item, index) => {
          return (
            <Suspense key={item}>
              <Node id={item} index={index} />
            </Suspense>
          );
        })
      }
    </div>
  );
});


export function getStaticProps() {
  return {
    props: {
      hello: "world"
    }
  };
}
