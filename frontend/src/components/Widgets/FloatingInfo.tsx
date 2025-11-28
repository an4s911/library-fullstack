import { SiGithub } from "@icons-pack/react-simple-icons";
import { GlobeIcon, InfoIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type FloatingInfoProps = {};

function FloatingInfo({}: FloatingInfoProps) {
    const [isHovering, setIsHovering] = useState(false);
    const [showText, setShowText] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const textInfoRef = useRef<HTMLDivElement>(null);

    // Define the media query for Tailwind's 'md' (min-width: 768px)
    const isMdScreen = window.matchMedia("(min-width: 768px)").matches;
    const heightWidthValue = isMdScreen ? "50px" : "46px";

    useEffect(() => {
        if (isHovering && containerRef.current) {
            containerRef.current.style.height = "165px";
            containerRef.current.style.width = "350px";
            containerRef.current.style.borderRadius = "10px";
            containerRef.current.style.transition = "0.3s ease-in-out";
            containerRef.current.style.transitionProperty = "height, width";
        } else if (!isHovering && containerRef.current) {
            containerRef.current.style.height = heightWidthValue;
            containerRef.current.style.width = heightWidthValue;
            containerRef.current.style.borderRadius = "50%";
            containerRef.current.style.transition =
                "height 0.3s ease-in-out, width 0.3s ease-in-out, border-radius 0.5s ease-in-out";
        }
    }, [isHovering]);

    return (
        <div
            ref={containerRef}
            style={{
                height: heightWidthValue,
                width: heightWidthValue,
            }}
            onMouseEnter={() => {
                setShowText(false);
                setIsHovering(true);
            }}
            onTransitionEnd={() => {
                setShowText(isHovering);
            }}
            onMouseLeave={() => {
                setIsHovering(false);
                setShowText(false);
            }}
            className={`bg-secondary-200/85 dark:bg-info-600/85 fixed bottom-0 right-0 mr-2 mb-2 md:mr-10 md:mb-8 rounded-full
                border-2 border-secondary-400 dark:border-secondary-900 flex ${isHovering ? "p-4 pr-12" : ""}`}
        >
            {isHovering && (
                <div
                    ref={textInfoRef}
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${showText ? "max-w-full" : "max-w-0"}
                    flex flex-col h-full w-full gap-5`}
                >
                    <div className="flex flex-col gap-5 min-w-max">
                        <h3 className="font-bold">
                            Built by{" "}
                            <a
                                className="underline italic font-normal hover:underline-offset-2
                                hover:decoration-2 hover:decoration-secondary-400"
                                href={import.meta.env.VITE_GITHUB_URL}
                            >
                                Anas Bashir
                            </a>
                        </h3>
                        <a
                            href={import.meta.env.VITE_PORTFOLIO_URL}
                            target="_blank"
                            className="portfolio w-max flex gap-2 items-center"
                        >
                            <GlobeIcon />
                            <span
                                className="underline italic font-normal hover:underline-offset-2
                                hover:decoration-2 hover:decoration-secondary-400"
                            >
                                {import.meta.env.VITE_PORTFOLIO_URL}
                            </span>
                        </a>
                        <a
                            href={import.meta.env.VITE_GITHUB_URL}
                            target="_blank"
                            className="github w-max flex gap-2 items-center"
                        >
                            <SiGithub />
                            <span
                                className="underline italic font-normal hover:underline-offset-2
                                hover:decoration-2 hover:decoration-secondary-400"
                            >
                                {import.meta.env.VITE_GITHUB_URL}
                            </span>
                        </a>
                    </div>
                </div>
            )}
            <InfoIcon
                className={`circle-help-icon transition duration-300 ease-in-out ${
                    isHovering ? "" : ""
                } absolute right-[21px] bottom-[21px] md:right-[23px] md:bottom-[23px] translate-x-1/2 translate-y-1/2
                h-[25px] w-[25px] md:h-[30px] md:w-[30px]`}
                // } absolute`}
            />
        </div>
    );
}

export default FloatingInfo;
