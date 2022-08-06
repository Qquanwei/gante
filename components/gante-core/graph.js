import { Fragment } from 'react';
import Sink from './sink';
import Node from './node';
import Timeline from './timeline';
import TodoList from './todolist';
import useGante from './useGante';

function Graph({ children }) {
  const { graphRef } = useGante();
  return (
    <div className="relative w-full flex" ref={graphRef}>
      <div className="w-36 pt-10 shrink-0">
        <TodoList />
      </div>

      <div className="relative inline-flex grow">
        <Timeline >
          <Fragment>
            <Sink />
            <Node />
          </Fragment>
        </Timeline>
      </div>
    </div>
  );
}

export default Graph;
