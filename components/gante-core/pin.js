import classNames from 'classnames';

export default function Pin({ className }) {
  return (
      <div className={classNames("cursor-pointer w-[20px] h-[20px] bg-[url(/tuding.png)] bg-contain", className)}>
      </div>
  );
}
