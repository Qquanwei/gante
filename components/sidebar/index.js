import { useState, useCallback } from 'react';
import { Transition } from '@headlessui/react';
import { Bars4Icon } from '@heroicons/react/24/solid';
import { HomeIcon, ArrowDownOnSquareIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '@material-tailwind/react';
import Button from 'components/button';
import classNames from 'classnames';
import useGante from 'components/gante-core/useGante';

function Sidebar({ onExport }) {
  const [toggleOpen, setToggleOpen] = useState(false);
  const { setList } = useGante();

  const onClickToggle = useCallback(() => {
    setToggleOpen(v => !v);
  }, []);

  const onClickExport = useCallback(() => {
    onExport();
  }, [onExport]);

  const onClickImport = useCallback(() => {
    const input = document.createElement('input');
    input.style.display = 'none';
    input.accept= ".json";
    input.type = 'file';
    input.oninput = (event) => {
      if (event.target && event.target.files.length) {
        const reader = new FileReader();
        reader.readAsText(event.target.files[0], 'UTF-8');
        reader.addEventListener('load', () => {
          try {
            const list = JSON.parse(reader.result);
            window.localStorage.setItem('save', JSON.stringify(list));
            setList(list);
          } catch(err) {
            console.error(err);
          }
        });
      }
      document.body.removeChild(input);
    };
    document.body.appendChild(input);
    input.click();
  }, [setList]);

  const onClickToday = useCallback(() => {
  }, []);

  const onClickZoomIn = useCallback(() => {
  }, []);

  const onClickZoomOut = useCallback(() => {
  }, []);

  return (
    <div className="py-20 px-2 bg-white z-20 h-full select-none whitespace-nowrap fixed left-0 min-w-[40px]">
      <div onClick={onClickToggle} className="absolute cursor-pointer top-2 left-2 w-[24px] h-[24px]">
        <Bars4Icon />
      </div>
      <div className={classNames({ hidden: toggleOpen })}>
        <div>
          <Tooltip content="->->回到今天">
            <HomeIcon className="cursor-pointer w-[24px]" onClick={onClickToday} />
          </Tooltip>
        </div>
        <div>
          <ArrowDownOnSquareIcon className="mt-4 cursor-pointer w-[24px] h-[24px]" onClick={onClickExport} />
        </div>
        <div>
          <MagnifyingGlassPlusIcon className="mt-4 cursor-pointer w-[24px] h-[24px]" onClick={onClickZoomIn} />
        </div>
        <div>
          <MagnifyingGlassMinusIcon className="mt-4 cursor-pointer w-[24px] h-[24px]" onClick={onClickZoomOut} />
        </div>
      </div>
      <div className={classNames(toggleOpen ? 'w-[300px]' : 'hidden')}>
        <Button className="cursor-pointer inline-flex items-center justify-center text-white text-sm py-1 px-3 rounded-sm bg-blue-500"
          onClick={onClickExport}>
          导出
        </Button>

        <Button className="ml-2 cursor-pointer inline-flex items-center justify-center text-white text-sm py-1 px-3 rounded-sm bg-blue-500"
          onClick={onClickImport}>
          导入
        </Button>
      </div>
    </div>
  );
}

export default Sidebar;
