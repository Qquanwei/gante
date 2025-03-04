import { useCallback } from 'react';
import axios from 'axios';
import classNames from 'classnames';
import React from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import * as atoms from '../gante-core/atom';
import { toast } from 'react-toastify';
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
      toast.warn('邮箱地址不合法', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light"
      });
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
    if (!user.email) {
      toast.warn('请先设置邮箱地址', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light"
      });
      return;
    }
    return axios.post('/api/user/notify').then(() => {
      toast.success('发送成功', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light"
      });
    });
  }, []);

  const onSwitchChange = useCallback((event) => {
    const checked = event.currentTarget.checked;
    return axios.put('/api/user/extra', {
      value: {
        ...user.extra,
        enableMailAgenda: checked
      }
    }).then((resp) => {
      setUser(resp.data);
    });
  }, [setUser, user.extra]);

  return (
    <div className={classNames(className, 'h-full text-[14px]')}>
      <div className="px-2 mt-2 text-gray-500" >通知管理</div>

      <div className='px-2 bg-sky-300/50 px-2 text-[15px] my-5'>
        <div>开启邮件通知功能！</div>
        <div>邮件能力试验性测试中。开启后每天8点自动发送agenda中待办事项</div>
      </div>

      <div className="px-2 text-gray-500 mt-2">
        <div className='text-[14px]'>当前通知邮箱: {user?.email || '未设置'}</div>
        <div className='flex items-center cursor-pointer mt-5'>
          <input type="checkbox" name="enable" onChange={onSwitchChange} checked={!!user.extra?.enableMailAgenda} />
          <label htmlFor="enable" className='ml-2'>开启每日推送</label>
        </div>

        <form className="w-full" onSubmit={onSubmitEmail}>
          <div className='flex w-full border border-blue-gray rounded overflow-hidden mt-5'>
            <input placeholder='通知邮箱地址' name="email" className="!bg-white selected:bg-white flex-grow my-2 outline-none px-2" />
            <button
              className="bg-gray-300 px-4 flex-shrink-0 hover:bg-sky-300 border-none"
              itemType='submit'
            >
              更新
            </button>
          </div>
        </form>

        <button className="mt-[40px] rounded bg-gray-300 hover:bg-sky-300 p-2 text-balck" title="测试邮件是否正常发送" onClick={onSendNotify}>发送当前待办邮件(每天最多3封)</button>
      </div>
    </div>
  )
}
export default MailPanel;
