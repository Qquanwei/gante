import { useCallback, useState } from 'react';
import classNames from 'classnames';
import axios from 'axios';

function SuggestModal({ onClose, show }) {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [content, setContent] = useState('');

  const onSubmit = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();

    if (pending) {
      return;
    }

    const data = new FormData(e.target);
    const sender = data.get('sender');
    const content = data.get('content');
    if (content.length < 3) {
      setError('内容过短哦~');
    } else {
      setError(null);
      setPending(true);
      setContent(content);
      setTimeout(() => {
        axios.post('/api/suggest', {
          sender, content
        }).then(() => {
          setSuccess(true);
          setPending(false);
        }).catch(error => {
          setSuccess(false);
          setError(error.message);
          setPending(false);
        });
      }, 500);
    }
  }, [pending]);

  return (
    <div className={classNames("z-20 opacity-0 fixed shadow px-2 duration-[.5s] rounded right-[20px] pt-[50px] transition-all w-[300px] h-[500px] bg-white bottom-[-600px]", {
      '!bottom-[20px] !opacity-100': show
    })}>
      <div className="absolute right-2 top-2 cursor-pointer hover:text-sky-500" onClick={onClose}>关闭</div>
      <div className="bg-[url(/logo.png)] rounded left-[10px] top-[-30px] absolute cursor-pointer bg-white w-[60px] bg-cover h-[60px]"></div>
      <form onSubmit={onSubmit} className={classNames('opacity-100 transition-all duration-[.3s]', {
        '!opacity-0': !pending && success
      })}>

        <div>您的电话或邮箱地址:</div>
        <input name="sender" type="text" className="mt-2 border text-[13px] w-full h-[30px] px-2" placeholder="可选" />
        <div className="mt-[10px]">您的意见或者想吐槽点:</div>
        <textarea placeholder="我认为..." className={classNames("text-[13px] w-full border p-2", {
          'text-gray-300': pending
        })} cols="30" id="" name="content" rows="10"></textarea>
        <button type="submit" className={classNames("text-[14px] inline-block border p-2 cursor-pointer hover:border-sky-500", {
          'text-gray-300': pending
        })}>
          提交
          {
            pending ? '(loading...)' : null
          }
        </button>
        <div className="text-[12px] text-sky-500 mt-[10px]">
          您也可以来github反馈:
          <div>
            <a href="https://github.com/Qquanwei/gante" target="_blank">
              https://github.com/Qquanwei/gante
            </a>
          </div>
        </div>
        {
          !pending && error && (
            <div className="text-red-500 text-[12px] mt-2">{ error }</div>
          )
        }
      </form>
      <div className={classNames("absolute top-[500px] left-0 right-0 text-center transition-all duration-[.8s] text-green-500 text-[12px] mt-2 opacity-0", {
        '!opacity-100 !top-[100px]': !pending && success
      })}>
        <div>
          提交成功，感谢反馈
        </div>
        <div className="px-4">
          您的每条建议会被认真对待
        </div>
        <div className="text-gray-500">
          { content }
        </div>
      </div>
    </div>
  );
}

export default SuggestModal;
