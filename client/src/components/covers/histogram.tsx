import { forwardRef, memo } from "react";
import { coverVariants } from "./index";
import type { CoverProps } from "./types";

export const HistogramCover = memo(
  forwardRef<SVGSVGElement, CoverProps>(
    ({ className, fit = "contain", ...props }, forwardedRef) => (
      <svg
        width="720"
        height="96"
        viewBox="0 0 720 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={coverVariants({ fit, className })}
        ref={forwardedRef}
        preserveAspectRatio={fit === "cover" ? "none" : "xMidYMid meet"}
        {...props}
      >
        <path d="M0 0H34V95.9996H0V0Z" fill="url(#paint0_linear_1978_26558)" />
        <path
          d="M34 7.83594H69V95.9989H34V7.83594Z"
          fill="url(#paint1_linear_1978_26558)"
        />
        <path
          d="M69 15.6738H103V96.0001H69V15.6738Z"
          fill="url(#paint2_linear_1978_26558)"
        />
        <path
          d="M103 23.5098H137V95.9993H103V23.5098Z"
          fill="url(#paint3_linear_1978_26558)"
        />
        <path
          d="M137 31.3477H171V96.0005H137V31.3477Z"
          fill="url(#paint4_linear_1978_26558)"
        />
        <path
          d="M171 39.1836H206V95.9997H171V39.1836Z"
          fill="url(#paint5_linear_1978_26558)"
        />
        <path
          d="M206 47.0195H240V95.9989H206V47.0195Z"
          fill="url(#paint6_linear_1978_26558)"
        />
        <path
          d="M240 56.8164H274V95.9999H240V56.8164Z"
          fill="url(#paint7_linear_1978_26558)"
        />
        <path
          d="M274 64.6523H309V95.9992H274V64.6523Z"
          fill="url(#paint8_linear_1978_26558)"
        />
        <path
          d="M309 72.4902H343V96.0004H309V72.4902Z"
          fill="url(#paint9_linear_1978_26558)"
        />
        <path
          d="M343 80.3262H377V95.9996H343V80.3262Z"
          fill="url(#paint10_linear_1978_26558)"
        />
        <path
          d="M377 72.4902H411V96.0004H377V72.4902Z"
          fill="url(#paint11_linear_1978_26558)"
        />
        <path
          d="M411 64.6523H446V95.9992H411V64.6523Z"
          fill="url(#paint12_linear_1978_26558)"
        />
        <path
          d="M446 56.8164H480V95.9999H446V56.8164Z"
          fill="url(#paint13_linear_1978_26558)"
        />
        <path
          d="M480 47.0195H514V95.9989H480V47.0195Z"
          fill="url(#paint14_linear_1978_26558)"
        />
        <path
          d="M514 39.1836H549V95.9997H514V39.1836Z"
          fill="url(#paint15_linear_1978_26558)"
        />
        <path
          d="M549 31.3477H583V96.0005H549V31.3477Z"
          fill="url(#paint16_linear_1978_26558)"
        />
        <path
          d="M583 23.5098H617V95.9993H583V23.5098Z"
          fill="url(#paint17_linear_1978_26558)"
        />
        <path
          d="M617 15.6738H651V96.0001H617V15.6738Z"
          fill="url(#paint18_linear_1978_26558)"
        />
        <path
          d="M651 7.83594H686V95.9989H651V7.83594Z"
          fill="url(#paint19_linear_1978_26558)"
        />
        <path
          d="M686 0H720V95.9996H686V0Z"
          fill="url(#paint20_linear_1978_26558)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_1978_26558"
            x1="17"
            y1="0"
            x2="17"
            y2="95.9996"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_1978_26558"
            x1="51.5"
            y1="7.83594"
            x2="51.5"
            y2="95.9989"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_1978_26558"
            x1="86"
            y1="15.6738"
            x2="86"
            y2="96.0001"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_1978_26558"
            x1="120"
            y1="23.5098"
            x2="120"
            y2="95.9993"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint4_linear_1978_26558"
            x1="154"
            y1="31.3477"
            x2="154"
            y2="96.0005"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint5_linear_1978_26558"
            x1="188.5"
            y1="39.1836"
            x2="188.5"
            y2="95.9997"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint6_linear_1978_26558"
            x1="223"
            y1="47.0195"
            x2="223"
            y2="95.9989"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint7_linear_1978_26558"
            x1="257"
            y1="56.8164"
            x2="257"
            y2="95.9999"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint8_linear_1978_26558"
            x1="291.5"
            y1="64.6523"
            x2="291.5"
            y2="95.9992"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint9_linear_1978_26558"
            x1="326"
            y1="72.4902"
            x2="326"
            y2="96.0004"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint10_linear_1978_26558"
            x1="360"
            y1="80.3262"
            x2="360"
            y2="95.9996"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint11_linear_1978_26558"
            x1="394"
            y1="72.4902"
            x2="394"
            y2="96.0004"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint12_linear_1978_26558"
            x1="428.5"
            y1="64.6523"
            x2="428.5"
            y2="95.9992"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint13_linear_1978_26558"
            x1="463"
            y1="56.8164"
            x2="463"
            y2="95.9999"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint14_linear_1978_26558"
            x1="497"
            y1="47.0195"
            x2="497"
            y2="95.9989"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint15_linear_1978_26558"
            x1="531.5"
            y1="39.1836"
            x2="531.5"
            y2="95.9997"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint16_linear_1978_26558"
            x1="566"
            y1="31.3477"
            x2="566"
            y2="96.0005"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint17_linear_1978_26558"
            x1="600"
            y1="23.5098"
            x2="600"
            y2="95.9993"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint18_linear_1978_26558"
            x1="634"
            y1="15.6738"
            x2="634"
            y2="96.0001"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint19_linear_1978_26558"
            x1="668.5"
            y1="7.83594"
            x2="668.5"
            y2="95.9989"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <linearGradient
            id="paint20_linear_1978_26558"
            x1="703"
            y1="0"
            x2="703"
            y2="95.9996"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.13" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.41" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
        </defs>
      </svg>
    ),
  ),
);

HistogramCover.displayName = "HistogramCover";
