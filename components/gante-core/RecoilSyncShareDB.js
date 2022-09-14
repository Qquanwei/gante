import React, { useMemo, useCallback, useEffect, useState, useRef } from 'react';
import { RecoilSync } from 'recoil-sync';
import dynamic from 'next/dynamic';
import Client, { Connection } from 'sharedb/lib/client';
import * as json1 from 'ot-json1';
import WebSocket from 'reconnecting-websocket';
import Deferred from 'deferred';
Client.types.register(json1.type);

const ConnectionContext = React.createContext();

export {
  ConnectionContext
};

function RecoilSyncShareDB({ children }) {
  const [initDone, setInitDone] = useState(false);
  const conRef = useRef(null);

  const defCon = useMemo(() => {
    return Deferred();
  }, []);

  useEffect(() => {
    // const socket =  new WebSocket('ws://116.62.19.157:9081/');
    const socket = new WebSocket('ws://127.0.0.1:9081');
    // const socket = new WebSocket(`ws://${window.location.host}/ws`);

    socket.addEventListener('open', () => {
      const con = new Connection(socket);
      conRef.current = con;
      defCon.resolve(con);
    });

    socket.addEventListener('error', (error) => {
      console.error(error);
      defCon.reject(error);
    });

    setInitDone(true);

    return () => {
      socket.close();
    };
  }, []);

  const getCollectionByKey = useCallback((itemKey) => {
    let collection = 'item';
    if (/gante_list_core_list/.test(itemKey)) {
      collection = 'list';
    }
    return collection;
  }, []);

  const read = useCallback((itemKey) => {
    return Promise.resolve(defCon.promise).then((con) => {
      const collection = getCollectionByKey(itemKey);
      const doc = con.get(collection, itemKey);
      return new Promise((resolve, reject) => {
        doc.fetch((error) => {
          if (error) {
            reject(error);
          } else {
            if (doc) {
              resolve(doc.data || []);
            } else {
              resolve({});
            }
          }
        });
      });
    }).catch(error => {
      console.error('->', error);
    });
  }, []);

  const write = useCallback(({ diff }) => {
    return defCon.promise.then(con => {
      for (const [key, value] of diff) {
        const collection = getCollectionByKey(key);
        const doc = con.get(collection, key);
        doc.fetch(() => {
          if (!doc.type) {
            doc.create(value, 'json1', (error => {
              if (error) {
                console.error('->', error);
              }
            }));
          } else {
            doc.submitOp(json1.replaceOp([], true, value));
          }
        });
      }
    });
  }, []);

  const listen = useCallback(({ updateItem, updateAllKnownItems}) => {
  }, []);

  return (
    <ConnectionContext.Provider value={conRef}>
      <RecoilSync read={read} write={write}>
        { initDone ? children : null }
      </RecoilSync>
    </ConnectionContext.Provider>
  );
}


export default dynamic(() => Promise.resolve(RecoilSyncShareDB), { ssr: false }) ;
