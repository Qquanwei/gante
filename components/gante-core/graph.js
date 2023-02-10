import { Fragment } from 'react';
import Sink from './sink';
import Node from './node';
import Timeline from './timeline';
import TodoList from './todolist';
import useGante from './useGante';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import * as atoms from './atom';

function Graph({ children }) {
  const { graphRef } = useGante();
  const { version } = useRecoilValue(atoms._listCore__editor);

  return (
    <div className="relative w-full flex pl-10 select-none" >
      <div className="relative inline-flex grow" ref={graphRef}>
        <Timeline >
          <Fragment>
            <Sink />
            <Node />
          </Fragment>
        </Timeline>
        <div className="absolute top-[100px] left-[100px] text-[#ccc]">
          { version }
        </div>
      </div>
    </div>
  );
}

export default Graph;
