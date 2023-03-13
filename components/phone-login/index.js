import { useCallback, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import classNames from 'classnames';

function PhoneLogin({ className }) {
  const [loading, setLoading] = useState(false);
  const [outTime, setOutTime] = useState(0);
  const [_, forceUpdate] = useState({});
  const [error, setError] = useState(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [phone, setPhone] = useState('');

  const onPhoneSubmit = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    if (loading) {
      return;
    }
    const data = new FormData(e.target);
    const phone = data.get('ipt');
    setError(false);
    setLoading(true);
    axios.post('/api/captcha', { phone }).then(resp => {
      console.log(resp);
      setOutTime(60 * 1000 + Date.now());
      setLoading(false);
      setShowCaptcha(true);
      setPhone(phone);
    }).catch(error => {
      setError(error?.response?.data?.message || error.message);
      setLoading(false);
    });
  }, [loading]);

  useEffect(() => {
    if (outTime) {
      const timer = setInterval(() => {
        if (Date.now() > outTime) {
          clearInterval(timer);
        }
        forceUpdate({});
      }, 1000);
      return () => {
        clearInterval(timer);
      }
    }
    return () => {};
  }, [outTime]);

  const onCaptchaSubmit = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    const number = new FormData(e.target).get('captcha');
    axios.post('/api/captcha/login', {
      phone,
      number
    }).then(() => {
      window.location.reload();
    }).catch((error) => {
      setError(error?.response?.data?.message || error.message);
    });
  }, [phone]);

  return (
    <div className={classNames("border-2 border-sky-500 rounded-md px-2 mx-2 transition-all", className)}>
      <form className="relative flex items-center" onSubmit={onPhoneSubmit}>
        <span>+86</span>
        <input className="mx-2 p-2 focus:outline-none rounded h-[50px] w-[160px]" name="ipt" type="text" />
        <button type="submit" className={classNames("whitespace-nowrap ml-2 flex items-center cursor-pointer select-none hover:text-sky-500 transition-all", {
          'opacity-5': loading
        })}>{ outTime > Date.now() ? Math.floor((outTime - Date.now()) / 1000) + 's' : '立即登录'}
          <div className={classNames('text-red-500 text-[12px] absolute bottom-0 left-[40px] ml-2', { hidden: !error})}>{ error }</div>
        </button>
      </form>
      <form className={classNames("mt-2 border-t border-sky-500/20 pt-2 rounded", { hidden: !showCaptcha })} onSubmit={onCaptchaSubmit}>
        <input name="captcha" type="text" className="mx-2 p-2 focus:outline-none rounded h-[50px]" placeholder="请输入验证码" />
        <button type="submit">确定</button>
      </form>
    </div>
  );
}


export default PhoneLogin;
