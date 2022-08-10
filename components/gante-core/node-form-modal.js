import { useCallback, useState} from 'react';
import { useId, Fragment, useMemo, useRef, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import classNames from 'classnames';
import moment from 'moment';
import { addEventOnce } from './utils';
import useGante from './useGante';

const WIDTH = 430;
const HEIGHT = 300;

function NodeFormModal({ node, top, hover, left, contextInfo }) {
  const containerRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const leftRef = useRef(0);
  const { updateItemDate, updateItemTitle } = useGante();

  const onSubmit = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    updateItemDate(
      node.id,
      moment(data.get('startTime') || node.startTime).valueOf(),
      moment(data.get('endTime') || node.endTime).valueOf()
    );
    updateItemTitle(node.id, data.get('title') || node.title, data.get('remark'));
    setEditMode(false);
  }, [node, updateItemDate, updateItemTitle]);

  if (contextInfo.show) {
    leftRef.current = (contextInfo?.point?.x || 0) - left - (WIDTH / 2);
  }

  const onClick = useCallback(() => {
    setEditMode(true);
  }, []);

  useEffect(() => {
    if (editMode) {
      let cb = (e) => {
        if (!containerRef.current.contains(e.target)) {
          setEditMode(false);
        }
      };
      document.addEventListener('click', cb);
      return () => {
        document.removeEventListener('click', cb);
      };
    }
    return () => {
    };
  }, [editMode]);

  const show = editMode || !(!hover || !contextInfo.show || node.lock);

  return (
    <Transition show={show}
                enter="transition-opacity duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-50"
                leaveFrom="opacity-100"
                leaveTo="opacity-0">
      <div ref={containerRef} className={"absolute z-10 top-full"} onClick={onClick} style={{ height: HEIGHT, width: WIDTH, left: leftRef.current }}>
        <div
          className="rounded-md bg-white p-6 text-left align-middle shadow-xl absolute cursor-auto top-3 h-full w-full p-3"
        >
          <form className="text-[14px] text-gray-500" onSubmit={onSubmit}>
            <div className="flex">
              <div className="inline-flex">
                <label htmlFor="">开始时间</label>
                <input className="ml-2" name="startTime" type="date" defaultValue={moment(node.startTime).format('YYYY-MM-DD')} />
              </div>
              <div className="inline-flex ml-auto">
                <label htmlFor="">结束时间</label>
                <input className="ml-2" name="endTime" type="date" defaultValue={moment(node.endTime).format('YYYY-MM-DD')}/>
              </div>
              <div>
              </div>
            </div>
            <div className="mt-3 flex items-center">
              <label htmlFor="ipt-title">标题</label>
              <input id="ipt-title" name="title" className="flex-grow px-2 border h-[32px] ml-2" type="text" defaultValue={node.title} />
            </div>
            <div className="mt-3 flex">
              <label htmlFor="ipt-remark">备注</label>
              <textarea name="ipt-remark" rows={5}name="remark" type="text" className="ml-2 py-1 border flex-grow px-2" defaultValue={node.remark}/>
            </div>
            <button className="ring ring-offset-transparent rounded h-[30px] bg-blue-500 text-white px-[16px] cursor-pointer mt-10">确定</button>
          </form>
        </div>
      </div>
    </Transition>
  );
}

export default NodeFormModal;
