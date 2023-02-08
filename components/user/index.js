import { useEffect, useState, useCallback } from 'react';
import classNames from 'classnames';
import Modal from 'components/modal';
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
        onClick={onClick}
        className={
        classNames("flex justify-center items-center text-xs select-none cursor-pointer outline outline-gray-500/50 outline-1 outline-offset-2 w-[50px] h-[50px] rounded-full", {
          'bg-gray-300': !isLogin
        })
        }>
        {
          isLogin ? user.userName : '登录'
        }
      </div>
      <Modal show={showLoginModal} onClose={onModalClose} className="bg-[#003f5c]">
        <h1 className="text-gray-500">
          第三方登录授权
        </h1>
        <div className="flex items-center justify-center flex-col mx-auto mt-[20px] w-[300px]">
          <div className="g-signin2 h-[36px]" data-onsuccess="onGoogleSignIn"></div>
          <a className="github-login block border flex items-center justify-center hover:bg-gray-300 w-full mt-[10px] h-[36px]" noreferer="true" href="https://github.com/login/oauth/authorize?login&client_id=c7b4ad0b9f7f6b38da81&scope=user" >
            Github
          </a>
        </div>
      </Modal>
      <Script src="https://apis.google.com/js/platform.js" async defer></Script>
    </div>
  );
}

export default User;
