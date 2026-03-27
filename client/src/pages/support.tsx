import { SupportScene } from "@/components/scenes/support";
import { LogoIcon } from "@/components/icons/exotics";
import { Footer } from "@/components/containers/footer";

export const Support = () => {
  return (
    <div className="relative min-h-screen flex flex-col bg-secondary-100 overflow-auto">
      <img
        src="/assets/tunnel-background.svg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-0"
        aria-hidden="true"
      />

      <header className="relative z-10 w-full min-h-16 md:min-h-24 px-3 md:px-8 flex items-center border-b border-[rgba(0,0,0,0.24)] bg-[linear-gradient(0deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.16)_100%)]">
        <a
          href="/"
          className="flex items-center gap-2 cursor-pointer select-none [&_svg]:size-10 md:[&_svg]:size-12"
        >
          <LogoIcon
            className="drop-shadow-[2px_2px_0px_rgba(0,0,0,0.25)] text-white"
            aria-hidden="true"
          />
          <span
            className="text-[64px] leading-[48px] uppercase text-white translate-y-1 hidden md:block"
            style={{ textShadow: "3px 3px 0px rgba(0, 0, 0, 0.25)" }}
          >
            NUMS.GG
          </span>
        </a>
      </header>

      <main
        className="relative z-10 flex-1 flex justify-center px-4 py-8 md:px-8 md:py-16"
        style={{
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.32) 0%, rgba(0, 0, 0, 0.12) 100%)",
        }}
      >
        <SupportScene />
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};
