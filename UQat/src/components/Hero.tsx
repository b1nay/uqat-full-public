import Link from "next/link";
import { VscLinkExternal } from "react-icons/vsc";
export default function Hero() {
  return (
    <div className="bg-[url('/hero-bg.jpg')]  bg-no-repeat bg-top bg-cover  flex justify-start  items-center h-[calc(100vh-64px)]  ">
      <div className="backdrop-blur-xs flex justify-start w-full">
        <div className="max-w-7xl  mx-auto text-white flex  items-center justify-start  h-[calc(100vh-64px)] ">
          <div className="w-1/2 gap-5 flex flex-col">
            <div className="text-4xl font-bold border-b-3 py-5">
              Unified QnA Assistant: UQat
            </div>
            <span className="text-xl">
              Unified QnA Assistant is an intelligent platform designed to
              streamline how InfoSec and compliance teams handle security
              questionnaires and on-demand queries. Powered by a centralized,
              domain-specific knowledge library, this tool offers dual modes of
              interaction.
            </span>
            <div className="inline-flex items-center gap-5">
              <Link
                href="/chat"
                className="inline-flex  gap-2 font-semibold items-center bg-white text-main px-4 py-2 text-xl    hover:text-white hover:text-semibold hover:bg-transparent hover:border hover:border-white transition-all duration-200 ease"
              >
                Chat
              </Link>
              <Link
                href="/batch"
                className="inline-flex  font-semibold gap-2 items-center bg-transparent text-white px-4 py-2  text-xl    hover:text-black hover:text-semibold hover:bg-white  border border-white transition-all duration-200 ease"
              >
                Batch <VscLinkExternal />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
