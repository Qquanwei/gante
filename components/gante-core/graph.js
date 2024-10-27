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
      </div>
    </div>
  ), [graphRef]);
}

export default React.memo(Graph);
