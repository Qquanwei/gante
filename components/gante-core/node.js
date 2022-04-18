import { useState } from 'react';
import classNames from 'classnames';
import useGante from './useGante';
import styles from './index.module.css';
import useInteractionEvent from './use-interaction-event';

function Node({ item, index }) {
    const { SINK_HEIGHT } = useGante();
    const [hover, setHover] = useState(false);
    const [width, setWidth] = useState(100);

    const ref = useInteractionEvent({
        onChange: (event, args) => {
            switch(event) {
                case 'hover':
                    setHover(args);
                    break;

                case 'resize':
                    setWidth(args.width);
                default:
                    break;
            }
            console.log('event:', event, args);
        }
    }, []);

    return (
        <div ref={ref}
            className={classNames(styles.node, {
                [styles.hover]: hover
            })}
            style={{
                top: index * SINK_HEIGHT,
                height: SINK_HEIGHT,
                width
            }}>
            <div className={styles.resizebar} data-role="left-dragger">::</div>
            { item.title }
            <div className={styles.resizebar} data-role="right-dragger">::</div>
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
                        <Node item={item} key={index} index={index} />
                    )
                })
            }
        </div>
    );
}
