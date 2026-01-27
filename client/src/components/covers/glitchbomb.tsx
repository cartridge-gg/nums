import { forwardRef, memo } from "react";
import { coverVariants } from "./index";
import type { CoverProps } from "./types";

export const GlitchbombCover = memo(
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
        <path d="M0 0H48V24H0V0Z" fill="url(#paint0_linear_2017_34449)" />
        <path d="M48 0H96V24H48V0Z" fill="url(#paint1_linear_2017_34449)" />
        <path d="M96 0H144V24H96V0Z" fill="url(#paint2_linear_2017_34449)" />
        <path d="M144 0H192V24H144V0Z" fill="url(#paint3_linear_2017_34449)" />
        <path d="M192 0H240V24H192V0Z" fill="url(#paint4_linear_2017_34449)" />
        <path d="M240 0H288V24H240V0Z" fill="url(#paint5_linear_2017_34449)" />
        <path d="M288 0H336V24H288V0Z" fill="url(#paint6_linear_2017_34449)" />
        <path d="M336 0H384V24H336V0Z" fill="url(#paint7_linear_2017_34449)" />
        <path
          d="M384.001 0H432.001V24H384.001V0Z"
          fill="url(#paint8_linear_2017_34449)"
        />
        <path d="M432 0H480V24H432V0Z" fill="url(#paint9_linear_2017_34449)" />
        <path d="M480 0H528V24H480V0Z" fill="url(#paint10_linear_2017_34449)" />
        <path d="M528 0H576V24H528V0Z" fill="url(#paint11_linear_2017_34449)" />
        <path d="M576 0H624V24H576V0Z" fill="url(#paint12_linear_2017_34449)" />
        <path d="M624 0H672V24H624V0Z" fill="url(#paint13_linear_2017_34449)" />
        <path d="M672 0H720V24H672V0Z" fill="url(#paint14_linear_2017_34449)" />
        <path d="M0 24H48V48H0V24Z" fill="url(#paint15_linear_2017_34449)" />
        <path d="M48 24H96V48H48V24Z" fill="url(#paint16_linear_2017_34449)" />
        <path d="M96 24H144V48H96V24Z" fill="url(#paint17_linear_2017_34449)" />
        <path
          d="M144 24H192V48H144V24Z"
          fill="url(#paint18_linear_2017_34449)"
        />
        <path
          d="M192 24H240V48H192V24Z"
          fill="url(#paint19_linear_2017_34449)"
        />
        <path
          d="M240 24H288V48H240V24Z"
          fill="url(#paint20_linear_2017_34449)"
        />
        <path
          d="M288 24H336V48H288V24Z"
          fill="url(#paint21_linear_2017_34449)"
        />
        <path
          d="M336 24H384V48H336V24Z"
          fill="url(#paint22_linear_2017_34449)"
        />
        <path
          d="M384.001 24H432.001V48H384.001V24Z"
          fill="url(#paint23_linear_2017_34449)"
        />
        <path
          d="M432 24H480V48H432V24Z"
          fill="url(#paint24_linear_2017_34449)"
        />
        <path
          d="M480 24H528V48H480V24Z"
          fill="url(#paint25_linear_2017_34449)"
        />
        <path
          d="M528 24H576V48H528V24Z"
          fill="url(#paint26_linear_2017_34449)"
        />
        <path
          d="M576 24H624V48H576V24Z"
          fill="url(#paint27_linear_2017_34449)"
        />
        <path
          d="M624 24H672V48H624V24Z"
          fill="url(#paint28_linear_2017_34449)"
        />
        <path
          d="M672 24H720V48H672V24Z"
          fill="url(#paint29_linear_2017_34449)"
        />
        <path d="M0 48H48V72H0V48Z" fill="url(#paint30_linear_2017_34449)" />
        <path d="M48 48H96V72H48V48Z" fill="url(#paint31_linear_2017_34449)" />
        <path d="M96 48H144V72H96V48Z" fill="url(#paint32_linear_2017_34449)" />
        <path
          d="M144 48H192V72H144V48Z"
          fill="url(#paint33_linear_2017_34449)"
        />
        <path
          d="M192 48H240V72H192V48Z"
          fill="url(#paint34_linear_2017_34449)"
        />
        <path
          d="M240 48H288V72H240V48Z"
          fill="url(#paint35_linear_2017_34449)"
        />
        <path
          d="M288 48H336V72H288V48Z"
          fill="url(#paint36_linear_2017_34449)"
        />
        <path
          d="M336 48H384V72H336V48Z"
          fill="url(#paint37_linear_2017_34449)"
        />
        <path
          d="M384.001 48H432.001V72H384.001V48Z"
          fill="url(#paint38_linear_2017_34449)"
        />
        <path
          d="M432 48H480V72H432V48Z"
          fill="url(#paint39_linear_2017_34449)"
        />
        <path
          d="M480 48H528V72H480V48Z"
          fill="url(#paint40_linear_2017_34449)"
        />
        <path
          d="M528 48H576V72H528V48Z"
          fill="url(#paint41_linear_2017_34449)"
        />
        <path
          d="M576 48H624V72H576V48Z"
          fill="url(#paint42_linear_2017_34449)"
        />
        <path
          d="M624 48H672V72H624V48Z"
          fill="url(#paint43_linear_2017_34449)"
        />
        <path
          d="M672 48H720V72H672V48Z"
          fill="url(#paint44_linear_2017_34449)"
        />
        <path d="M0 72H48V96H0V72Z" fill="url(#paint45_linear_2017_34449)" />
        <path d="M48 72H96V96H48V72Z" fill="url(#paint46_linear_2017_34449)" />
        <path d="M96 72H144V96H96V72Z" fill="url(#paint47_linear_2017_34449)" />
        <path
          d="M144 72H192V96H144V72Z"
          fill="url(#paint48_linear_2017_34449)"
        />
        <path
          d="M192 72H240V96H192V72Z"
          fill="url(#paint49_linear_2017_34449)"
        />
        <path
          d="M240 72H288V96H240V72Z"
          fill="url(#paint50_linear_2017_34449)"
        />
        <path
          d="M288 72H336V96H288V72Z"
          fill="url(#paint51_linear_2017_34449)"
        />
        <path
          d="M336 72H384V96H336V72Z"
          fill="url(#paint52_linear_2017_34449)"
        />
        <path
          d="M384.001 72H432.001V96H384.001V72Z"
          fill="url(#paint53_linear_2017_34449)"
        />
        <path
          d="M432 72H480V96H432V72Z"
          fill="url(#paint54_linear_2017_34449)"
        />
        <path
          d="M480 72H528V96H480V72Z"
          fill="url(#paint55_linear_2017_34449)"
        />
        <path
          d="M528 72H576V96H528V72Z"
          fill="url(#paint56_linear_2017_34449)"
        />
        <path
          d="M576 72H624V96H576V72Z"
          fill="url(#paint57_linear_2017_34449)"
        />
        <path
          d="M624 72H672V96H624V72Z"
          fill="url(#paint58_linear_2017_34449)"
        />
        <path
          d="M672 72H720V96H672V72Z"
          fill="url(#paint59_linear_2017_34449)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_2017_34449"
            x1="0"
            y1="0"
            x2="73.7943"
            y2="77.8232"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_2017_34449"
            x1="48"
            y1="0"
            x2="121.794"
            y2="77.8232"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_2017_34449"
            x1="96"
            y1="0"
            x2="169.794"
            y2="77.8232"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_2017_34449"
            x1="144"
            y1="0"
            x2="217.794"
            y2="77.8232"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint4_linear_2017_34449"
            x1="192"
            y1="0"
            x2="265.794"
            y2="77.8232"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint5_linear_2017_34449"
            x1="240"
            y1="0"
            x2="313.794"
            y2="77.8232"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint6_linear_2017_34449"
            x1="288"
            y1="0"
            x2="361.794"
            y2="77.8232"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint7_linear_2017_34449"
            x1="336"
            y1="0"
            x2="409.794"
            y2="77.8232"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint8_linear_2017_34449"
            x1="384.001"
            y1="0"
            x2="457.795"
            y2="77.8232"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint9_linear_2017_34449"
            x1="432"
            y1="0"
            x2="505.794"
            y2="77.8232"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint10_linear_2017_34449"
            x1="480"
            y1="0"
            x2="553.794"
            y2="77.8232"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint11_linear_2017_34449"
            x1="528"
            y1="0"
            x2="601.794"
            y2="77.8232"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint12_linear_2017_34449"
            x1="576"
            y1="0"
            x2="649.794"
            y2="77.8232"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint13_linear_2017_34449"
            x1="624"
            y1="0"
            x2="697.794"
            y2="77.8232"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint14_linear_2017_34449"
            x1="672"
            y1="0"
            x2="745.794"
            y2="77.8232"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint15_linear_2017_34449"
            x1="0"
            y1="24"
            x2="73.7943"
            y2="101.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint16_linear_2017_34449"
            x1="48"
            y1="24"
            x2="121.794"
            y2="101.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint17_linear_2017_34449"
            x1="96"
            y1="24"
            x2="169.794"
            y2="101.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint18_linear_2017_34449"
            x1="144"
            y1="24"
            x2="217.794"
            y2="101.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint19_linear_2017_34449"
            x1="192"
            y1="24"
            x2="265.794"
            y2="101.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint20_linear_2017_34449"
            x1="240"
            y1="24"
            x2="313.794"
            y2="101.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint21_linear_2017_34449"
            x1="288"
            y1="24"
            x2="361.794"
            y2="101.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint22_linear_2017_34449"
            x1="336"
            y1="24"
            x2="409.794"
            y2="101.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint23_linear_2017_34449"
            x1="384.001"
            y1="24"
            x2="457.795"
            y2="101.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint24_linear_2017_34449"
            x1="432"
            y1="24"
            x2="505.794"
            y2="101.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint25_linear_2017_34449"
            x1="480"
            y1="24"
            x2="553.794"
            y2="101.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint26_linear_2017_34449"
            x1="528"
            y1="24"
            x2="601.794"
            y2="101.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint27_linear_2017_34449"
            x1="576"
            y1="24"
            x2="649.794"
            y2="101.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint28_linear_2017_34449"
            x1="624"
            y1="24"
            x2="697.794"
            y2="101.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint29_linear_2017_34449"
            x1="672"
            y1="24"
            x2="745.794"
            y2="101.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint30_linear_2017_34449"
            x1="0"
            y1="48"
            x2="73.7943"
            y2="125.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint31_linear_2017_34449"
            x1="48"
            y1="48"
            x2="121.794"
            y2="125.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint32_linear_2017_34449"
            x1="96"
            y1="48"
            x2="169.794"
            y2="125.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint33_linear_2017_34449"
            x1="144"
            y1="48"
            x2="217.794"
            y2="125.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint34_linear_2017_34449"
            x1="192"
            y1="48"
            x2="265.794"
            y2="125.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint35_linear_2017_34449"
            x1="240"
            y1="48"
            x2="313.794"
            y2="125.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint36_linear_2017_34449"
            x1="288"
            y1="48"
            x2="361.794"
            y2="125.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint37_linear_2017_34449"
            x1="336"
            y1="48"
            x2="409.794"
            y2="125.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint38_linear_2017_34449"
            x1="384.001"
            y1="48"
            x2="457.795"
            y2="125.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint39_linear_2017_34449"
            x1="432"
            y1="48"
            x2="505.794"
            y2="125.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint40_linear_2017_34449"
            x1="480"
            y1="48"
            x2="553.794"
            y2="125.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint41_linear_2017_34449"
            x1="528"
            y1="48"
            x2="601.794"
            y2="125.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint42_linear_2017_34449"
            x1="576"
            y1="48"
            x2="649.794"
            y2="125.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint43_linear_2017_34449"
            x1="624"
            y1="48"
            x2="697.794"
            y2="125.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint44_linear_2017_34449"
            x1="672"
            y1="48"
            x2="745.794"
            y2="125.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint45_linear_2017_34449"
            x1="0"
            y1="72"
            x2="73.7943"
            y2="149.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint46_linear_2017_34449"
            x1="48"
            y1="72"
            x2="121.794"
            y2="149.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint47_linear_2017_34449"
            x1="96"
            y1="72"
            x2="169.794"
            y2="149.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint48_linear_2017_34449"
            x1="144"
            y1="72"
            x2="217.794"
            y2="149.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint49_linear_2017_34449"
            x1="192"
            y1="72"
            x2="265.794"
            y2="149.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint50_linear_2017_34449"
            x1="240"
            y1="72"
            x2="313.794"
            y2="149.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint51_linear_2017_34449"
            x1="288"
            y1="72"
            x2="361.794"
            y2="149.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint52_linear_2017_34449"
            x1="336"
            y1="72"
            x2="409.794"
            y2="149.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint53_linear_2017_34449"
            x1="384.001"
            y1="72"
            x2="457.795"
            y2="149.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint54_linear_2017_34449"
            x1="432"
            y1="72"
            x2="505.794"
            y2="149.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint55_linear_2017_34449"
            x1="480"
            y1="72"
            x2="553.794"
            y2="149.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint56_linear_2017_34449"
            x1="528"
            y1="72"
            x2="601.794"
            y2="149.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint57_linear_2017_34449"
            x1="576"
            y1="72"
            x2="649.794"
            y2="149.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint58_linear_2017_34449"
            x1="624"
            y1="72"
            x2="697.794"
            y2="149.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient
            id="paint59_linear_2017_34449"
            x1="672"
            y1="72"
            x2="745.794"
            y2="149.823"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="#8581FF" stopOpacity="0.64" />
          </linearGradient>
        </defs>
      </svg>
    ),
  ),
);

GlitchbombCover.displayName = "GlitchbombCover";
