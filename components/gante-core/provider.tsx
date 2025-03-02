/* eslint-disable react/display-name */
import React, {
  useMemo, useState, useCallback, useRef, useEffect, useImperativeHandle,
  Suspense,
  HTMLAttributes
} from 'react';
import Events from 'events';
import { RecoilRoot, useSetRecoilState, useRecoilCallback, MutableSnapshot } from 'recoil';
import { RecoilSyncShareDB } from 'recoil-sharedb';
import * as R from 'ramda';
import { ErrorBoundary } from 'react-error-boundary';
import Modal from '../modal';
import * as atoms from './atom';
import Loading from './loading';
import * as actions from './action';

const Context = React.createContext(null);

export {
  Context
};

interface IProviderImplInterface {
  gotoTodayImpl?: () => void;
}

const Provider = React.forwardRef(({ children }: HTMLAttributes<HTMLDivElement>, forwardRef) => {
  const graphRef = useRef(null);
  const sinkRef = useRef(null);
  const setSpotWidth = useSetRecoilState(atoms.SPOT_WIDTH);
  const updateItemProperty = actions.useUpdateItemProperty();

  const impl = useRef<IProviderImplInterface>({});

  const zoomOut = useCallback(() => {
    setSpotWidth(v => Math.max(v - 5, 25));
  }, [setSpotWidth]);

  const zoomIn = useCallback(() => {
    setSpotWidth(v => Math.min(v + 5, 50));
  }, [setSpotWidth]);

  const setGotoTodayImpl = useCallback((gotoImpl) => {
    impl.current.gotoTodayImpl = gotoImpl;
  }, []);

  const event = useMemo(() => {
    return new Events();
  }, []);

  const updateItemConnect = useRecoilCallback(({ snapshot }) => async (fromNodeId, toNodeId, isAdd) => {
    // isAdd = true, append, false, remove
    const allNodes = await snapshot.getPromise(atoms.allNodes);
    const nodeMap = R.indexBy(R.prop('id'), allNodes);
    const fromNode = nodeMap[fromNodeId];
    const toNode = nodeMap[toNodeId];

    if (!isAdd && fromNode && toNode) {
      const removeFromIdx = (fromNode.connectTo || []).indexOf(toNode.id);
      const removeToIdx = (toNode.from || []).indexOf(fromNode.id);
      if (removeFromIdx !== -1) {
        const cp1 = [...fromNode.connectTo];
        cp1[removeFromIdx] = null;

        if (cp1.filter(R.identity).length === 0) {
          updateItemProperty(fromNode.id, 'connectTo', []);
        } else {
          updateItemProperty(fromNode.id, 'connectTo', cp1);
        }
      }
      if (removeToIdx !== -1) {
        const cp2 = [...toNode.from];
        cp2[removeToIdx] = null;
        if (cp2.filter(R.identity).length === 0) {
          updateItemProperty(toNode.id, 'from', []);
        } else {
          updateItemProperty(toNode.id, 'from', cp2);
        }
      }
    }
  }, []);

  useImperativeHandle(forwardRef, () => {
    return {
      event,
      updateItemConnect,
      zoomOut,
      zoomIn,
      gotoToday: () => {
        if (impl.current.gotoTodayImpl) {
          impl.current.gotoTodayImpl();
        }
      }
    };
  });

  const contextValue = useMemo(() => {
    return {
      graphRef,
      setGotoTodayImpl,
      updateItemConnect,
      sinkRef,
      zoomOut,
      zoomIn,
    };
  }, [setGotoTodayImpl, updateItemConnect, zoomIn, zoomOut]);

  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
});

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

import ReactDOM from 'react-dom/client';
import { User } from '../../types/model';
function SmartLoading() {
  useEffect(() => {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'fixed top-0 bottom-0 left-0 right-0 flex justify-center items-center transition-all duration-[1s] opacity-1';
    document.body.appendChild(loadingDiv);
    ReactDOM.createRoot(loadingDiv).render(<Loading />);

    const startTime = Date.now();
    performance.mark(startTime + '');
    return () => {
      performance.measure('loading_page' + startTime, startTime + '');
      loadingDiv.classList.add('opacity-0');
      setTimeout(() => {
        document.body.removeChild(loadingDiv);
      }, 1000);
    }
  }, []);

  return null;
}

export default React.forwardRef(function ProviderRef({ user, docId, ...props }: { docId: string, user: User } & HTMLAttributes<HTMLDivElement>, ref) {
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);

  const onError = useCallback((err) => {
    setError(err);
    setShow(true);
  }, []);

  const onRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const protocol = useMemo(() => {
    if (window.location.protocol === 'https:') {
      return 'wss://';
    }
    return 'ws://';
  }, []);

  const initializeState = useCallback((snapshot: MutableSnapshot) => {
    snapshot.set(atoms.user, user)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RecoilRoot initializeState={initializeState}>
      <Suspense fallback={<div>global loading...</div>}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <RecoilSyncShareDB wsUrl={`${protocol}${window.location.host}/share?id=${docId}`} onError={onError} docId={docId}>
            <Suspense fallback={<SmartLoading />}>
              <Provider {...props} ref={ref} />
            </Suspense>
          </RecoilSyncShareDB>

          <Modal show={show} title="同步发生错误" onClose={onRefresh}>
            <h1>
              {error?.message}
            </h1>
            <div>请刷新</div>
          </Modal>
        </ErrorBoundary>
      </Suspense>
    </RecoilRoot>
  );
});
