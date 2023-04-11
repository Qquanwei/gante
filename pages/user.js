import { useCallback } from 'react';
import PhoneLogin from 'components/phone-login';
import Link from 'next/link';

function UserProfile({ user }) {

  const onClickBack = useCallback(() => {
    window.history.back();
  }, []);

  return (
    <div className="bg-[#fbfbfb] w-[100vw] h-[100vh] font-mono pt-[20px]">
      <Link href="/">
        <div className="ml-[100px] bg-[url(/logo.png)] rounded cursor-pointer bg-white w-[60px] bg-cover h-[60px]"></div>
      </Link>
      <div className="w-[800px] ml-[100px] pt-[50px]">


        <div className="mt-[10px] text-gray-500">基本信息</div>
        <div className="flex items-center mt-4">
          <div>
            用户名:
          </div>
          <div>
            { user?.userName || <span className="ml-2 text-gray-500">未设置</span> }
          </div>
        </div>

        <div className="flex items-center mt-4">
          <div>
            手机号:
          </div>
          {
            user?.phone ? user.phone : <PhoneLogin />
          }
          <span className="ml-2 text-gray-500">绑定可快速登录</span>
        </div>

        <div className="flex items-center mt-4">
          <div>关联账号:</div>
          <div className="ml-2">
            <div title="Github" className="w-[30px] h-[30px] bg-contain bg-[url(/github-mark.png)]"></div>
          </div>
          <span className="ml-2 text-gray-500">绑定可快速登录</span>
        </div>

        <div className="flex mt-4 h-[30px] items-center">
          <div>拥有角色:</div>
          {
            (user?.roles || []).map((role) => {
              return (
                <div className="ml-2 bg-[#9b65ff30] rounded px-2" key={role.name}>{ role?.name }</div>
              )
            })
          }
          {
            user?.roles ? null : <span className="text-gray-500 ml-2">无</span>
          }
        </div>
      </div>

      <div className="h-[50px] flex ml-[100px] mt-[80px]">
        <div className="hover:border-sky-600 border border-gray-200 w-[100px] h-[42px] rounded-md cursor-pointer select-none flex items-center justify-center" onClick={onClickBack}>
          返回
        </div>
      </div>
    </div>
  );
}

import axios from 'axios';
export async function getServerSideProps({ req }) {
  try {
    const userReq = await axios({
      url: 'http://localhost:8088/api/user',
      headers: {
        cookie: req.headers.cookie
      }
    });
    return {
      props: {
        user: userReq.data
      }
    };
  } catch(error) {
    return {
      props: {}
    };
  }
}

export default UserProfile;
