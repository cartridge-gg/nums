import { Icon, IconProps } from "@chakra-ui/react";

export const CloseIcon = ({ props }: { props?: IconProps }) => {
  return (
    <Icon boxSize="24px" pointerEvents="none" {...props}>
      <svg viewBox="0 0 24 24">
        <path
          d="M18.6558 17.2123C19.0657 17.6212 19.0657 18.2845 18.6558 18.6934C18.2458 19.1022 17.5807 19.1022 17.1707 18.6934L12.0007 13.4989L6.79392 18.6916C6.38399 19.1004 5.71888 19.1004 5.3089 18.6916C4.89892 18.2828 4.89896 17.6195 5.3089 17.2106L10.5174 12.0196L5.30745 6.78765C4.89752 6.37882 4.89752 5.71551 5.30745 5.30664C5.71739 4.89777 6.3825 4.89781 6.79248 5.30664L12.0007 10.5404L17.2075 5.34766C17.6174 4.93883 18.2826 4.93883 18.6925 5.34766C19.1025 5.75648 19.1025 6.4198 18.6925 6.82867L13.484 12.0196L18.6558 17.2123Z"
          fill="white"
        />
      </svg>
    </Icon>
  );
};
