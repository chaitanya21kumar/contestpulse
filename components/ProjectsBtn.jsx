/**
 * ProjectsBtn.jsx  // ↗ opens your GitHub profile in a new tab
 * -----------------------------------------------------------
 * • Link now points to an external URL (GitHub) instead of /work
 * • `target="_blank"` + `rel="noopener noreferrer"` = security best-practice
 */

import Image from "next/image";
import Link  from "next/link";
import { HiArrowRight } from "react-icons/hi2";

const ProjectsBtn = () => {
  return (
    <div className="mx-auto xl:mx-0">
      <Link
        href="https://github.com/chaitanya21kumar"
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-[185px] h-[185px] flex justify-center items-center
                   bg-circleStar bg-cover bg-center bg-no-repeat group"
      >
        <Image
          src="/rounded-text.png"
          alt="rounded Projects button text"
          width={141}
          height={148}
          className="animate-spin-slow w-full h-full max-w-[141px] max-h-[148px]
                     pointer-events-none select-none"
        />
        <HiArrowRight
          className="absolute text-4xl group-hover:translate-x-2 transition-all duration-300"
          aria-hidden
        />
      </Link>
    </div>
  );
};

export default ProjectsBtn;
