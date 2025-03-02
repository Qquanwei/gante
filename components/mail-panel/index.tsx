import { useCallback } from 'react';
import axios from 'axios';
import classNames from 'classnames';
import React from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import * as atoms from '../gante-core/atom';

const EmailReg = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$');

const MailPanel: React.FC<{ className?: string }> = ({ className }) => {
  const setUser = useSetRecoilState(atoms.user);
  const user = useRecoilValue(atoms.user);

  const onSubmitEmail = useCallback((event) => {
    event.stopPropagation();
    event.preventDefault();
    const formData = new FormData(event.target);
    const form = event.target;
    const value = formData.get('email').toString();

    if (!EmailReg.test(value)) {
      return;
    }

    return axios.put('/api/user/email', {
      value
    }).then((resp) => {
      console.log(resp)
      if (form) {
        form.reset();
      }
      if (resp.data) {
        setUser(resp.data);
      }
    });

  }, [setUser]);

  const onSendNotify = useCallback(() => {
    return axios.post('/api/user/notify').then((resp) => {
      console.log(resp)
    });
  }, []);

  return (
    <div className={classNames(className, 'h-full text-[14px]')}>
      <div className="px-2 mt-2 text-gray-500" >通知管理</div>


      <div className='px-2 bg-sky-300/50 px-2 text-[15px] my-5'>
        <div>开启邮件通知功能！</div>
        <div>邮件能力试验性测试中</div>
      </div>

      <div className="px-2 text-gray-500 mt-2">
        <div className='text-[14px]'>通知邮箱: {user?.email || 'no setting'}</div>
        <div className='mt-5 flex items-center cursor-pointer'>
          <input type="checkbox" name="enable" />
          <label htmlFor="enable" className="ml-2">开启每日推送</label>
        </div>

        <button className="mt-5 rounded bg-gray-300 px-2" onClick={onSendNotify}>发送当前待办</button>

        <form className="flex flex-row w-full items-center mt-5" onSubmit={onSubmitEmail}>
          <input placeholder='更新通知邮箱' name="email" type="text" className="border border-sky-300 active:border-sky-500 text-[12px] h-[30px] rounded my-2 px-2" />
        </form>
      </div>
    </div>
  )
}
export default MailPanel;
