import { useState, useCallback } from 'react';
import { Transition } from '@headlessui/react';
import Link from 'next/link';
import { Bars4Icon } from '@heroicons/react/24/solid';
import { HomeIcon, ArrowDownOnSquareIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '@material-tailwind/react';
import Button from 'components/button';
import classNames from 'classnames';
import useGante from 'components/gante-core/useGante';

function Sidebar({ onExport }) {
  const [toggleOpen, setToggleOpen] = useState(false);
  const { zoomOut, zoomIn } = useGante();

  const onClickToggle = useCallback(() => {
    setToggleOpen(v => !v);
  }, []);

  const onClickExport = useCallback(() => {
    onExport();
  }, [onExport]);

  const onClickHome = useCallback(() => {
  }, []);

  const onClickZoomIn = useCallback(() => {
    zoomIn();
  }, []);

  const onClickZoomOut = useCallback(() => {
    zoomOut();
  }, []);

  return (
    <div className="py-20 px-2 bg-white z-20 h-full select-none whitespace-nowrap fixed left-0 min-w-[40px]">
      <div onClick={onClickToggle} className="absolute cursor-pointer top-2 left-2 w-[24px] h-[24px]">
        <Bars4Icon />
      </div>
      <div className={classNames({ hidden: toggleOpen })}>
        <div>
          <Link href="/">
            <Tooltip className="z-20" content="回到主页" placement="right">
              <HomeIcon className="cursor-pointer w-[24px]" onClick={onClickHome} />
            </Tooltip>
          </Link>
        </div>
        <div>
          <MagnifyingGlassPlusIcon className="mt-4 cursor-pointer w-[24px] h-[24px]" onClick={onClickZoomIn} />
        </div>
        <div>
          <MagnifyingGlassMinusIcon className="mt-4 cursor-pointer w-[24px] h-[24px]" onClick={onClickZoomOut} />
        </div>
      </div>
      <div className={classNames(toggleOpen ? 'w-[300px]' : 'hidden')}>
      </div>
    </div>
  );
}

export default Sidebar;
