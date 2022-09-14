import React, {
  useReducer, useMemo, useState, useCallback, useRef, useEffect, useImperativeHandle,
  Suspense
} from 'react';
import Events from 'events';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';
import RecoilSyncShareDB from './RecoilSyncShareDB';
import { ErrorBoundary } from 'react-error-boundary';
import * as atoms from './atom';
import dayjs from 'dayjs';
import * as json1 from 'ot-json1';
import { hasProp } from './utils';

const Context = React.createContext();

export {
  Context
};


function Provider({ children, forwardRef }) {
  const graphRef = useRef(null);
  const sinkRef = useRef(null);
  const portalRef = useRef(null);

  const event = useMemo(() => {
    return new Events();
  }, []);

  const [list, setList]= useRecoilState(atoms.list);

  useEffect(() => {
    const v = JSON.parse(window.localStorage.getItem('save'))
    if (v) {
      setList(v);
    }
  }, []);

  useImperativeHandle(forwardRef, () => {
    return {
      list,
      setList,
      event
    };
  });

  const contextValue = useMemo(() => {
    return {
      graphRef,
      setList,
      sinkRef
    };
  }, [
    setList
  ]);

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

export default React.forwardRef(function ProviderRef(props, ref) {
  return (
    <RecoilRoot>
      <Suspense fallback={<div>global loading...</div>}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <RecoilSyncShareDB>
            <Provider {...props} forwardRef={ref} />
          </RecoilSyncShareDB>
        </ErrorBoundary>
      </Suspense>
    </RecoilRoot>
  );
});
