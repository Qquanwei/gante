import classNames from 'classnames';
import React, { useState, useCallback, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import * as atoms from './atom';
import Popup from './popup';
import Button from '../button';
import * as actions from './action';

export default React.memo(function Pin({ className, pinIdx }) {
  const updatePin = actions.useUpdatePinContent();
  const removePin = actions.useRemovePin();
  const data = useRecoilValue(atoms.pins)[pinIdx];
  const iptRef = useRef(null);

  const onClickSave = useCallback((close) => {
    return () => {
      updatePin(pinIdx, {
        content: iptRef.current.value
      });
      close();
    }
  }, [pinIdx]);

  const onClickDelete = useCallback(() => {
    removePin(pinIdx);
  }, [pinIdx]);

  return (
    <Popup
      content={({ close }) => (
      <div>
        <textarea ref={iptRef} className="p-1" name="" type="text" defaultValue={data.content} />
        <div className="flex justify-between">
          <Button className="w-[90px] border rounded flex justify-center items-center bg-rose-300 text-white" onClick={onClickDelete}>删除</Button>
          <Button className="w-[100px] border rounded flex justify-center items-center bg-white" onClick={onClickSave(close)}>
            保存
          </Button>
        </div>
      </div>
    )}>
      <div
        title={data.content}
        className={classNames("cursor-pointer w-[20px] h-[20px] bg-[url(/tuding.png)] bg-contain", className)}>
      </div>
    </Popup>
  );
});
