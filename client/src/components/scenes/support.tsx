export const SupportScene = () => {
  return (
    <div className="select-text flex flex-col gap-8 w-full max-w-[720px]">
      <div className="flex flex-col gap-2">
        <h1 className="font-secondary text-base md:text-6xl text-white">
          Support
        </h1>
        <p className="font-sans text-base text-white/60">
          Need help with Nums? We're here for you.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <Section title="How to Play">
          <p>
            You receive 18 numbers (1–999) one at a time. Place each into one of
            18 slots in ascending order—equal numbers may be placed
            consecutively. Once placed, a number cannot be moved. Fill all 18
            slots for a perfect game.
          </p>
          <p>
            Use power-ups like Reroll, Double Up, Halve, Boost High, Boost Low,
            Mirror, and Swap to gain a strategic edge. Traps are visible from
            the start—plan your placements to trigger or avoid them.
          </p>
        </Section>

        <Section title="Practice Mode">
          <p>
            Jump into practice mode from the home screen to test strategies with
            zero cost. Practice is completely off-chain—no gas, no transactions,
            no tokens. Play as many times as you want.
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
                className="text-primary-100 hover:text-primary-300 underline"
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
                className="text-primary-100 hover:text-primary-300 underline"
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
                className="text-primary-100 hover:text-primary-300 underline"
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
              className="text-primary-100 hover:text-primary-300 underline"
            >
              support@cartridge.gg
            </a>{" "}
            with the subject line "Account Deletion Request" your account
            username.
          </p>
        </Section>

        <Section title="Privacy Policy">
          <p>
            View our full privacy policy at{" "}
            <a
              href="https://cartridge.gg/legal/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-100 hover:text-primary-300 underline"
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
