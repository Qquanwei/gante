import { Fragment } from 'react';
import Sink from './sink';
import Node from './node';
import Timeline from './timeline';
import TodoList from './todolist';
import useGante from './useGante';

function Graph({ children }) {
  const { graphRef } = useGante();
  return (
    <div className="relative w-full flex pl-10 pb-20" >
      <div className="w-36 pt-16 shrink-0 sticky left-0 z-10 bg-white">
        <TodoList />
      </div>

      <div className="relative inline-flex grow" ref={graphRef}>
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
