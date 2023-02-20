export default function() {
  return (
      <div className="text-[#333] fixed left-0 right-0 top-0 bottom-0 right-0 flex items-center justify-center">
        已成功退出账号
    </div>
  );
}

export function getServerSideProps({ req, res }) {
  res.setHeader("set-cookie", `ud=''; path=/; maxAge=0; httponly;`)

  return {
    redirect: {
      destination: '/'
    }
  };
}
