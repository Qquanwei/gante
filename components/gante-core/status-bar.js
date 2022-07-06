import { useMemo } from 'react';
import classNames from 'classnames';
import useGante from './useGante';


export default function StatusBar({ className }) {
    const { list, currentId } = useGante();

    const node = useMemo(() => {
        return list.filter(v => v.id === currentId)[0];
    }, [list, currentId]);

    return (
        <div className={classNames(className, 'gante-status-bar')}>
            {
                node ? (
                    <div>
                        <span>{new Date(node.startTime).toString()}</span>,
                        <span>{new Date(node.endTime).toString()}</span>
                    </div>
                ) : null
            }
        </div>
    );
}
