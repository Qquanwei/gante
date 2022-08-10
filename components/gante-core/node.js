import { useState, useRef, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { Transition } from '@headlessui/react';
import moment from 'moment';
import useGante from './useGante';
import useInteractionEvent from './use-interaction-event';
import NodeControlPanel from './node-control-panel';
import NodeFormModal from './node-form-modal';
import { positionToDay } from './utils';
import DraggleBar from './draggle-bar';

function Node({ item, index }) {
  const {
    SPOT_WIDTH,
    startTime,
    swapItem,
    updateItemConnect,
    updateItemDate,
    currentId,
    setCurrentId,
    setCurrentFeatures
  } = useGante();
  const [contextInfo, setContextInfo] = useState({
    show: false,
    point: null
  });

  const { SINK_HEIGHT } = useGante();
  const [hover, setHover] = useState(false);

  const width = useMemo(() => {
    const day = moment(item.endTime).diff(moment(item.startTime).startOf('day'), 'days');
    return day * SPOT_WIDTH;
  }, [item.startTime, item.endTime]);

  const left = useMemo(() => {
    const day = moment(item.startTime).diff(moment(startTime).startOf('day'), 'days');
    return day * SPOT_WIDTH;
  }, [item.startTime, startTime]);

  const ref = useInteractionEvent(item.id, {
    onChange: (event, args) => {
      switch(event) {
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
          updateItemConnect(item.id, args.targetNodeId);
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
            updateItemDate(item.id, newBeginTime, item.endTime);
          }
          if (args.width) {
            const newEndTime = positionToDay(
              SPOT_WIDTH,
              startTime,
              (args.left || left) + args.width,
              Math.floor
            ).valueOf();
            updateItemDate(item.id, item.startTime, newEndTime);
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
          const newBeginTime = positionToDay(SPOT_WIDTH, startTime, args.left).valueOf();
          const newEndTime = positionToDay(SPOT_WIDTH, startTime, args.left + width).valueOf();
          setContextInfo({
            show: false
          });

          updateItemDate(
            item.id,
            newBeginTime,
            newEndTime
          );
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

  const top = index * SINK_HEIGHT + 3;

  return (
    <div ref={ref}
         className={classNames("absolute select-none text-left flex items-center box-border whitespace-nowrap transition-all duration-350 cursor-pointer", {
           'rounded': !item.lock,
           "z-10": hover,
           'ring-2 ring-sky-500 ring-offset-4 ring-offset-white outline-none': hover && !item.lock,
           'outline outline-white': !hover && !item.lock
         })}
         style={{
           left,
           top,
           height: SINK_HEIGHT- 6,
           width: width + SPOT_WIDTH,
           color: item.fgcolor || '#000',
           background: item.color || '#eee'
         }}>
      <div className={classNames("flex-start h-full", {
             'opacity-0': !hover || item.lock
           })}
           data-role="left-dragger">
        <DraggleBar />
      </div>
      <span className="grow px-2">
        { item.title }
      </span>

      <div data-role="ignore-events">

        <NodeControlPanel node={item} contextInfo={contextInfo} left={left} hover={hover}/>

        <NodeFormModal node={item} contextInfo={contextInfo} top={top} left={left} hover={hover}/>

        <div className={classNames("absolute left-full w-7 flex top-0 items-center", {
               hidden: !hover && !(item.connectTo && item.connectTo.length !== 0)
             })} style={{ height: SINK_HEIGHT - 6 }}>
          <div data-role="anchor" className="absolute right-1 w-2 h-2 rounded-full bg-sky-500 ring ring-gray-100 ring-offset-gray-300"></div>
        </div>


      </div>
      <div className={classNames("ml-auto sticky right-2 text-xs mr-2", { hidden: !item.lock })}>
        锁定
      </div>

      <div className={classNames("flex-end h-full",{ 'opacity-0': !hover || item.lock })}
           data-role="right-dragger">
        <DraggleBar />
      </div>
    </div>
  );
}

export default function Nodes() {
  const { list } = useGante();
  const [showNodeContext, setShowNodeContext] = useState(null);

  return (
    <div>
      {
        list.map((item, index) => {
          return (
            <Node item={item} key={item.id} index={index} />
          );
        })
      }
    </div>
  );
}


export function getStaticProps() {
  return {
    props: {
      hello: "world"
    }
  };
}
