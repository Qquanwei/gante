import { useState, useRef, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import moment from 'moment';
import useGante from './useGante';
import useInteractionEvent from './use-interaction-event';
import NodeControlPanel from './node-control-panel';
import { positionToDay } from './utils';
import DraggleBar from './draggle-bar';

function Node({ item, index, swap }) {
  const {
    SPOT_WIDTH,
    startTime,
    updateItemDate,
    currentId,
    setCurrentId,
    setTempLine
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

  const ref = useInteractionEvent({
    onChange: (event, args) => {
      switch(event) {
      case 'hover':
        setHover(args);
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
          if (args) {
            setCurrentId(item.id);
          } else {
            setCurrentId(null);
            setHover(false);
          }
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

      case 'sort':
        {
          const { position } = args;
          const toIndex = Math.floor(args.position.y / SINK_HEIGHT) - 2;
          if (toIndex !== index && toIndex >= 0 && Number.isInteger(toIndex)) {
            swap(
              index,
              toIndex
            );
          }
          break;
        }

      case 'preview-line':
        {
          if (args) {
            const { from, to } = args;
            setTempLine({ from, to });
          } else {
            setTempLine(null);
          }
        }
        break;

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
  });

  return (
    <div ref={ref}
         className={classNames("bg-white absolute select-none text-left flex items-center box-border whitespace-nowrap transition-all", {
           'cursor-pointer outline outline-sky-400 outline-2': hover
         })}
         style={{
           left,
           top: index * SINK_HEIGHT + 2,
           height: SINK_HEIGHT- 4,
           width: width + SPOT_WIDTH,
           color: item.fgcolor || '#000',
           background: item.color || '#eee'
         }}>
      <div className={classNames("flex-start h-full", {
             'opacity-0': !hover
           })}
           data-role="left-dragger">
        <DraggleBar />
      </div>
      <span className="grow px-2">
        { item.title }
      </span>
      <div className={classNames("flex-end h-full",{ 'opacity-0': !hover })}
           data-role="right-dragger">
        <DraggleBar />
      </div>
      <div data-role="ignore-events">
        <NodeControlPanel node={item} contextInfo={contextInfo} left={left} hover={hover}/>
      </div>
    </div>
  );
}

export default function Nodes() {
  const { list, swapItem } = useGante();
  const [showNodeContext, setShowNodeContext] = useState(null);

  const swap = useCallback((fromIndex, toIndex) => {
    swapItem(fromIndex, toIndex);
  }, [list]);

  return (
    <div>
      {
        list.map((item, index) => {
          return (
            <Node item={item} key={item.id} index={index} swap={swap} />
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
