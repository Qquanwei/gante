import useGante from './useGante';
import styles from './index.module.css';

/*
   泳道，绘制一个通道, 绘制连线
*/
export default function Sink() {
    const { list, SINK_HEIGHT } = useGante();

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
        </svg>
    );
}
