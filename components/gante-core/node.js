import useGante from './useGante';
import styles from './index.module.css';
import useInteractionEvent from './use-interaction-event';

function Node({ item }) {
    const { SINK_HEIGHT } = useGante();

    const ref = useInteractionEvent({
        onChange: (event, args) => {
            console.log('event:', event, args);
        }
    }, []);
    return (
        <div ref={ref} className={styles.node} style={{ height: SINK_HEIGHT }}>
            { item.title }
        </div>
    );
}

export default function Nodes() {
    const { list } = useGante();

    return (
        <div>
            {
                list.map((item, index) => {
                    return (
                        <Node item={item} key={index} />
                    )
                })
            }
        </div>
    );
}
