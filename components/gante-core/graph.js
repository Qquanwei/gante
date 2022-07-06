import styles from './index.module.css';
import Sink from './sink';
import Node from './node';
import Timeline from './timeline';
import TodoList from './todolist';
import useGante from './useGante';

function Graph({ children }) {
    const { graphRef } = useGante();
    return (
        <div className={styles.graph} ref={graphRef}>
            <Timeline />
            <div className={styles.graphcontent}>
                <Sink />
                <TodoList />
                <Node />
            </div>
        </div>
    );
}

export default Graph;
