import { useState, useRef, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import moment from 'moment';
import useGante from './useGante';
import styles from './index.module.css';
import useInteractionEvent from './use-interaction-event';
import { positionToDay } from './utils';

function Node({ item, index, swap }) {
    const {
        SPOT_WIDTH,
        startTime,
        updateItemDate,
        setCurrentId,
        setTempLine,
        TODOLIST_WIDTH
    } = useGante();

    const { SINK_HEIGHT } = useGante();
    const [hover, setHover] = useState(false);

    const width = useMemo(() => {
        const day = moment(item.endTime).diff(moment(item.startTime), 'days') || 1;
        return day * SPOT_WIDTH;
    }, [item.startTime, item.endTime]);

    const left = useMemo(() => {
        const day = moment(item.startTime).diff(moment(startTime), 'days');
        return TODOLIST_WIDTH + day * SPOT_WIDTH;
    }, [item.startTime, startTime, TODOLIST_WIDTH]);

    const ref = useInteractionEvent({
        onChange: (event, args) => {
            switch(event) {
                case 'hover':
                    setHover(args);
                    if (args) {
                        setCurrentId(item.id);
                    } else {
                        setCurrentId(null);
                    }
                    break;

                case 'resize':
                    {
                        const newBeginTime = positionToDay(
                            SPOT_WIDTH, startTime, (args.left || left) - TODOLIST_WIDTH).valueOf();
                        const newEndTime = positionToDay(
                            SPOT_WIDTH, startTime, (args.left || left) + args.width - TODOLIST_WIDTH).valueOf();
                        updateItemDate(item.id, newBeginTime, newEndTime);
                    }
                    break;

                case 'move':
                    {
                        const newBeginTime = positionToDay(SPOT_WIDTH, startTime, args.left - TODOLIST_WIDTH).valueOf();
                        const newEndTime = positionToDay(SPOT_WIDTH, startTime, args.left + width - TODOLIST_WIDTH).valueOf();
                        updateItemDate(
                            item.id,
                            newBeginTime,
                            newEndTime
                        );
                    }
                    break;

                case 'swap':
                    if (Math.floor(args.top / SINK_HEIGHT) !== index) {
                        swap(item, Math.floor(args.top / SINK_HEIGHT));
                    }
                    break;

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
                default:
                    break;
            }
        }
    });

    return (
        <div ref={ref}
            className={classNames(styles.node, {
                [styles.hover]: hover
            })}
            style={{
                left,
                top: index * SINK_HEIGHT,
                height: SINK_HEIGHT,
                width
            }}>
            { item.title }
            <div className={styles.resizebar} data-role="left-dragger">::</div>
            <div className={styles.resizebar} data-role="right-dragger">::</div>
            <div className={styles.anchor} data-role="anchor"></div>
        </div>
    );
}

export default function Nodes() {
    const { list, swapItem } = useGante();

    const swap = useCallback((fromItem, toPosition) => {
        swapItem(list.indexOf(fromItem), toPosition);
    }, [list]);

    return (
        <div>
            {
                list.map((item, index) => {
                    return (
                        <Node item={item} key={item.id} index={index} swap={swap} />
                    )
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
    }
}
