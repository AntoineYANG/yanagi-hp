import { type FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import Balancer from "react-wrap-balancer";

import { font } from "@/src/theme";
import InlineEmail from "@cp/inline-email.client";


export interface ITeamMember {
  name: string;
  alias?: string;
  coverSrc: string;
  title: string;
  desc?: string;
  links?: Partial<{
    github: string;
    googleScholar: string;
    x: string;
    facebook: string;
  }>;
  email?: string;
}


const TeamMember: FC<ITeamMember & { emailReplacer?: Record<string, string> }> = ({ name, alias, coverSrc, title, desc, links = {}, email, emailReplacer }) => {
  const nameSeg = name.split(" ");
  const sirName = nameSeg.splice(-1, 1);
  const mainName = nameSeg.join(" ");

  return (
    <div className={`${font.sometypeMono.className} portrait:flex portrait:items-stretch portrait:text-left landscape:text-center bg-white shadow-sm shadow-foreground/10`}>
      <div className="relative landscape:w-full portrait:w-[30%] portrait:h-full landscape:h-[334px] xl:!h-[calc(8vw+232px)] portrait:flex-none portrait:items-stretch portrait:justify-stretch">
        <Image
          alt={name}
          className="w-full h-full portrait:h-60 flex-1 select-none object-cover"
          draggable="false"
          src={coverSrc}
          width={360}
          height={360}
        />
      </div>
      <div className="px-2 portrait:pl-3 portrait:flex portrait:flex-col py-4 landscape:px-4 landscape:py-6 xl:py-8 space-y-2">
        <div className="space-y-1.5 portrait:grow-[9]">
          <div className="flex flex-wrap items-center justify-start landscape:justify-center">
            <p className="text-gray-800 font-semibold leading-6 flex-none text-ellipsis overflow-hidden" title={name}>
              <span className="capitalize">{mainName}</span>&nbsp;
              <span className="uppercase">{sirName}</span>
            </p>
            {alias && <small className="text-sm font-normal text-gray-600 leading-6 mx-2 my-1 flex-none text-ellipsis overflow-hidden">({alias})</small>}
          </div>
          <div className="space-y-1.5">
            <p className="text-gray-500 uppercase text-sm text-ellipsis overflow-hidden">{title}</p>
            {desc && (
              <p className={`${font.sometypeMono.className} pb-1 leading-4`}>
                <small className="text-sm font-normal text-gray-700">
                  <Balancer ratio={0.5}>
                    {desc}
                  </Balancer>
                </small>
              </p>
            )}
          </div>
        </div>
        <div className="flex-grow portrait:flex-grow space-x-2">
          {email && (
            <>
              <EnvelopeIcon aria-hidden="true" title="E-mail" className="inline-block select-none w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">
                <InlineEmail value={email} replacer={emailReplacer} />
              </span>
            </>
          )}
        </div>
        <div className="flex-none portrait:grow-[3] py-2 flex landscape:justify-center items-center space-x-2 landscape:space-x-3">
          {links.github && (
            <Link
              href={links.github}
              title="GitHubProfile"
              className="group relative opacity-80 saturate-[90%] focus:opacity-100 focus:saturate-100 hover:opacity-100 hover:saturate-100 transition-all"
            >
              <svg
                className="w-5 h-5 landscape:w-6 landscape:h-6"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                viewBox="0 0 24 24"
                xmlSpace="preserve"
                aria-label="GitHub Profile"
              >
                <g>
                  <path d="M12.5.75C6.146.75 1 5.896 1 12.25c0 5.089 3.292 9.387 7.863 10.91.575.101.79-.244.79-.546 0-.273-.014-1.178-.014-2.142-2.889.532-3.636-.704-3.866-1.35-.13-.331-.69-1.352-1.18-1.625-.402-.216-.977-.748-.014-.762.906-.014 1.553.834 1.769 1.179 1.035 1.74 2.688 1.25 3.349.948.1-.747.402-1.25.733-1.538-2.559-.287-5.232-1.279-5.232-5.678 0-1.25.445-2.285 1.178-3.09-.115-.288-.517-1.467.115-3.048 0 0 .963-.302 3.163 1.179.92-.259 1.897-.388 2.875-.388.977 0 1.955.13 2.875.388 2.2-1.495 3.162-1.179 3.162-1.179.633 1.581.23 2.76.115 3.048.733.805 1.179 1.825 1.179 3.09 0 4.413-2.688 5.39-5.247 5.678.417.36.776 1.05.776 2.128 0 1.538-.014 2.774-.014 3.162 0 .302.216.662.79.547C20.709 21.637 24 17.324 24 12.25 24 5.896 18.854.75 12.5.75Z" />
                </g>
              </svg>
              <div className="absolute right-0 top-0 pointer-events-none select-none invisible group-focus:visible group-hover:visible translate-x-2/3 -translate-y-1">
                <ArrowTopRightOnSquareIcon
                  aria-hidden="true"
                  role="presentation"
                  className="w-3 h-3 absolute inset-0 opacity-60"
                />
              </div>
            </Link>
          )}
          {links.googleScholar && (
            <Link
              href={links.googleScholar}
              title="Google Scholar Profile"
              className="group relative opacity-80 saturate-[90%] focus:opacity-100 focus:saturate-100 hover:opacity-100 hover:saturate-100 transition-all"
            >
              <Image
                src="https://scholar.google.com/favicon.ico"
                alt="Google Scholar Profile"
                width={19}
                height={19}
                draggable="false"
                className="w-5 h-5 landscape:w-6 landscape:h-6 select-none"
              />
              <div className="absolute right-0 top-0 pointer-events-none select-none invisible group-focus:visible group-hover:visible translate-x-2/3 -translate-y-1">
                <ArrowTopRightOnSquareIcon
                  aria-hidden="true"
                  role="presentation"
                  className="w-3 h-3 absolute inset-0 opacity-60"
                />
              </div>
            </Link>
          )}
          {links.facebook && (
            <Link
              href={links.facebook}
              title="Facebook Profile"
              className="group relative opacity-80 saturate-[90%] focus:opacity-100 focus:saturate-100 hover:opacity-100 hover:saturate-100 transition-all"
            >
              <Image
                src="https://static.xx.fbcdn.net/rsrc.php/yx/r/e9sqr8WnkCf.ico"
                alt="Facebook Profile"
                width={19}
                height={19}
                draggable="false"
                className="w-5 h-5 landscape:w-6 landscape:h-6 select-none opacity-60"
              />
              <div className="absolute right-0 top-0 pointer-events-none select-none invisible group-focus:visible group-hover:visible translate-x-2/3 -translate-y-1">
                <ArrowTopRightOnSquareIcon
                  aria-hidden="true"
                  role="presentation"
                  className="w-3 h-3 absolute inset-0 opacity-60"
                />
              </div>
            </Link>
          )}
          {links.x && (
            <Link
              href={links.x}
              title="X Profile"
              className="group relative opacity-80 saturate-[90%] focus:opacity-100 focus:saturate-100 hover:opacity-100 hover:saturate-100 transition-all"
            >
              <svg
                className="w-5 h-5 landscape:w-6 landscape:h-6"
                version="1.1"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                aria-label="X Profile"
              >
                <g>
                  <rect width="24" height="24" transform="rotate(180 12 12)" opacity="0" />
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </g>
              </svg>
              <div className="absolute right-0 top-0 pointer-events-none select-none invisible group-focus:visible group-hover:visible translate-x-2/3 -translate-y-1">
                <ArrowTopRightOnSquareIcon
                  aria-hidden="true"
                  role="presentation"
                  className="w-3 h-3 absolute inset-0 opacity-60"
                />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};


export default TeamMember;
