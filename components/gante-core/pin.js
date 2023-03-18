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
export default React.memo(function Pin({ className, pin, dragMode, showPin, style }) {
  const updatePin = actions.useUpdatePinContent();
  const removePin = actions.useRemovePin();
  const data = pin;
  const formRef = useRef(null);

  const fixed = data?.fixed === 'enable';

  const onClickSave = useCallback((close) => {
    return () => {
      const data = new FormData(formRef.current);
      updatePin(pin ? pin.pinIdx : -1 , {
        content: data.get('content'),
        fixed: data.get('fixed')
      });
      close();
    };
  }, [pin]);

  const onClickDelete = useCallback(() => {
    removePin(data.pinIdx);
  }, [data]);

  const onClick = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  return (
    <Popup
      disable={!data}
      showPreview={fixed && showPin}
      previewContent={<div
                        style={{ left: 10, top: (data?.pinIdx || 0) % 2 === 0 ? 20 : 25}}
                        className="hover:z-10 break-all font-normal transition-all duration-75 text-left select-text relative hover:bg-yellow-100/90 bg-yellow-100/60 p-2 rounded min-w-[100px] min-h-[50px]">{data?.content}</div>}
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
        data-x="pin/drag:opacity-50"
        data-x-drag-data={JSON.stringify({type: 'pin', pinIdx: pin?.pinIdx || -1})}
        style={style}
        title={data?.content}
        onClick={onClick}
        className={classNames("cursor-pointer w-[20px] bg-transparent h-[20px] bg-[url(/tuding.png)] bg-contain", className)}>
      </div>
    </Popup>
  );
});
