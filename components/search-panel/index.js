import { useCallback, useState } from 'react';
import classNames from 'classnames';
import { useRecoilValueMemo } from 'recoil-enhance';
import { useSetRecoilState } from 'recoil';
import Button from '../button';
import * as R from 'ramda';
import useGante from '../gante-core/useGante';
import { getEleRect, getScrollingElement } from '../gante-core/utils';
import * as atoms from '../gante-core/atom';

export default function SearchPanel({ className }) {
  const { graphRef } = useGante();
  const nodes = useRecoilValueMemo(atoms.allNodes);
  const setCurrentNodeId = useSetRecoilState(atoms.currentNodeId);
  const [filterText, setFilterText] = useState('');

  const onSubmit = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setFilterText(data.get('ipt'));
  }, []);

  const onClickItem = useCallback((e) => {
    const searchId = e.currentTarget.dataset.id;
    const ele = document.querySelector(`[data-id='node-${searchId}']`);

    if (ele) {
      const rect = getEleRect(graphRef.current, ele);
      const scrollEle = getScrollingElement(ele);
      scrollEle.scroll(rect.x - 500, rect.y - 500);
      setCurrentNodeId(searchId);
    }
  }, []);

  const onClickClear = useCallback(() => {
    setFilterText('');
  }, []);

  return (
    <div className={classNames(className, 'p-2')}>
      <h1 className="text-gray-500 flex">
        搜索
      </h1>
      <form onSubmit={onSubmit} className="w-full flex border-box items-center my-2">
        <input autoFocus placeholder="按下回车搜索" className="w-[100px] border-box rounded p-4 h-[30px] flex-grow border" name="ipt" type="text" />
        <button className="shrink-0 ml-2 w-[60px] h-[30px] cursor-pointer flex items-center justify-center bg-gray-100 rounded" onClick={onClickClear} type="reset">清空</button>
      </form>
      <ul className="h-[800px] overflow-y-auto">
        {
          R.reverse(nodes).filter((node) => {
            const r = new RegExp(filterText, 'i')
            return (r.test(node.title) || r.test(node.remark));
          }).map((node) => {
            return (
              <li
                className="border-box text-[14px] bg-gray-200/10 px-2 cursor-pointer rounded flex items-center min-h-[30px] hover:bg-gray-100"
                key={node.id} title={node.remark}
                data-id={node.id}
                onClick={onClickItem}
                style={{ background: node.color, color: node.fgcolor}}>{ node.title } { node.remark ? <span className="text-[12px] ml-2">{node.remark}</span> : null}</li>
            );
          })
        }
      </ul>
    </div>
  );
}
