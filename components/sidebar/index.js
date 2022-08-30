import { useState, useCallback } from 'react';
import { Transition } from '@headlessui/react';
import { Bars4Icon } from '@heroicons/react/24/solid';
import Button from 'components/button';
import classNames from 'classnames';

function Sidebar({ onExport }) {
  const [toggleOpen, setToggleOpen] = useState(true);

  const onClickToggle = useCallback(() => {
    setToggleOpen(v => !v);
  }, []);

  const onClickExport = useCallback(() => {
    onExport();
  }, [onExport]);

  return (
    <div className="py-20 px-2 bg-white z-20 h-full select-none whitespace-nowrap fixed left-0 min-w-[40px]">
      <div onClick={onClickToggle} className="absolute cursor-pointer top-2 left-2 w-[24px] h-[24px]">
        <Bars4Icon />
      </div>
      <Transition show={toggleOpen} as="div" className="w-[300px]"
        enter="transition-width duration-150"
        enterFrom="w-0"
        enterTo="w-[300px]"
        leave="transition-width duration-150"
        leaveFrom="w-[300px]"
        leaveTo="w-0"
      >
        <Transition.Child enter="transition-opacity duration-150" enterFrom="opacity-0" enterTo="opacity-100"
          leaveFrom="opacity-0"
          leaveTo="opacity-100" >
          <Button className="cursor-pointer inline-flex items-center justify-center text-white text-sm py-1 px-3 rounded-sm bg-blue-500"
            onClick={onClickExport}>
            导出
          </Button>
        </Transition.Child>
      </Transition>
    </div>
  );
}

export default Sidebar;
