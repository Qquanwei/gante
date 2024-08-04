import React, { Fragment, useMemo } from 'react';
import Sink from './sink';
import Node from './node';
import Timeline from './timeline';
import useGante from './useGante';
import CursorCanvas from './cursor-canvas';
import { useRecoilValue } from 'recoil';
import * as atoms from './atom';

function Graph() {
  const { graphRef } = useGante();
  const { version } = useRecoilValue(atoms._listCore__editor);

  return useMemo(() => (
    <div className="relative w-full flex pl-10 select-none" >
      <div className="relative inline-flex grow" ref={graphRef}>
        <Timeline >
          <Fragment>
            <Fragment>
              <CursorCanvas />
            </Fragment>
            <Sink />
            <Node />
          </Fragment>
        </Timeline>
        <div className="absolute top-[100px] left-[100px] text-[#ccc]">
          { version }
        </div>
      </div>
    </div>
  ), [graphRef, version]);
}

export default React.memo(Graph);
