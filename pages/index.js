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
      <main className="fixed left-0 right-0 bottom-0 top-0 bg-[#03254c] text-white">
        <Header user={user} />

        <div className="text-[30px] text-center mt-[100px]">
          <h1 className="text-[35px]">
            gante.link 高效的项目管理，甘特图在线工具
          </h1>

          <h1>免费管理你自己的项目进度软件</h1>
        </div>
        <div className="absolute p-2 border shadow shadow-lg right-10 top-[200px] bg-white" >
          <div className="w-[500px] h-[500px] bg-[url('/gante-first.png')] bg-cover"></div>
        </div>
        <div className="text-black h-[300px] flex items-center text-blod text-[30px] absolute top-[300px] px-10 w-full">
          <div className="flex font-mono text-white justify-center items-center">
            打开我的
            <Link href={`/editor?id=${user?.defaultTableId || 0}`}>
              <div className="ml-4 bg-blue-500/50 p-4 border-box text-[20px] block box-border rounded-lg hover:ring ring-[#d6e6ff] ring-offset-black hover:ring-offset-2">Gante工具</div>
            </Link>
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
