import Head from 'next/head';
import Header from 'components/header';
import Link from 'next/link';


export default function Home({ user }) {
  return (
    <div >
      <Head>
        <title>Gante! 高效的项目管理，流程图在线工具</title>
        <meta name="description" content="Gante是一款稳定高效的项目管理工具, 可靠，稳定，高效，免费！" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="google-signin-client_id" content="499253238732-j69pk534uht0ce1h8vg1ts8epak5rgm8.apps.googleusercontent.com" />
      </Head>
      <main className="overflow-hidden min-h-[100vh] bg-[#03254c] text-[#f0f0f0]">
        <Header user={user} />

        <div className="text-[30px] text-center mt-[100px]">
          <h1 className="text-[35px]">
            gante.link 高效的项目管理，甘特图在线工具
          </h1>

          <h1>免费管理你自己的项目进度软件</h1>
        </div>

        <div className="text-black flex-col flex justify-around w-full items-center text-blod text-[30px] mt-[50px] px-10">
          <div className="flex font-mono text-[#f0f0f0] justify-center items-center shrink-0 h-[200px]">
            打开我的
            <Link href={`/editor?id=${user?.defaultTableId || 'guest'}`}>
              <div className="ml-4 bg-blue-500/50 p-4 border-box text-[20px] block box-border rounded-lg hover:ring ring-[#d6e6ff] ring-offset-black hover:ring-offset-2">Gante工具</div>
            </Link>
          </div>

          <div className="p-2 shrink-0 border shadow shadow-lg bg-white" >
            <div className="max-w-full w-[900px] h-[450px] bg-[url('/gante-first.png')] bg-cover"></div>
          </div>
        </div>
      </main>
    </div>
  )
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
