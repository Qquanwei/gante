import React, {
  useReducer, useMemo, useState, useCallback, useRef, useEffect, useImperativeHandle,
  Suspense
} from 'react';
import Events from 'events';
import dynamic from 'next/dynamic';
import { RecoilRoot, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { RecoilSyncShareDB } from 'recoil-sharedb';
import { ErrorBoundary } from 'react-error-boundary';
import * as atoms from './atom';
import dayjs from 'dayjs';
import * as json1 from 'ot-json1';
import { hasProp } from './utils';
import * as actions from './action';

const Context = React.createContext();

export {
  Context
};


function Provider({ children, forwardRef }) {
  const graphRef = useRef(null);
  const sinkRef = useRef(null);
  const portalRef = useRef(null);
  const list = useRecoilValue(atoms.list);
  const setSpotWidth = useSetRecoilState(atoms.SPOT_WIDTH);

  const importList = actions.useImportList();

  const zoomOut = useCallback(() => {
    setSpotWidth(v => Math.max(v - 5, 25));
  }, []);

  const zoomIn = useCallback(() => {
    setSpotWidth(v => Math.min(v + 5, 50));
  }, []);

  const event = useMemo(() => {
    return new Events();
  }, []);

  useImperativeHandle(forwardRef, () => {
    return {
      importList,
      event,
      zoomOut
    };
  });

  const contextValue = useMemo(() => {
    return {
      graphRef,
      sinkRef,
      zoomOut,
      importList,
      zoomIn
    };
  }, [importList]);

  return (
    <Context.Provider value={contextValue}>
      <Suspense fallback={<div>loading...</div>}>
        { children }
      </Suspense>
    </Context.Provider>
  );
};

function ErrorFallback({ error }) {
  console.log(error);
  return (
    <div>
      {
        JSON.stringify(error)
      }
    </div>
  );
}

export default dynamic(() => Promise.resolve(React.forwardRef(function ProviderRef(props, ref) {
  let host = (() => {
    if (typeof window !== 'undefined') {
      return window.location.host;
    } else {
      // in node environment
      // never in this
      const port = process.env.PORT || 8088;
      return `127.0.0.1:${port}`;
    }
  })();
  return (
    <RecoilRoot>
      <Suspense fallback={<div>global loading...</div>}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <RecoilSyncShareDB wsUrl={`ws://${host}/share`}>
            <Provider {...props} forwardRef={ref} />
          </RecoilSyncShareDB>
        </ErrorBoundary>
      </Suspense>
    </RecoilRoot>
  );
})), {
  ssr: false
});
