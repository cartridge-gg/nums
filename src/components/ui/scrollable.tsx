import { ScrollArea } from "@chakra-ui/react";
import { ReactNode } from "react";

export const Scrollable = ({
  maxH,
  children,
}: {
  maxH?: string;
  children: ReactNode;
}) => {
  return (
    <ScrollArea.Root overflow="visible" maxH={maxH} w="full">
      <ScrollArea.Viewport>
        <ScrollArea.Content
        //  paddingStart="6" paddingEnd="6"
        >
          {children}
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar right="-10px !important">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
};
