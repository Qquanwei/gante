import React, { useCallback, useState, Suspense } from 'react';
import classNames from 'classnames';
import { atom, useRecoilState } from 'recoil';
import dynamic from 'next/dynamic';
import User from 'components/user';
import Link from 'next/link';
import Pin from '../gante-core/pin';

const SearchPanel = dynamic(() => import('../search-panel'));
const AgendaPanel = dynamic(() => import('../agenda-panel'));

const modeMap = {
  search: SearchPanel,
  agent: AgendaPanel
};

export const headerMode = atom({
  key: 'header mode',
  default: ''
});

function LeftHeader({ children, className, user, ganteRef }) {
  const [mode, setMode] = useRecoilState(headerMode);

  const onClickMode = useCallback((e) => {
    if (mode === e.target.dataset.mode) {
      setMode('');
    } else {
      setMode(e.target.dataset.mode);
    }
  }, [mode]);

  return (
    <div className={classNames("transition-all z-20 text-[#333] fixed top-0 bottom-0 left-0 w-[60px] bg-white hidden sm:block border-r-[#e0e0e0] border-r", {
           'w-[320px]': mode !== ''
         })}>
      <div className={"transition-all z-20 text-[#333] absolute top-0 bottom-0 left-0 w-[60px] bg-white hidden sm:block"}>
        <div className="bg-[url(/logo.png)] cursor-pointer bg-white w-[60px] bg-cover h-[60px]" onClick={() => ganteRef?.current?.gotoToday()}></div>
        <div className="flex flex-col items-center h-full select-none">
          <ul className="flex mt-2 flex-col text-[12px] text-center">
            <Link href="/">
              <li className="cursor-pointer h-[24px] bg-[url(/house.png)] bg-no-repeat bg-contain bg-center"/>
            </Link>
            <li className="cursor-pointer h-[24px] mt-[20px]" data-mode="search" onClick={onClickMode}>搜索</li>
            <li className="cursor-pointer h-[24px] mt-[20px] bg-center bg-[url(/zoom-in.png)] bg-contain bg-no-repeat" onClick={() => ganteRef?.current?.zoomIn()}></li>
            <li className="cursor-pointer h-[24px] mt-[20px] bg-center bg-[url(/zoom-out.png)] bg-contain bg-no-repeat" onClick={() => ganteRef?.current?.zoomOut()}></li>
            <li className="cursor-pointer hidden h-[24px] flex justify-center mt-[10px]">
              <div className="h-[24px] w-[24px] border borer-1 border-black border-box flex items-center justify-center">组</div>
            </li>
            <li className="cursor-pointer hidden h-[24px] flex justify-center items-center mt-[20px]">
              <div className="h-[18px] w-[24px] border borer-1 border-black border-box flex items-center justify-center"></div>
            </li>
            <li className="cursor-pointer h-[24px] flex justify-center items-center mt-[20px]">
              <Pin pin={null} dragMode="copy" />
            </li>
            <li className="cursor-pointer h-[24px] flex justify-center items-center mt-[20px]" data-mode="agent" onClick={onClickMode}>agenda</li>
            <li className="cursor-pointer h-[24px] flex justify-center items-center mt-[20px]">收纳x10</li>
          </ul>
          <div className="mt-auto mb-20">
            <div className="flex justify-center">
              <Link href="https://github.com/Qquanwei/gante" target="_blank">
                <div className="mb-[30px] w-[30px] h-[30px] bg-contain bg-[url(/github-mark.png)]"></div>
              </Link>
            </div>
            <User user={user} />
            { children }
          </div>
        </div>
      </div>
      <div className="absolute top-0 bottom-0 left-[60px] right-0">
        <Suspense fallback={<div className="w-[260px]">loading...</div>}>
          {
            modeMap[mode] ? React.createElement(modeMap[mode], {
              className: 'w-[260px]'
            }) : null
          }
        </Suspense>
      </div>
    </div>
  );
}

function Header({ children, className, user, side, ganteRef }) {


  if (side === 'left') {
    return <LeftHeader children={children} className={className} user={user} side={side} ganteRef={ganteRef} />;
   }

  return (
    <div className="z-10  text-black left-0 absolute right-0 pr-2 pt-2">
      <div className="flex items-center">
        <ul className="flex ml-10">
          <li className="ml-[15px] cursor-pointer flex items-center">
            <Link href="https://github.com/Qquanwei/gante">
              Github
            </Link>
            <div className="border border-l-black w-[1px] h-[20px] inline-block mx-4 hidden"></div>
            <Link href="/charge" className="ml-2 hidden">赞助</Link>
          </li>
        </ul>
        <div className="ml-auto">
          <User user={user} />
          { children }
        </div>
      </div>
    </div>
  );
}

export default Header;
