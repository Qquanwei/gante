import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import Modal from 'components/modal';
import { Menu, MenuItem, MenuHeader, MenuDivider, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import PhoneLogin from 'components/phone-login';
import Script from 'next/script'


function User({ user }) {
  const [isLogin, setLogin] = useState(!!user);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    window.onGoogleSignIn = function (googleUser) {
      var profile = googleUser.getBasicProfile();
      console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
      console.log('Name: ' + profile.getName());
      console.log('Image URL: ' + profile.getImageUrl());
      console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    }

    return () => {
      window.onGoogleSignIn = null;
    }
  }, []);

  const onClick = useCallback(() => {
    setShowLoginModal(true);
  }, []);

  const onModalClose = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  return (
    <div>
      <div
        className={
        classNames("flex justify-center items-center text-xs select-none cursor-pointer w-[50px] h-[50px] rounded-full")
        }>
        {
          isLogin ? (
            <Menu menuButton={<MenuButton><img src={user.avatar} className="rounded border-box hover:border-2 border-sky-500" width="50" height="50" /></MenuButton>} transition>
              <Link href='/user'>
                <MenuItem>
                  个人中心
                </MenuItem>
              </Link>
              <MenuHeader>登录操作</MenuHeader>
              <MenuDivider />
              <Link href="/quit">
                <MenuItem>
                  退出登录
                </MenuItem>
              </Link>
              <MenuItem onClick={onClick}>切换账号</MenuItem>
            </Menu>


          ) : <div onClick={onClick}>登录</div>
        }
      </div>
      <Modal show={showLoginModal} onClose={onModalClose} title="登录授权">
        <div className="flex items-center justify-center flex-col mx-auto mt-[20px] w-[300px]">
          登录后即可创建专属甘特图空间

          <PhoneLogin className="w-[300px] mt-[20px]" />

          <div className="h-[1px] border-gray-300/30 rounded border-t mt-[50px] mb-[10px] w-full flex items-center justify-center">
            <div className="text-gray-500 text-[13px] bg-white px-3">其他登录方式</div>
          </div>
          <a className="github-login block border flex items-center justify-center hover:bg-gray-300 w-full mt-[10px] h-[60px]" noreferer="true" href={`https://github.com/login/oauth/authorize?login&client_id=${process.env.GANTE_GITHUB_CLIENT_ID}&scope=user`} >
            <i className="w-[36px] h-[36px] bg-[url(/github-mark.png)] bg-contain bg-no-repeat mr-[10px]"></i>
            Github
          </a>


        </div>
      </Modal>
    </div>
  );
}

export default User;
