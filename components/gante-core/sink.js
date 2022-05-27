import useGante from './useGante';
import styles from './index.module.css';
import useCurrentDate from './useCurrentDate';
import moment from 'moment';

/*
   泳道，绘制一个通道, 绘制连线
*/
export default function Sink() {
    const {
        list,
        // 一条临时的线
        tempLine,
        startTime,
        endTime,
        SINK_HEIGHT,
        SPOT_WIDTH,
    } = useGante();

    const currentTime = useCurrentDate();

    const OFFSET_DAY = moment(currentTime).diff(moment(startTime), 'days');

    return (
        <svg width="100%" height="100%" className={styles.svg}>
            {
                list.map((_, index) => {
                    return (
                        <line key={index}
                            x1="0" y1={(index + 1) * SINK_HEIGHT}
                            x2="100%" y2={(index + 1) * SINK_HEIGHT}
                            className={styles.line}
                        />
                    )
                })
            }

            {/* 当前的线 */}
            <line
                x1={SPOT_WIDTH * OFFSET_DAY}
                x2={SPOT_WIDTH * OFFSET_DAY}
                y1="0"
                y2="100%"
                className={styles.currentTimeLine}
            ></line>

            {
                tempLine ? (
                    <line
                        className={styles.currentTimeLine}
                        x1={tempLine.from.x}
                        y1={tempLine.from.y}
                        x2={tempLine.to.x}
                        y2={tempLine.to.y} />
                ) : null
            }
        </svg>
    );
}
