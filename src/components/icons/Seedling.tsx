import { Icon, IconProps } from "@chakra-ui/react";

export const SeedlingIcon = ({ props }: { props?: IconProps }) => {
  return (
    <Icon boxSize="24px" {...props}>
      <svg
        viewBox="0 0 24 24"
        filter="drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.25))"
      >
        <g fill="currentColor">
          <path d="M20 5C20 8.55 17.3562 11.4844 13.9312 11.9375C13.7094 10.2688 12.975 8.7625 11.8906 7.58437C13.0875 5.44687 15.375 4 18 4H19C19.5531 4 20 4.44687 20 5ZM4 7C4 6.44688 4.44687 6 5 6H6C9.86562 6 13 9.13438 13 13V14V19C13 19.5531 12.5531 20 12 20C11.4469 20 11 19.5531 11 19V14C7.13438 14 4 10.8656 4 7Z" />
        </g>
      </svg>
    </Icon>
  );
};
