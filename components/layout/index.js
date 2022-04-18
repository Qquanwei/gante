import classNames from 'classnames';
import styles from './index.module.css';

function Container({ children, className }) {
    return (
        <div className={classNames(styles.container, className)}>
            {children }
        </div>
    );
}

function LeftSide({ children }) {
    return (
        <div className={styles.left}>
            { children }
        </div>
    );
}

function Content({ children }) {
    return (
        <div className={styles.content}>
            { children }
        </div>
    );
}

export {
    Container,
    LeftSide,
    Content
}
