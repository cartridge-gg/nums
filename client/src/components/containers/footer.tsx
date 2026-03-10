export const Footer = () => {
  return (
    <footer className="w-full border-t border-[rgba(0,0,0,0.24)] bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_0%,rgba(0,0,0,0.24)_100%)]">
      <div className="max-w-[720px] mx-auto px-4 py-8 md:px-8 flex flex-col gap-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-sans text-sm">
          <a href="/support" className="text-white/60 hover:text-white">
            Support
          </a>
          <a
            href="https://cartridge.gg/legal/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white"
          >
            Privacy Policy
          </a>
          <a
            href="https://cartridge.gg/legal/terms-of-service/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white"
          >
            Terms of Service
          </a>
          <a
            href="https://cartridge.gg/legal/responsible-gaming-policy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white"
          >
            Responsible Gaming Policy
          </a>
        </div>

        <div className="font-sans text-xs text-white/40 flex flex-col gap-4 leading-relaxed">
          <p>
            Skill-based real money gaming is for users aged 18+. Internet
            gambling may be illegal in the jurisdiction in which you are located;
            if so you are not authorized to use your payment card to complete
            this transaction. It is your responsibility to know and follow
            applicable laws. Triumph believes in responsible gaming. You should
            only play with what you can afford and always set reasonable limits
            for yourself. If, for any reason, you feel like you need help, we
            strongly encourage you to contact your local responsible gaming
            organization, a list of which can be found in our{" "}
            <a
              href="https://cartridge.gg/legal/responsible-gaming-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white underline"
            >
              Responsible Gaming Policy
            </a>
            .
          </p>

          <p>
            Copyright 2026 Cartridge Gaming Company. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
