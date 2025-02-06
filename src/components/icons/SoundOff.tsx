import { Icon, IconProps } from "@chakra-ui/react";

export const SoundOffIcon = ({ props }: { props?: IconProps }) => {
  return (
    <Icon boxSize="32px" {...props}>
      <svg
        viewBox="0 0 24 24"
        filter="drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.25))"
      >
        <path
          d="M16.3639 5.96665C16.6833 6.11109 16.8889 6.42776 16.8889 6.77776V17.4444C16.8889 17.7944 16.6833 18.1111 16.3639 18.2555C16.0444 18.4 15.6694 18.3417 15.4083 18.1083L11.6611 14.7778H9.77778C8.79722 14.7778 8 13.9805 8 13V11.2222C8 10.2417 8.79722 9.44443 9.77778 9.44443H11.6611L15.4083 6.11387C15.6694 5.88054 16.0444 5.82498 16.3639 5.96665Z"
          fill="currentColor"
        />
      </svg>
    </Icon>
  );
};
