import { CloseIcon } from "./icons/Close";
import { Button } from "./ui/button";
import { useEffect } from "react";
import { useModal } from "@/context/modal";
import { Games } from "./games";

export type InventoryProps = {}

export const Inventory = () => {
  const { isInventoryClosing, closeInventory, finalizeCloseInventory } = useModal();

  useEffect(() => {
    if (isInventoryClosing) {
      const timeoutId = setTimeout(() => {
        finalizeCloseInventory();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [isInventoryClosing, finalizeCloseInventory]);

  return (
    <div 
      className="w-full h-full select-none"
      style={{
        transform: isInventoryClosing ? 'scaleY(0.005) scaleX(0)' : 'scaleY(1) scaleX(1)',
        animation: isInventoryClosing 
          ? 'unfoldOut 1s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards'
          : 'unfoldIn 1s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="relative w-full h-full rounded-2xl bg-black-300 border-[2px] border-black-300 backdrop-blur-[4px] p-6"
        style={{
          boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
          transform: isInventoryClosing ? 'scale(0)' : 'scale(1)',
          animation: isInventoryClosing
            ? 'zoomOut 0.5s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards'
            : 'zoomIn 0.5s 0.8s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards both'
        }}
      >
        <Close close={closeInventory} />
        <div className="max-w-[784px] mx-auto py-[120px] flex flex-col gap-6 h-full overflow-hidden">
          <div className="flex flex-col items-start gap-6">
            <Header />
            <Purchases />
          </div>
          <Games />
        </div>
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

export const Header = () => {
  return (
    <div className="flex flex-col items-start gap-2">
      <h1 className="text-[68px] leading-[42px] uppercase translate-y-0.5" style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.25)' }}>Enter Jackpot #8</h1>
      <p className="text-lg leading-[12px] tracking-wider text-white-400 translate-y-0.5" style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.25)' }}>Tournament ends in: 02:20:14</p>
    </div>
  )
}

export const Purchases = () => {
  return (
    <ul className="flex justify-between gap-6 w-full">
      <PurchaseMethod title="Share on X" buttonText="Free!" />
      <PurchaseMethod title="Play with Nums" buttonText={`${'2000'.toLocaleString()} NUMS`} />
      <PurchaseMethod title="Play with USD" buttonText={`$${'1.13'.toLocaleString()}`} />
    </ul>
  )
}

export const PurchaseMethod = ({ title, buttonText }: { title: string, buttonText: string }) => {
  return (
    <div className="grow rounded-lg bg-white-900 border border-white-900 p-3 flex flex-col gap-4">
      <h3 className="font-ppneuebit text-2xl h-5">{title}</h3>
      <Button variant="default" className="w-full h-10">
        <p className="text-[28px] translate-y-0.5" style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.24)' }}>{buttonText}</p>
      </Button>
    </div>
  )
}
