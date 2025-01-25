import { Icon, IconProps } from "@chakra-ui/react";

export const CaretIcon = ({ props }: { props?: IconProps }) => {
  return (
    <Icon boxSize="24px" {...props}>
      <svg
        viewBox="0 0 24 24"
        filter="drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.25))"
      >
        <g fill="currentColor">
          <path d="M16 10.4L12 14.4L8 10.4L8 9.59998L16 9.59998V10.4Z" />
        </g>
      </svg>
    </Icon>
  );
};
