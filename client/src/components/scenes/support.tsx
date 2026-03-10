export const SupportScene = () => {
  return (
    <div className="select-none flex flex-col gap-8 w-full max-w-[720px]">
      <div className="flex flex-col gap-2">
        <h1 className="font-ppneuebit text-5xl md:text-6xl text-white">
          Support
        </h1>
        <p className="font-sans text-base text-white/60">
          Need help with Nums? We're here for you.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <Section title="How to Play">
          <p>
            You receive 20 numbers (1–1000) one at a time. Place each into one
            of 20 slots in strict ascending order. Once placed, a number cannot
            be moved. Fill all 20 slots for a perfect game.
          </p>
          <p>
            Use power-ups like Reroll, Mirror, Swap, High, Low, Double Up, and
            Halve to gain a strategic edge. Watch out for hidden traps.
          </p>
        </Section>

        <Section title="Account & Wallet">
          <p>
            Nums uses Cartridge Controller — a passkey-based wallet with no seed
            phrases. Your account is created automatically when you first
            connect. Session keys eliminate transaction popups during gameplay.
          </p>
        </Section>

        <Section title="Rewards & Tokens">
          <p>
            Rewards scale with how many slots you fill. Entry fees are burned
            from the NUMS supply, and rewards are minted directly to players.
            There is no platform take — 0% house edge.
          </p>
        </Section>

        <Section title="Practice Mode">
          <p>
            Jump into practice mode from the home screen to test strategies with
            zero cost. Practice uses live on-chain data for realistic simulation.
          </p>
        </Section>

        <Section title="Contact Us">
          <p>
            For bugs, account issues, or general questions, reach out to the
            Cartridge team:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Email:{" "}
              <a
                href="mailto:support@cartridge.gg"
                className="text-mauve-100 hover:text-mauve-300 underline"
              >
                support@cartridge.gg
              </a>
            </li>
            <li>
              Discord:{" "}
              <a
                href="https://discord.gg/cartridge"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mauve-100 hover:text-mauve-300 underline"
              >
                discord.gg/cartridge
              </a>
            </li>
            <li>
              X:{" "}
              <a
                href="https://x.com/numsgg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mauve-100 hover:text-mauve-300 underline"
              >
                @numsgg
              </a>
            </li>
          </ul>
        </Section>

        <Section title="Account Deletion">
          <p>
            To request deletion of your account and associated data, email{" "}
            <a
              href="mailto:support@cartridge.gg"
              className="text-mauve-100 hover:text-mauve-300 underline"
            >
              support@cartridge.gg
            </a>{" "}
            with the subject line "Account Deletion Request" and your wallet
            address.
          </p>
        </Section>

        <Section title="Privacy Policy">
          <p>
            View our full privacy policy at{" "}
            <a
              href="https://cartridge.gg/legal/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-mauve-100 hover:text-mauve-300 underline"
            >
              cartridge.gg/legal/privacy-policy
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-sans text-lg font-semibold text-white">{title}</h2>
      <div className="font-sans text-[15px] text-white/80 flex flex-col gap-3 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
