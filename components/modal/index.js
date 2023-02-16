import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import classNames from 'classnames';

function Modal({ show, title, onClose, onOk, children, className }) {
    return (
      <Transition appear show={show} as={Fragment}>
        <Dialog as="div" onClose={onClose} className='z-10 relative'>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100">
            <div className="fixed inset-0 bg-black/50"></div>
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom='opacity-0' enterTo='opacity-100' leave='ease-out duration-300' leaveFrom='opacity-100' leaveTo='opacity-0'>
                <Dialog.Panel className={classNames("w-[500px] relative min-h-[300px] px-5 py-5 rounded-sm bg-white", className)}>
                  <Dialog.Title>
                    <div className="flex border-b pb-2">
                      {title}
                      <div className="ml-auto cursor-pointer" onClick={onClose}>关闭</div>
                    </div>
                  </Dialog.Title>
                  {children}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>

        </Dialog>
      </Transition>
    )
}

export default Modal;
