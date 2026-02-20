import { forwardRef, memo, useId } from "react";
import { iconVariants, type IconProps } from "..";

export const QuestUsedIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => {
      const filterId = useId();

      return (
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={iconVariants({ size, className })}
          ref={forwardedRef}
          {...props}
        >
          <defs>
            <filter
              id={filterId}
              x="3.5"
              y="5.83331"
              width="23"
              height="18.3333"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dx="2" dy="2" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.24 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_quest_used"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_quest_used"
                result="shape"
              />
            </filter>
          </defs>
          <g filter={`url(#${filterId})`}>
            <path
              d="M10.4849 20.9096C10.0832 21.3113 9.43197 21.3113 9.03029 20.9096L5.5148 17.3941C5.04628 16.9256 5.04628 16.166 5.5148 15.6975C5.98332 15.229 6.74293 15.229 7.21145 15.6975L9.75759 18.2436L20.7876 7.21252C21.2564 6.74371 22.0165 6.74382 22.4851 7.21276C22.9535 7.68147 22.9534 8.4411 22.4848 8.90966L10.4849 20.9096Z"
              fill="currentColor"
            />
            <path
              d="M23.9167 17.5C24.2375 17.5 24.5 17.7625 24.5 18.0833C24.5 20.3401 22.6734 22.1666 20.4167 22.1666H10.6925C10.6972 22.1645 10.7016 22.162 10.7062 22.1598C12.4089 22.0608 13.7846 20.744 13.9761 19.0677L15.5449 17.5H23.9167Z"
              fill="currentColor"
            />
            <path
              d="M17.5 5.83331C18.3429 5.83331 19.1163 6.13181 19.7205 6.62856L9.75716 16.5931L8.16667 15.0026V7.58331C8.16667 6.92706 7.94792 6.32185 7.58333 5.83331H17.5Z"
              fill="currentColor"
            />
            <path
              d="M21 16.3333H16.7116L21 12.0438V16.3333Z"
              fill="currentColor"
            />
            <path
              d="M5.25 5.83331C6.21615 5.83331 7 6.61717 7 7.58331V10.5H4.66667C4.02135 10.5 3.5 9.97863 3.5 9.33331V7.58331C3.5 6.61717 4.28385 5.83331 5.25 5.83331Z"
              fill="currentColor"
            />
          </g>
        </svg>
      );
    },
  ),
);

QuestUsedIcon.displayName = "QuestUsedIcon";
