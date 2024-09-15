import classNames from "classnames";
import React from "react";

interface IContribute {
  content?: string;
  username?: string;
  contribute_date?: string;
}
interface IContributeProps {
  className?: string;
  contributes: IContribute[];
}
const Contribute: React.FC<IContributeProps> = ({ className, contributes }) => {
  return (
    <div className={classNames(className, 'p-4 bg-stone-500 text-white rounded-[10px]')}>

      <div>
        本站的长期运营离不开朋友们的支持，为了支持本站更好的发展，目前开启捐赠渠道，主要用于支付服务器维护成本，支持本站提供更优质的服务。
        本站点维护模式主要靠捐赠为主，不会限制访问和使用（本站初心，以付费要挟用户解锁功能不可取），如果你喜欢这款小而美的软件，可以以捐赠的形式参与到本站的建设，
        捐赠者会永久出现在本站捐赠者名单上。
      </div>
      <div className="mt-2">
        通过下方捐赠渠道，转账备注格式：您的称呼（展示在捐赠者名单中），备注说明（展示在捐赠者名单中），手机号（用于关联本站用户）
      </div>

      <div className="mt-2 bg-[url(/a6x06616enwielom9aa0y4b.png)] bg-contain bg-white w-[200px] h-[200px] rounded-[5px]">

      </div>

      <div className="mt-[20px] text-amber-300">
        <div>捐赠者名单</div>
        {
          contributes.map((ctb, index) => {
            return (
              <div key={index} className="flex">
                <div className="w-[300px]">{ctb.username}</div>
                <div className="w-[300px]">{ctb.content}</div>
                <div className="w-[300px]">{ctb.contribute_date}</div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default Contribute;
