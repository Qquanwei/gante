import React, { useCallback, useState, useRef, Fragment, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import useGante from '../useGante';
import { getPosition, Position, getEleRect } from '../utils';

export default function Popup({ children, content, disable }) {
  const [showContent, setShowContent] = useState(false);
  const positionRef = useRef(null);
  const { graphRef } = useGante();
  const popupContainerRef = useRef(null);
  const elementRef = useRef(null);
  const focusRef = useRef(false);

  const onClick = useCallback((event) => {
    const position = getPosition(graphRef.current, event);
    positionRef.current = position.add(new Position(10, 10));
    setShowContent(v => !v);
  }, []);

  useEffect(() => {
    if (!popupContainerRef.current) {
      popupContainerRef.current = document.createElement('div');
      popupContainerRef.current.dataset.role = 'popupcontainer';
      graphRef.current.appendChild(popupContainerRef.current);
    }

    const onClickOutside = (nativeEvent) => {
      if (!popupContainerRef.current.contains(nativeEvent.target) &&
          !elementRef.current.contains(nativeEvent.target)
         ) {
        if (!focusRef.current) {
          setShowContent(false);
        }
      }
    };

    document.addEventListener('click', onClickOutside);

    return () => {
      document.removeEventListener('click', onClickOutside);
      if (popupContainerRef.current && graphRef.current) {
        graphRef.current.removeChild(popupContainerRef.current);
        popupContainerRef.current = null;
      }
    };
  }, []);

  const onHidden = useCallback(() => {
    setShowContent(false);
  }, []);

  return (
    <Fragment>
      {
        React.cloneElement(children, {
          ref: elementRef,
          onClick: (e) => {
            if (!disable) {
              onClick(e);
            }
            if (children.props.onClick) {
              return children.props.onClick(e);
            }
          }
        })
      }
      <Fragment>
        {
          showContent && (
            ReactDOM.createPortal(
              <div
                className="bg-yellow-100 border border-sky-500 p-2 rounded min-w-[200px] min-h-[50px] absolute z-10" style={{
                     top: positionRef.current?.y || 0,
                     left: positionRef.current?.x || 0
                   }}>
                { typeof content === 'function' ? content({ close: onHidden }) : content }
              </div>,
              popupContainerRef.current
            )
          )
        }
      </Fragment>
    </Fragment>
  );
}
