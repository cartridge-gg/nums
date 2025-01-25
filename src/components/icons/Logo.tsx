import { Icon, IconProps } from "@chakra-ui/react";

export const LogoIcon = ({ props }: { props?: IconProps }) => {
  return (
    <Icon boxSize="60px 68px" viewBox="0 0 60 68" {...props}>
      <>
        <g filter="url(#filter0_d_65_3211)">
          <path
            d="M24.4635 46.2411C24.4631 46.2403 24.4627 46.2394 24.4624 46.2386L24.4558 46.2385C24.4583 46.2394 24.4609 46.2402 24.4635 46.2411Z"
            fill="currentColor"
          />
          <path
            d="M39.1459 46.7427C39.2303 46.0018 39.3958 45.3225 39.7139 44.8572C39.9199 44.556 40.1608 44.2468 40.4169 43.918C41.7955 42.1486 43.6146 39.8138 42.7961 35.1121C42.2199 31.7998 41.8206 29.5593 41.1536 28.2851C40.7008 27.421 40.1278 26.9621 39.3374 26.8632C39.3374 26.8616 39.3374 26.8584 39.3358 26.8568C38.9998 26.8292 38.4577 26.8584 37.9108 26.9978C37.4109 27.1259 36.9061 27.3447 36.562 27.7193C36.1855 28.1294 36.0297 28.7277 36.2861 29.5821C36.489 30.2857 36.7357 30.9407 36.9792 31.5811C37.0379 31.7348 37.0968 31.8875 37.1554 32.0396C37.4889 32.9046 37.8144 33.749 38.0601 34.6355C38.3636 35.7315 38.5438 36.8923 38.4545 38.2347C38.4513 38.3109 38.388 38.3693 38.3117 38.366C38.2354 38.3628 38.177 38.2996 38.1802 38.2234C38.1948 36.9231 37.9579 35.8142 37.6105 34.7717C37.3581 34.014 37.0448 33.2924 36.7264 32.5591C36.619 32.3118 36.511 32.0632 36.4046 31.8113C36.1303 31.1628 35.8706 30.4916 35.6451 29.7734C35.2945 28.6191 35.5542 27.8149 36.0638 27.2621C36.4939 26.7952 37.122 26.5082 37.7469 26.3526C38.2971 26.2164 38.8424 26.1807 39.2368 26.1985C39.0177 24.7427 38.5503 21.8323 37.9936 19.4799C37.6511 18.037 37.2681 16.8 36.8948 16.2066C36.1985 15.1025 34.8741 14.8318 33.7834 15.0912C33.0352 15.2679 32.4103 15.6975 32.1523 16.2406C31.8829 16.8064 31.8066 17.9964 31.8553 19.4669C31.9097 21.1232 32.1086 23.1507 32.2902 25.0023C32.3306 25.4144 32.3702 25.8177 32.4071 26.2063C31.9526 24.6418 31.3586 22.7368 30.7208 21.0864C30.1202 19.53 29.4743 18.1989 28.8819 17.5618C27.9015 16.5063 26.5334 16.6133 25.5271 17.2408C24.8584 17.659 24.3585 18.3059 24.2335 18.9723C24.1166 19.59 24.313 20.7135 24.6798 22.0283C25.2173 23.9499 26.1056 26.3065 26.7552 28.0299C26.7902 28.1227 26.8245 28.2136 26.8579 28.3025C26.5171 27.9555 26.1227 27.607 25.6942 27.3249C24.7155 26.6796 23.5761 26.3943 22.505 27.1384C20.4843 28.5408 20.6271 30.2642 20.7943 30.9711C20.7894 30.9727 20.7845 30.9743 20.778 30.9775C20.9468 31.532 22.1706 33.7159 23.5826 35.2545C24.0858 35.8025 24.6133 36.2694 25.131 36.5402C25.5206 36.7445 25.9004 36.8385 26.2542 36.725C27.1079 36.4591 27.5769 36.0717 27.796 35.6275C28.1125 34.987 27.9145 34.2623 27.6808 33.7419C27.5282 33.4015 27.077 32.9281 26.5706 32.4563C25.6374 31.5889 24.511 30.7426 24.511 30.7426C24.4493 30.6988 24.4347 30.6129 24.4785 30.5513C24.5224 30.4897 24.6084 30.4751 24.6701 30.5189C24.6701 30.5189 26.1519 31.5257 27.1793 32.4579C27.6143 32.8535 27.9648 33.2409 28.1125 33.536C28.429 34.1683 28.6709 35.06 28.3089 35.8674C28.0557 36.43 27.5055 36.9617 26.4522 37.3281C26.3272 37.3703 26.2006 37.3978 26.0707 37.4092C26.2687 37.6621 26.582 38.1695 26.5577 38.8213C26.5398 39.2882 26.2509 40.0972 25.7218 40.6695C25.1797 41.2434 24.4591 41.3375 23.7011 41.1429C23.013 40.9678 22.294 40.5414 21.6691 40.0874C21.2666 39.7956 20.903 39.4908 20.6141 39.2379C20.7326 39.9642 20.9322 40.9402 21.2503 41.887C21.6821 43.1759 22.3426 44.4016 23.2791 44.9496C23.3846 45.0112 23.482 45.0744 23.5745 45.1425C24.2464 45.5105 25.2235 45.8153 26.3353 46.0391C26.9926 46.1704 27.697 46.2693 28.4176 46.3374C29.4677 46.4363 30.5519 46.4654 31.5777 46.3665C32.3096 46.2968 33.0092 46.1704 33.6438 45.9677C33.7152 45.9418 33.7931 45.9791 33.8191 46.0504C33.845 46.1217 33.8077 46.1996 33.7363 46.2255C32.644 46.6681 31.3407 46.908 30.0049 46.9761C29.4596 47.0037 28.9094 47.0053 28.3673 46.9745C27.6175 46.9324 26.8822 46.8351 26.1989 46.7021C25.5691 46.5779 24.9826 46.4216 24.4635 46.2411C24.8744 47.2103 24.7477 48.5082 24.4396 50.2171C24.4169 50.3484 24.4753 50.4797 24.5873 50.5494C25.1061 50.872 25.6775 51.1339 26.2982 51.3387V51.34C27.1195 51.6131 28.026 51.7859 29.0105 51.8658C32.5081 52.1495 34.3491 52.1111 39.4958 50.4574L39.4937 50.4574C39.8117 50.3383 39.8017 50.1001 39.6527 49.9016C39.6006 49.8322 39.5388 49.7774 39.4761 49.7218C39.3596 49.6185 39.2404 49.3936 39.1758 49.187C38.9299 48.401 39.0542 47.5422 39.1459 46.7427Z"
            fill="currentColor"
          />
          <path
            d="M20.1834 31.2447C20.1842 31.2443 20.1849 31.244 20.1857 31.2436L20.1824 31.242C20.1827 31.2429 20.1831 31.2438 20.1834 31.2447Z"
            fill="currentColor"
          />
          <path
            d="M20.1834 31.2447C19.835 31.4213 19.4367 31.6642 19.0787 31.9812C18.4555 32.5308 17.9589 33.2961 18.0027 34.3029C18.0903 36.3635 19.9584 37.8583 20.4746 38.2328C20.4746 38.236 20.475 38.2397 20.4754 38.2433C20.4758 38.247 20.4762 38.2506 20.4762 38.2539C20.5348 38.3031 20.6076 38.3661 20.6928 38.4398C21.0203 38.7233 21.53 39.1644 22.1122 39.5801C22.4985 39.8557 22.9172 40.1183 23.3376 40.3129C23.7011 40.4798 24.0615 40.5998 24.4055 40.6128C24.7447 40.6258 25.0661 40.5431 25.3372 40.2885C25.803 39.8573 26.0983 39.1683 26.1438 38.7905C26.2341 38.0427 25.8708 37.6088 25.7414 37.4542C25.7243 37.4338 25.7113 37.4183 25.704 37.4076C25.5352 37.3897 25.3647 37.3492 25.1911 37.2876C24.7139 37.119 24.2205 36.7915 23.7384 36.3602C22.6851 35.4183 21.6805 33.9867 21.002 32.847C20.591 32.1551 20.3025 31.5647 20.1834 31.2447Z"
            fill="currentColor"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_65_3211"
            x="18"
            y="15"
            width="27"
            height="39"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_65_3211"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_65_3211"
              result="shape"
            />
          </filter>
        </defs>
      </>
    </Icon>
  );
};
