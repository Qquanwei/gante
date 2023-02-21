export default function Loading() {
  return (
    <div className="fixed flex items-center justify-center left-0 right-0 bottom-0 top-0 bg-white">
      <div className="text-center">
        <div className=" animate-bounce	 rounded bg-[url(/logo.png)] bg-contain bg-no-repeat bg-center w-[100px] h-[100px]"></div>
      </div>
    </div>
  );
}
