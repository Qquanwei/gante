import { useCallback, useState } from 'react';
import Contribute from 'components/contribute';
import Input from 'components/main-input';
import Button from 'components/button';
import classNames from 'classnames';
import Link from 'next/link';

function UserProfile({ user: defaultUser, contribute }) {
  const [user, setUser] = useState(defaultUser);
  const [showUserNameInput, setShowUserNameInput] = useState(false);

  const onClickBack = useCallback(() => {
    window.history.back();
  }, []);

  const onUpdateUserName = useCallback((value) => {
    return axios.put('/api/user/userName', {
      value
    }).then((resp) => {
      setShowUserNameInput(false);
      setUser(resp.data);
    });
  }, []);

  const onClickShowUpdateUserName = useCallback(() => {
    setShowUserNameInput(true);
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
          <div className="ml-2">
            { user?.userName || <span className="ml-2 text-gray-500">未设置</span>}
            <span className={classNames("ml-2 text-gray-500 cursor-pointer", { hidden: showUserNameInput})} onClick={onClickShowUpdateUserName}>点击更新</span>
            <div className={classNames("inline-flex items-center", { hidden: !showUserNameInput})}>
              <Input className="ml-2" onChange={onUpdateUserName} >
                <Button type="submit" className="ml-2 border-none">更新</Button>
              </Input>
            </div>
          </div>
        </div>

        <div className="flex items-center mt-4">
          <div>
            手机号:
          </div>
          {
            user?.phone ? <span className="ml-2">{user.phone}</span> : null
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
        <Button className="w-[100px]" onClick={onClickBack}>返回</Button>
      </div>

      <div className="w-[800px] ml-[100px] pt-[50px]">
        <Contribute className='mt-10' contributes={contribute}/>
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
    let contributeReq;
    try {
      contributeReq = await axios({
        url: 'http://localhost:8088/api/contributes',
        headers: {
          cookie: req.headers.cookie
        }
      })
    } catch {

    }

    return {
      props: {
        user: userReq.data,
        contribute: contributeReq ? contributeReq.data : null
      }
    };
  } catch(error) {
    console.log('error:', error);
    return {
      props: {}
    };
  }
}

export default UserProfile;
