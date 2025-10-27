import { CloseIcon } from "./icons/Close";
import { Button } from "./ui/button";
import { useState } from "react";

export type InventoryProps = {
  close: () => void;
}

export const Inventory = ({ close }: InventoryProps) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      close();
    }, 300);
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{
        transform: isClosing ? 'scaleY(0.005) scaleX(0)' : 'scaleY(1) scaleX(1)',
        animation: isClosing 
          ? 'unfoldOut 1s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards'
          : 'unfoldIn 1s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards'
      }}
    >
      <div 
        className="relative w-full h-full rounded-2xl bg-black-300 border-[2px] border-black-300 backdrop-blur-[4px] p-6"
        style={{
          boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
          transform: isClosing ? 'scale(0)' : 'scale(1)',
          animation: isClosing
            ? 'zoomOut 0.5s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards'
            : 'zoomIn 0.5s 0.8s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards both'
        }}
      >
        <Close close={handleClose} />
        <h1>Inventory</h1>
      </div>
    </div>
  )
}

export const Close = ({ close }: { close: () => void }) => {
  return (
    <Button variant="ghost" className="h-12 w-14 absolute top-6 right-6 [&_svg]:size-8 bg-white-900 hover:bg-white-800 rounded-lg" onClick={close}>
      <CloseIcon />
    </Button>
  )
}
