import styles from './index.module.css';
import useGante from './useGante';
/*
   展示时间轴，横轴
*/
export default function Timeline() {
    const { SPOT_WIDTH } = useGante();
    return (
        <div className={styles.timeline}>
            {
                (() => {
                    let ans = [];
                    for (let i = 0; i < 100; ++i) {
                        ans.push(
                            <span className={styles.spot} style={{
                                width: SPOT_WIDTH
                            }} key={i}>{ i }</span>
                        )
                    }
                    return ans;
                })()
            }
        </div>
    )
}
