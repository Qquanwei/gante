import classNames from 'classnames';
import React, { useState, useCallback, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import * as atoms from './atom';
import Popup from './popup';
import Button from '../button';
import * as actions from './action';

// pin 有两种模式，一种依附在 timeline 上，一种依附在 node 上。
// timeline 为绝对位置， day 属性有效
// node 为相对位置，offset 属性有效
export default React.memo(function Pin({ className, pinIdx, dragMode, showPin, style }) {
  const updatePin = actions.useUpdatePinContent();
  const removePin = actions.useRemovePin();
  const data = useRecoilValue(atoms.pins)[pinIdx];
  const formRef = useRef(null);
  const [hiddenIcon, setHiddenIcon] = useState(false);

  const fixed = data?.fixed === 'enable';

  const onClickSave = useCallback((close) => {
    return () => {
      const data = new FormData(formRef.current);
      updatePin(pinIdx, {
        content: data.get('content'),
        fixed: data.get('fixed')
      });
      close();
    }
  }, [pinIdx]);

  const onClickDelete = useCallback(() => {
    removePin(pinIdx);
  }, [pinIdx]);

  const onDragPinStart = useCallback((event) => {
    event.dataTransfer.setData('text/plain', JSON.stringify({ type: 'pin', pinIdx }));
    event.dataTransfer.setDragImage(event.currentTarget, 10, 10);

    if (dragMode === 'move') {
      setHiddenIcon(true);
    }
  }, [dragMode, pinIdx]);

  const onDragPinEnd = useCallback(() => {
    if (hiddenIcon) {
      setHiddenIcon(false);
    }
  }, [hiddenIcon]);

  const onClick = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  return (
    <Popup
      disable={pinIdx === -1}
      showPreview={fixed && showPin}
      previewContent={data?.content }
      content={({ close }) => (
        <div>
          <form ref={formRef}>
            <div className="flex items-center">
              <label className="mr-2">pin</label>
              <input name="fixed" type="checkbox" value="enable" defaultChecked={data?.fixed === 'enable'} />
            </div>
            <textarea name="content" className="p-1" type="text" defaultValue={data?.content} />
          </form>
          <div className="flex justify-between">
            <Button className="w-[90px] border rounded flex justify-center items-center bg-rose-300 text-white" onClick={onClickDelete}>删除</Button>
            <Button className="w-[100px] border rounded flex justify-center items-center bg-white" onClick={onClickSave(close)}>
              保存
            </Button>
          </div>
        </div>
      )}>
      <div
        draggable="true"
        style={style}
        title={data?.content}
        onClick={onClick}
        onDragStart={onDragPinStart}
        onDragEnd={onDragPinEnd}
        className={classNames("cursor-pointer w-[20px] bg-transparent translate-x-0 h-[20px] bg-[url(/tuding.png)] bg-contain", className, {
          ['opacity-50']: hiddenIcon
        })}>
      </div>
    </Popup>
  );
});
