import { useCallback } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import useCurrentDate from './useCurrentDate';
import styles from './index.module.css';
import useGante from './useGante';
/*
   展示时间轴，横轴
*/
export default function Timeline() {
    const { SPOT_WIDTH,list, startTime, endTime, currentId, TODOLIST_WIDTH } = useGante();
    const currentTime = useCurrentDate();

    const START = moment(startTime);
    const END = moment(endTime);

    const inRange = useCallback((ts) => {
        if (!currentId) {
            return false;
        }
        const currentItem = list.filter(item => item.id === currentId)[0];
        return ts >= currentItem.startTime && ts <= currentItem.endTime;
    }, [currentId, list]);

    return (
            <div className={styles.timeline} style={{ left: TODOLIST_WIDTH }}>
            {
                (() => {
                    let ans = [];
                    for (let i = 0; i < END.diff(START, 'days'); ++i) {
                        ans.push(
                            <span className={classNames(styles.spot, {
                                [styles.current]: moment(startTime).add(i, 'days').isSame(moment(currentTime), 'day'),
                                [styles.range]: inRange(moment(startTime).add(i, 'days').valueOf())
                            })} style={{
                                width: SPOT_WIDTH,
                            }} key={i}>{
                                moment(startTime).add(i, 'days').format('DD')
                            }</span>
                        )
                    }
                    return ans;
                })()
            }
        </div>
    )
}
