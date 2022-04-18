import styles from './index.module.css';
import Sink from './sink';
import Node from './node';
import useGante from './useGante';

function Graph({ children }) {
    const { graphRef } = useGante();
    return (
        <div className={styles.graph} ref={graphRef}>
            <Sink />
            <Node />
        </div>
    );
}

export default Graph;
