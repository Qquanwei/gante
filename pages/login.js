import { useCallback, useRef } from 'react';
import axios from 'axios';
import { getUserIdBySession } from '../server/helpers';

export default function Login() {
  const unameRef = useRef(null);
  const passwordRef = useRef(null);

  const onSubmit = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    axios.post('/api/login', {
      uname: unameRef.current.value,
      passworld: unameRef.current.value
    });
  }, []);

  const onReg = useCallback(() => {
    axios.post('/api/reg', {
      uname: unameRef.current.value,
      passworld: unameRef.current.value
    });
  }, []);

  return (
    <form onSubmit={onSubmit}>
      <div className="flex justify-center h-[500px] items-center">
        <div className="p-2 bg-blue-300 rounded flex items-center">
          <label htmlFor="uname">uname</label>
          <input ref={unameRef} className="border rounded ml-2" name="uname" type="text"/>
          <label htmlFor="password" className="ml-4">password</label>
          <input ref={passwordRef} className="border rounded ml-2" name="password" type="password"/>
          <div onClick={onSubmit} className="h-[30px] inline-block ml-2 bg-white rounded inline-flex items-center w-[60px] justify-center">登录</div>
          <div onClick={onReg} className="h-[30px] inline-block ml-2 bg-white rounded inline-flex items-center w-[60px] justify-center">注册</div>
        </div>
      </div>
    </form>
  );
}

export function getServerSideProps({ res, req }) {
  const uid = getUserIdBySession(req);

  if (!uid) {
    return {
      props: {}
    };
  } else {
    return {
      redirect: '/'
    };
  }
}
