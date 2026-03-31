import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";

export interface TosProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tosVariants> {
  onAccept: () => void;
}

const tosVariants = cva(
  "select-none relative flex flex-col p-6 md:p-12 gap-6 md:gap-10 w-full md:h-[60vh] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "rounded-2xl md:rounded-3xl bg-black-200 border-2 border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[4px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Tos = ({ onAccept, variant, className, ...props }: TosProps) => {
  return (
    <div className={cn(tosVariants({ variant, className }))} {...props}>
      <h2
        className="text-[36px]/6 md:text-[48px]/[33px] uppercase tracking-wider translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        Terms of Service
      </h2>

      <div
        className="flex flex-col gap-2.5 overflow-y-auto font-sans text-base/5 text-white-100"
        style={{ scrollbarWidth: "none" }}
      >
        <p>
          These Terms of Service (the "Terms") form a binding agreement between
          you and Cartridge Gaming Company ("Cartridge," "we," "us," or "our")
          and govern your access to and use of the NUMS game, any related
          website, hosted interface, application, documentation, smart
          contracts, reward or referral feature, staking or governance
          interface, community channel, and related product or service we make
          available (collectively, the "Services").
        </p>
        <p>
          BY ACCEPTING THESE TERMS, ACCESSING THE SERVICES, CONNECTING A WALLET
          OR CARTRIDGE CONTROLLER, OR OTHERWISE USING THE SERVICES, YOU AGREE TO
          BE BOUND BY THESE TERMS.
        </p>
        <p>
          IMPORTANT NOTICE: THESE TERMS CONTAIN A BINDING ARBITRATION AGREEMENT,
          CLASS ACTION WAIVER, AND JURY TRIAL WAIVER IN SECTION 18. EXCEPT AS
          EXPRESSLY PROVIDED BELOW, YOU AND CARTRIDGE AGREE TO RESOLVE DISPUTES
          THROUGH INDIVIDUAL ARBITRATION AND NOT IN COURT.
        </p>
        <p>
          <strong>1. Acceptance; Scope; Defined Terms</strong>
        </p>
        <p>
          <span className="underline">1.1 Acceptance of the Terms.</span> You
          accept these Terms by clicking to accept them, accessing or using the
          Services, connecting a wallet or Cartridge Controller, participating
          in gameplay, claiming rewards, or otherwise interacting with any
          Hosted Services or Protocol Components. If you do not agree to these
          Terms, do not access or use the Services.
        </p>
        <p>
          <span className="underline">1.2 Scope of the Services.</span> The
          Services may include, without limitation:
        </p>
        <p>
          1.2.1 websites, web apps, user interfaces, practice mode,
          customer-support channels, documentation, and community spaces that
          Cartridge hosts or controls (collectively, the "Hosted Services");
        </p>
        <p>
          1.2.2 access to or facilitation with public smart contracts, onchain
          game logic, governance contracts, staking contracts, token contracts,
          and related open-source software that may be deployed to or operate
          through public blockchain networks (collectively, the "Protocol
          Components"); and
        </p>
        <p>
          1.2.3 related rewards, referrals, airdrops, promotions, documentation,
          or informational materials that Cartridge may make available from time
          to time.
        </p>
        <p>
          <span className="underline">1.3 Documentation.</span> "Documentation"
          means the then-current gameplay documentation, FAQs, help materials,
          interface disclosures, promotion terms, and similar materials
          Cartridge or the relevant Protocol Components make available regarding
          the operation of the Services.
        </p>
        <p>
          <span className="underline">1.4 Separate Components.</span> The
          Services include both Hosted Services and Protocol Components. Hosted
          Services are controlled by Cartridge. Protocol Components may operate
          on permissionless public blockchain infrastructure and may remain
          accessible through third parties even if Cartridge modifies, suspends,
          or discontinues its Hosted Services.
        </p>
        <p>
          <span className="underline">1.5 Additional Terms.</span> Certain
          features may be subject to additional terms, notices, or eligibility
          requirements, including terms for specific promotions, referrals,
          airdrops, community spaces, support programs, or other limited
          releases. If there is a direct conflict between these Terms and
          additional written terms for a specific feature, the additional terms
          will control solely for that feature.
        </p>
        <p>
          <strong>
            2. Eligibility; Legal Compliance; Geographic Restrictions
          </strong>
        </p>
        <p>
          <span className="underline">2.1 Minimum Age and Capacity.</span> You
          represent and warrant that you are at least 18 years old or the age of
          legal majority where you reside, whichever is greater, and that you
          have the legal capacity to enter into these Terms.
        </p>
        <p>
          <span className="underline">2.2 Compliance With Law.</span> You may
          use the Services only in compliance with applicable law. You are
          solely responsible for determining whether your access to or use of
          the Services is lawful in your jurisdiction, including with respect to
          digital assets, gameplay with paid entry, rewards, referrals, staking,
          governance participation, promotions, sanctions, tax rules, consumer
          laws, and local licensing or registration requirements.
        </p>
        <p>
          <span className="underline">
            2.3 Restricted Persons and Jurisdictions.
          </span>{" "}
          You represent and warrant that you are not:
        </p>
        <p>
          2.3.1 located in, ordinarily resident in, organized in, or acting on
          behalf of any jurisdiction where access to or use of the Services
          would violate applicable law;
        </p>
        <p>
          2.3.2 the subject of sanctions administered or enforced by the United
          States, the United Nations, the European Union, the United Kingdom, or
          any other relevant governmental authority; or
        </p>
        <p>
          2.3.3 otherwise prohibited from accessing or using the Services under
          applicable law.
        </p>
        <p>
          <span className="underline">2.4 Entity Use.</span> If you access or
          use the Services on behalf of a company or other legal entity, you
          represent and warrant that you have authority to bind that entity to
          these Terms, and "you" includes both you and that entity.
        </p>
        <p>
          <span className="underline">
            2.5 Screening and Compliance Requests.
          </span>{" "}
          Cartridge may, at any time and in its sole discretion, require
          information, certifications, or documentation to verify identity,
          authority, eligibility, source of funds, sanctions status, anti-abuse
          compliance, or other facts relevant to use of the Services. Cartridge
          may refuse, suspend, or terminate access to the Services if you do not
          promptly provide requested information or if Cartridge reasonably
          believes additional review is necessary.
        </p>
        <p>
          <strong>3. Documentation; Operational Rules; Onchain Control</strong>
        </p>
        <p>
          <span className="underline">
            3.1 Gameplay and Operational Terms Live in the Documentation.
          </span>{" "}
          The gameplay rules, mechanics, entry bundles, reward logic, claim
          windows, referral mechanics, airdrop criteria, governance parameters,
          staking mechanics, tokenomics, and similar operational details of the
          Services are described in the then-current Documentation and/or
          applicable Protocol Components, and may be updated from time to time.
        </p>
        <p>
          <span className="underline">3.2 Documentation May Change.</span>{" "}
          Cartridge may revise the Documentation to reflect upgrades,
          governance-approved changes, security responses, bug fixes, legal
          requirements, market or protocol conditions, or clarifications. Unless
          Cartridge expressly states otherwise, updates to the Documentation do
          not amend these Terms.
        </p>
        <p>
          <span className="underline">
            3.3 Protocol Components and Onchain Records.
          </span>{" "}
          To the fullest extent permitted by law, the applicable smart-contract
          logic and authoritative onchain record control with respect to onchain
          state, token balances, transaction status, claim status, governance
          execution, and similar blockchain outcomes. Hosted Services may
          present data for convenience only and may lag, omit, or misstate
          onchain information.
        </p>
        <p>
          <span className="underline">
            3.4 Practice Mode; Testnet; Beta; Experimental Features.
          </span>{" "}
          Practice mode, testnet, preview, beta, or experimental features may be
          offchain, simulated, incomplete, time-limited, inaccurate, unavailable
          in certain jurisdictions, or different from live mainnet
          functionality. Cartridge may modify, suspend, or remove such features
          at any time without notice or liability.
        </p>
        <p>
          <span className="underline">
            3.5 No Reliance on Roadmaps or Informal Communications.
          </span>{" "}
          Except as expressly stated in these Terms or the then-current
          Documentation for live functionality, roadmaps, blog posts,
          social-media posts, livestreams, community messages, AMAs, and similar
          forward-looking or promotional statements are provided for
          informational purposes only and do not create a contractual commitment
          by Cartridge to deliver any feature, maintain any economic parameter,
          support any token market, or complete any governance or
          decentralization transition.
        </p>
        <p>
          <strong>4. Open-Source Software; MIT License; Brand Assets</strong>
        </p>
        <p>
          <span className="underline">4.1 Open-Source Code.</span> To the extent
          Cartridge releases software or smart-contract code as open source,
          that code is licensed under the applicable open-source license for
          that code, including the MIT License where designated.
        </p>
        <p>
          <span className="underline">
            4.2 Open-Source Licenses Control Your Code Rights.
          </span>{" "}
          To the extent there is any conflict between these Terms and an
          applicable open-source license with respect to code distributed under
          that open-source license, the open-source license controls your rights
          in that code.
        </p>
        <p>
          <span className="underline">
            4.3 Hosted Services and Non-Code Assets.
          </span>{" "}
          These Terms continue to govern your use of the Hosted Services,
          documentation, websites, interfaces, audiovisual materials, data
          compilations, and other non-code materials Cartridge provides, even if
          related Protocol Components are open source.
        </p>
        <p>
          <span className="underline">4.4 No Trademark License.</span> Except as
          expressly permitted in these Terms or in writing by Cartridge, you may
          not use Cartridge’s or NUMS’s names, logos, trade dress, marks, or
          other brand assets. No open-source license grants you any right to use
          Cartridge’s or NUMS’s trademarks or branding.
        </p>
        <p>
          <span className="underline">
            4.5 Limited Social Sharing Permission.
          </span>{" "}
          Subject to these Terms, Cartridge grants you a limited, revocable,
          non-exclusive, non-transferable, non-sublicensable permission to
          capture and share screenshots, gameplay clips, livestreams, and
          factual gameplay statistics or results relating to the Services on
          social media, creator channels, streaming platforms, and community
          forums, and to display Cartridge’s or NUMS’s names and marks only as
          they naturally appear in those materials or as reasonably necessary to
          identify the game. This permission is conditioned on your sharing
          being lawful, truthful, and non-malicious; not implying sponsorship,
          endorsement, or official affiliation by Cartridge or any related
          governance body; not making false or misleading statements about the
          Services, NUMS, token value, governance rights, or legal status; and
          not using Cartridge or NUMS marks as standalone branding, in domain
          names, app names, or merchandise, or in paid advertising, spam, scams,
          or unlawful content. Any goodwill arising from permitted use inures
          solely to Cartridge. Cartridge may publish brand guidelines that
          supplement this Section, and may revoke this permission or require
          removal of any content at any time if Cartridge reasonably determines
          such content violates these Terms or is harmful to Cartridge, users,
          or the community.
        </p>
        <p>
          <span className="underline">
            4.6 Contributions to Public Repositories.
          </span>{" "}
          If Cartridge accepts community code contributions to a public
          repository, those contributions may be governed by the repository’s
          contribution guidelines, developer certificate of origin, contributor
          license agreement, and/or the repository’s applicable open-source
          license.
        </p>
        <p>
          <strong>
            5. Wallets; Controllers; Payment Paths; Transactions; Fees; Taxes
          </strong>
        </p>
        <p>
          <span className="underline">
            5.1 Compatible Wallets and Controllers.
          </span>{" "}
          Certain features require a compatible third-party wallet, Cartridge
          Controller, network connection, digital asset, or other third-party
          software or service. You are solely responsible for obtaining,
          maintaining, and securely controlling all such prerequisites.
        </p>
        <p>
          <span className="underline">5.2 Security Responsibility.</span> You
          are solely responsible for your wallet, private keys, seed phrases,
          passphrases, credentials, devices, backups, browser environment, and
          operational security. Cartridge does not control your wallet and
          cannot recover lost keys, reverse unauthorized wallet activity, or
          restore access to compromised accounts or devices.
        </p>
        <p>
          <span className="underline">
            5.3 No Custody; Distinct Payment Paths; No Fiduciary Relationship.
          </span>{" "}
          Cartridge does not custody your digital assets or payment credentials,
          hold assets on your behalf, operate an exchange for your account, or
          act as your broker, bank, escrow agent, trustee, investment adviser,
          payment processor, or fiduciary. The Services may offer different
          payment paths, and Cartridge’s role differs depending on the path
          used. Some gameplay entries may be purchased through a third-party
          fiat or card checkout made available through Stripe or another payment
          processor. Other gameplay entries may be purchased directly onchain
          using USDC or another digital asset expressly supported by the
          Services through your wallet, Cartridge Controller, and the applicable
          Protocol Components.
        </p>
        <p>
          <span className="underline">
            5.4 Card and Fiat Payments Through Stripe.
          </span>{" "}
          If Cartridge offers payment by credit card, debit card, or another
          fiat payment method through Stripe or a Stripe-powered checkout, that
          payment flow is processed by Stripe and/or its affiliates, banking
          partners, or service providers, not by Cartridge. By choosing that
          payment method, you authorize the applicable charge and agree to any
          then-current Stripe or payment-method terms, conditions,
          authorizations, and privacy disclosures presented to you or otherwise
          applicable to that payment flow. Cartridge does not control Stripe’s
          services, payment acceptance decisions, fraud screening, saved-payment
          features, chargeback handling, or other processor or network rules.
          Any referral bonus associated with a Stripe-processed purchase is a
          Cartridge-funded marketing incentive and not a pass-through, split, or
          assignment of the purchaser’s card or fiat payment.
        </p>
        <p>
          <span className="underline">
            5.5 Direct USDC and Other Onchain Payments.
          </span>{" "}
          If you purchase gameplay access directly with USDC or another digital
          asset expressly supported by the Services from your wallet or
          Cartridge Controller, that payment is an onchain transaction executed
          by the applicable Protocol Components, public blockchain
          infrastructure, and any relevant third-party smart contracts or
          protocols. It is not a Stripe transaction. Cartridge does not take
          custody of your assets, does not process card or bank credentials for
          that payment, and does not control the validator, sequencer, bridge,
          DEX, swap router, smart contract, or other third-party protocol that
          may be involved. Any referral allocation associated with a direct
          onchain purchase is determined and executed by the applicable
          smart-contract logic and onchain state and does not pass through
          Cartridge’s possession or control.
        </p>
        <p>
          <span className="underline">
            5.6 Blockchain Finality and Network Risk.
          </span>{" "}
          Direct onchain transactions may be irreversible, final, delayed,
          reordered, censored, fail to complete, settle differently than
          expected, or become more expensive than expected due to congestion,
          sequencer or validator behavior, forks, chain reorganizations, MEV,
          wallet issues, RPC issues, bridge issues, smart-contract behavior, or
          other causes outside Cartridge’s control. Certain direct onchain
          payment flows may involve multiple sequential steps across different
          networks, protocols, or third-party services, including fiat-to-crypto
          onramping, cross-chain bridging, decentralized exchange routing, or
          token swaps. Each step in a multi-step transaction introduces
          independent points of potential failure, delay, or loss, including
          slippage between steps, partial execution, funds being held in an
          intermediate state on a bridge or network, or a later step failing
          after an earlier step has already settled. Cartridge does not
          guarantee the successful completion of any multi-step onchain
          transaction and is not responsible for losses, delays, or costs
          arising from the failure of any individual step in such a flow.
        </p>
        <p>
          <span className="underline">5.7 Fees and Finality.</span> You are
          solely responsible for all gas fees, network fees, bridge fees, swap
          fees, slippage, taxes, card-network or payment-provider charges, bank
          charges, and similar costs associated with your use of the Services.
          For card or other fiat payments, additional processor, network,
          issuing-bank, or chargeback rules may apply. Except as required by
          applicable law or expressly stated otherwise in writing, all entries,
          purchases, fees, and onchain transfers are final and non-refundable.
        </p>
        <p>
          <span className="underline">5.8 Taxes.</span> You are solely
          responsible for determining, reporting, and paying any taxes, duties,
          levies, or assessments arising from your use of the Services,
          including taxes arising from purchases, rewards, referrals, airdrops,
          staking, governance participation, sales, swaps, or other
          transactions.
        </p>
        <p>
          <strong>6. Entries; Rewards; Promotions; Referrals; Airdrops</strong>
        </p>
        <p>
          <span className="underline">6.1 Entries and Gameplay Access.</span>{" "}
          The Services may offer one or more paid or unpaid methods of accessing
          gameplay, including entry bundles, promotions, or free-play
          opportunities. Eligibility, price, quantity, expiration, and related
          conditions are determined by the then-current Documentation, interface
          disclosures, promotion terms, and/or applicable Protocol Components.
          Entries, rewards, and promotional benefits may be subject to
          time-limited claim or play windows (including, without limitation,
          windows as short as twenty-four (24) hours), after which unclaimed or
          unplayed entries or benefits may expire and be forfeited without
          refund or compensation. You are responsible for reviewing the
          applicable Documentation and interface disclosures for current
          expiration and claim deadlines.
        </p>
        <p>
          <span className="underline">6.2 Rewards and Claim Conditions.</span>{" "}
          Any reward, if offered, is subject to eligibility requirements,
          technical availability, smart-contract execution, claim windows, and
          the applicable Documentation. Rewards may depend on gameplay
          performance, protocol rules, multipliers, claim timing, wallet
          compatibility, anti-abuse review, or other conditions described in the
          Documentation or Protocol Components.
        </p>
        <p>
          <span className="underline">
            6.3 Referrals, Airdrops, and Promotions.
          </span>{" "}
          Any referral program, airdrop, allowlist, promotion, campaign, or
          marketing initiative is void where prohibited and may be subject to
          additional terms, snapshot criteria, browser conditions, controller
          requirements, timing windows, anti-abuse rules, and technical
          limitations. Cartridge may modify, suspend, cancel, or terminate any
          such program at any time unless otherwise required by applicable law.
          If Cartridge offers referral bonuses in connection with
          Stripe-processed or other offchain card or fiat purchases, those
          bonuses are promotional marketing incentives funded by Cartridge and
          not pass-throughs, splits, or assignments of the purchaser’s payment.
          If gameplay entry is purchased directly onchain with USDC or another
          digital asset expressly supported by the Services, the applicable
          Protocol Components may execute a referral allocation as part of the
          onchain transaction flow; any such allocation is determined and
          executed by smart-contract logic and onchain state, may occur
          automatically without Cartridge’s further action, and does not pass
          through Cartridge’s possession or control. The referral bonus amount,
          eligibility criteria, payment method, timing, and program terms are
          determined by Cartridge and/or the applicable Protocol Components, as
          stated in the Documentation and applicable program terms, and may be
          adjusted, suspended, or discontinued at any time. Referral bonuses are
          not wages, commissions, or guaranteed income, and participation in any
          referral program does not create an employment, agency, partnership,
          or joint-venture relationship with Cartridge.
        </p>
        <p>
          <span className="underline">
            6.4 Anti-Abuse and Disqualification.
          </span>{" "}
          Cartridge may, in its sole discretion, investigate suspected abuse and
          take remedial action if Cartridge reasonably believes that you have
          engaged in self-referral, sybil activity, botting, manipulation,
          exploit use, fraudulent behavior, misrepresentation, coordinated
          abuse, ineligible participation, or any other activity intended to
          obtain an unfair advantage or circumvent the rules of the Services.
        </p>
        <p>
          <span className="underline">6.5 Remedies for Abuse or Error.</span> If
          Cartridge reasonably believes that any entry, reward, promotion,
          referral payout, governance privilege, or similar benefit was obtained
          or claimed in error, through abuse, or in violation of these Terms or
          applicable program rules, or if an associated card or fiat payment is
          declined, reversed, refunded, not finally settled, or charged back,
          Cartridge may to the extent technically feasible and legally permitted
          deny access, freeze claims, cancel or invalidate unclaimed
          entitlements, disqualify participation, remove users from Hosted
          Services, seek restitution, or take any other lawful and appropriate
          remedial action.
        </p>
        <p>
          <span className="underline">
            6.6 No Cash Value Unless Expressly Stated.
          </span>{" "}
          Unless Cartridge expressly states otherwise in writing, gameplay
          entries, in-game entitlements, promotional benefits, referral
          benefits, and unclaimed rewards do not have cash value, are not
          redeemable for fiat currency from Cartridge, and are not property
          rights against Cartridge.
        </p>
        <p>
          <span className="underline">6.7 Skill-Based Game; No Wagering.</span>{" "}
          The Services are designed and offered by Cartridge as a skill-based
          game in which gameplay outcomes are intended to depend predominantly
          on the player’s strategic decisions, including number placement,
          power-up timing, and trap management, rather than being determined
          predominantly by chance. Cartridge does not offer the Services as a
          lottery, raffle, casino game, sports bet, or other wagering product.
          Nothing in these Terms or the Documentation guarantees any particular
          outcome, reward, or return. Cartridge may limit, condition,
          geo-restrict, suspend, or decline to offer paid-entry, reward,
          referral, or other features in particular jurisdictions or to
          particular users, and nothing in these Terms or the Documentation is a
          representation that any feature is lawful or available in every
          jurisdiction. You are solely responsible for determining whether your
          participation complies with applicable law in your jurisdiction,
          including laws governing games of skill, contests, sweepstakes,
          promotions, digital assets, and gambling.
        </p>
        <p>
          <strong>7. NUMS; vNUMS; Governance; DAO Transition</strong>
        </p>
        <p>
          <span className="underline">7.1 Functional Role of NUMS.</span> NUMS
          is intended to function as a native digital asset of the Services and
          associated protocol, including as a gameplay-related reward and
          utility asset and, where implemented, a means of participating in
          protocol staking, coordination, or governance.
        </p>
        <p>
          <span className="underline">
            7.2 No Equity or Claim on Cartridge.
          </span>{" "}
          NUMS, vNUMS, or any related right, interface, or governance feature
          does not represent or provide equity, stock, partnership interest,
          membership interest, debt, note, security interest, profit-sharing
          interest, revenue share, dividend right, redemption right, right to
          repayment, right to liquidation proceeds, right to inspect Cartridge’s
          books and records, or any other ownership, creditor, or contractual
          claim against Cartridge or any of its affiliates. NUMS and vNUMS do
          not by themselves constitute or create any commodity interest, swap,
          futures contract, option, or other derivative or financial instrument
          with respect to Cartridge, the Services, or any revenue, assets, or
          obligations of Cartridge. Cartridge makes no representation regarding
          how any court, regulator, or governmental authority (including the
          U.S. Securities and Exchange Commission or the U.S. Commodity Futures
          Trading Commission) will classify or characterize NUMS, vNUMS, or any
          related feature.
        </p>
        <p>
          <span className="underline">
            7.3 No Investment, Price, or Liquidity Commitment.
          </span>{" "}
          Cartridge does not offer the Services or NUMS as an investment
          opportunity. Cartridge does not promise appreciation in value,
          liquidity, trading volume, market making, exchange listing, buybacks
          for your benefit, price support, repayment, or any financial return.
          You should not acquire, hold, or use NUMS with an expectation of
          profit based primarily on Cartridge’s future managerial or
          entrepreneurial efforts.
        </p>
        <p>
          <span className="underline">
            7.4 Governance Rights Are Limited and Protocol-Specific.
          </span>{" "}
          If governance is made available, governance rights are limited to the
          matters that the applicable Documentation or Protocol Components
          expressly make subject to governance. Holding, staking, or voting with
          NUMS or vNUMS does not give you any right to direct Cartridge’s
          corporate operations, participate in Cartridge’s corporate governance,
          compel development work, or require Cartridge to continue any feature,
          interface, roadmap, or support activity.
        </p>
        <p>
          <span className="underline">
            7.5 Progressive Decentralization and Possible DAO Transition.
          </span>{" "}
          Cartridge may support progressive decentralization of some protocol
          functions and may in the future reduce, transfer, or relinquish
          certain administrative, operational, or governance roles with respect
          to the protocol to a decentralized autonomous organization ("DAO") or
          other community-governed mechanism. Any such transition, if it occurs,
          may be partial, staged, conditional, delayed, modified, or reversed.
          Cartridge has no obligation to complete any specific decentralization
          roadmap or relinquish any specific role at any specific time.
        </p>
        <p>
          <span className="underline">
            7.6 Governance Does Not Create a Separate Relationship.
          </span>{" "}
          Governance participation, staking, delegation, proposal activity, or
          voting does not create any partnership, joint venture, agency,
          employment, fiduciary, or other special relationship between you and
          Cartridge. Any governance interface Cartridge provides may be
          informational only, and the applicable onchain execution controls to
          the fullest extent permitted by law.
        </p>
        <p>
          <span className="underline">
            7.7 No Duty to Support Secondary Markets, Forks, or Migrations.
          </span>{" "}
          Cartridge has no obligation to support any third-party trading venue,
          liquidity venue, bridge, wrapped asset, fork, migration, token merger,
          token split, or chain deployment involving NUMS, vNUMS, or any related
          asset. Cartridge may decide whether and to what extent to support any
          upgrade, migration, or network change.
        </p>
        <p>
          <span className="underline">7.8 Regulatory Uncertainty.</span> The
          legal and regulatory treatment of digital assets, onchain games,
          rewards, staking, governance rights, airdrops, referrals, and DAOs is
          evolving and may change rapidly. Cartridge may modify, restrict,
          suspend, or discontinue any feature of the Services at any time for
          legal, regulatory, compliance, risk-management, or business reasons.
          Cartridge does not represent or warrant how any court, regulator, or
          governmental authority will characterize NUMS or any related feature,
          transaction, or digital asset.
        </p>
        <p>
          <strong>8. Acceptable Use; Fair Play; Prohibited Conduct</strong>
        </p>
        <p>
          <span className="underline">8.1 General Restrictions.</span> You agree
          not to, and not to attempt to, directly or indirectly:
        </p>
        <p>
          8.1.1 violate any applicable law, regulation, sanction, court order,
          or third-party right;
        </p>
        <p>
          8.1.2 use the Services for fraud, deception, theft, money laundering,
          sanctions evasion, or any unlawful purpose;
        </p>
        <p>
          8.1.3 use bots, scripts, automation, scraping tools, or other means to
          access, monitor, or interact with the Services in a manner not
          expressly authorized by Cartridge;
        </p>
        <p>
          8.1.4 interfere with, overburden, disable, disrupt, or impair the
          Services, public blockchain networks, third-party infrastructure, or
          other users’ access;
        </p>
        <p>
          8.1.5 exploit or attempt to exploit a bug, design flaw, undocumented
          feature, economic loophole, or security vulnerability to obtain an
          unfair advantage or harm Cartridge, the protocol, or other users;
        </p>
        <p>
          8.1.6 circumvent any geoblock, sanctions control, access restriction,
          screening process, wallet restriction, or security measure;
        </p>
        <p>
          8.1.7 engage in self-referral, sybil behavior, wash activity,
          collusion, or any manipulation of referrals, airdrops, rewards,
          governance outcomes, or eligibility criteria;
        </p>
        <p>
          8.1.8 impersonate another person or entity, misrepresent your
          affiliation, or submit false information;
        </p>
        <p>
          8.1.9 infringe, misappropriate, or violate any intellectual-property,
          publicity, privacy, contractual, or other right;
        </p>
        <p>
          8.1.10 upload or transmit malicious code, malware, ransomware,
          spyware, or other harmful material; or
        </p>
        <p>
          8.1.11 use the Hosted Services in any manner not expressly permitted
          by these Terms.
        </p>
        <p>
          <span className="underline">8.2 Vulnerability Reporting.</span> If you
          discover a vulnerability or bug, Cartridge requests that you promptly
          report it to [security/contact email] and refrain from exploiting,
          publicizing, or disclosing it in a manner that could harm users or the
          Services before Cartridge has had a reasonable opportunity to address
          it.
        </p>
        <p>
          <span className="underline">8.3 Investigations and Cooperation.</span>{" "}
          Cartridge may investigate suspected violations of these Terms and may
          cooperate with law enforcement, regulators, courts, counterparties,
          wallet providers, or other third parties in connection with fraud,
          abuse, legal compliance, or security matters.
        </p>
        <p>
          <strong>9. Community Channels; User Content; Feedback</strong>
        </p>
        <p>
          <span className="underline">9.1 Community Spaces.</span> Cartridge may
          offer or moderate community channels, forums, chat rooms, social
          communities, or support spaces. Cartridge is not obligated to host,
          monitor, or moderate any such space and may remove content, mute
          users, revoke privileges, or close community spaces at any time.
        </p>
        <p>
          <span className="underline">9.2 User Content License.</span> If you
          submit, post, transmit, or otherwise make available any text, image,
          video, audio, suggestion, handle, username, or other content through
          the Hosted Services or Cartridge-operated community channels ("User
          Content"), you grant Cartridge a worldwide, non-exclusive,
          royalty-free, sublicensable license to host, reproduce, display,
          perform, distribute, adapt, publish, and otherwise use that User
          Content as reasonably necessary to operate, improve, moderate, secure,
          and promote the Services.
        </p>
        <p>
          <span className="underline">
            9.3 Your Responsibility for User Content.
          </span>{" "}
          You represent and warrant that you own or control all rights necessary
          to submit User Content and to grant the license above, and that your
          User Content does not violate these Terms or any law or third-party
          right.
        </p>
        <p>
          <span className="underline">9.4 Feedback.</span> If you provide ideas,
          suggestions, enhancement requests, bug reports, design comments, or
          other feedback regarding the Services ("Feedback"), you grant
          Cartridge a worldwide, perpetual, irrevocable, royalty-free, fully
          paid-up, sublicensable license to use, reproduce, modify, adapt,
          publish, distribute, and otherwise exploit that Feedback for any
          purpose without restriction or compensation to you.
        </p>
        <p>
          <strong>10. Ownership; Limited License; Reservation of Rights</strong>
        </p>
        <p>
          <span className="underline">10.1 Ownership.</span> Except for
          open-source code made available under applicable licenses and your own
          rights in User Content, the Hosted Services and all related content,
          software, text, graphics, designs, audiovisual materials,
          documentation, databases, and branding are owned by Cartridge or its
          licensors and are protected by intellectual-property and other laws.
        </p>
        <p>
          <span className="underline">
            10.2 Limited License to Use Hosted Services.
          </span>{" "}
          Subject to these Terms, Cartridge grants you a limited, revocable,
          non-exclusive, non-transferable, non-sublicensable license to access
          and use the Hosted Services solely for your personal or internal
          lawful use in the manner permitted by these Terms and the
          Documentation.
        </p>
        <p>
          <span className="underline">10.3 Restrictions.</span> Except as
          expressly permitted by these Terms, by applicable law, or by an
          applicable open-source license, you may not copy, modify, distribute,
          sell, lease, publicly perform, publicly display, reverse engineer, or
          create derivative works from the Hosted Services or any non-public
          portion of the Services.
        </p>
        <p>
          <span className="underline">10.4 Reservation of Rights.</span>{" "}
          Cartridge reserves all rights not expressly granted in these Terms. No
          implied license is granted under these Terms.
        </p>
        <p>
          <strong>11. Third-Party Services and Dependencies</strong>
        </p>
        <p>
          <span className="underline">11.1 Third-Party Infrastructure.</span>{" "}
          The Services may rely on or interoperate with third-party blockchains,
          wallets, controllers, DEXs, bridges, cross-chain routing protocols,
          node providers, sequencers, validators, indexers, data providers,
          hosting providers, analytics tools, social platforms, and payment
          providers. Without limiting the foregoing, Cartridge may make
          available a card or other fiat checkout through Stripe or other
          third-party payment processors, and users may separately use
          third-party onramp, bridge, swap, or routing services in connection
          with acquiring USDC or submitting direct onchain transactions. Each
          such third-party service operates independently and is subject to its
          own terms, availability, fees, risks, and limitations.
        </p>
        <p>
          <span className="underline">11.2 Separate Terms Apply.</span> Your use
          of third-party services is governed by the terms, conditions,
          authorizations, and policies of those third parties, not by Cartridge.
          Without limiting the foregoing, if you choose a credit card or other
          fiat payment option made available through Stripe or a Stripe-powered
          checkout, you also agree to any then-current Stripe or payment-method
          terms, authorizations, and privacy disclosures presented to you or
          otherwise applicable to that payment flow.
        </p>
        <p>
          <span className="underline">
            11.3 No Responsibility for Third Parties.
          </span>{" "}
          Cartridge does not own or control third-party services and is not
          responsible for their availability, legality, security, accuracy,
          fees, performance, downtime, acts, omissions, failures, declines,
          reversals, chargebacks, or policy changes. Cartridge is not liable for
          losses arising from your use of or reliance on any third-party
          service.
        </p>
        <p>
          <strong>12. Privacy; Data Use; Public Blockchain Data</strong>
        </p>
        <p>
          <span className="underline">12.1 Hosted-Service Data.</span> To the
          extent Cartridge collects personal information through Hosted
          Services, Cartridge may use that information to operate, secure,
          support, improve, and comply with law in connection with the Services,
          as further described in any privacy notice or policy Cartridge makes
          available.
        </p>
        <p>
          <span className="underline">12.2 Public Blockchain Data.</span>{" "}
          Transactions and other activity on public blockchains are inherently
          public, transparent, and, in many cases, permanent. Cartridge cannot
          control how third parties access, index, analyze, or display public
          blockchain data, and Cartridge generally cannot delete or redact
          public blockchain data once published.
        </p>
        <p>
          <span className="underline">
            12.3 Wallet Addresses and Public Identifiers.
          </span>{" "}
          Wallet addresses, Controller identifiers, ENS-style names, usernames,
          governance activity, and similar identifiers may be visible to
          Cartridge and to the public in connection with your use of the
          Services.
        </p>
        <p>
          <strong>13. Service Changes; Suspension; Termination</strong>
        </p>
        <p>
          <span className="underline">13.1 Changes to the Services.</span>{" "}
          Cartridge may add, remove, modify, suspend, or discontinue any Hosted
          Service, Documentation, promotion, interface, support channel, or
          feature at any time, with or without notice, including in response to
          legal developments, security concerns, governance decisions, technical
          issues, market conditions, or business needs.
        </p>
        <p>
          <span className="underline">
            13.2 Emergency and Compliance Actions.
          </span>{" "}
          Cartridge may, at any time and in its sole discretion, block wallets
          or controllers from Hosted Services, refuse gameplay access, deny
          claims, pause or disable front-end functionality, delist features,
          geo-restrict access, or take other protective action if Cartridge
          reasonably believes that doing so is necessary or appropriate to
          comply with law, protect users, address abuse, mitigate risk, respond
          to a security incident, or preserve the integrity of the Services.
        </p>
        <p>
          <span className="underline">
            13.3 Suspension or Termination for Cause.
          </span>{" "}
          Cartridge may suspend or terminate your access to any Hosted Service
          at any time, with or without notice, if Cartridge reasonably believes
          that:
        </p>
        <p>
          13.3.1 you have violated these Terms or any additional applicable
          terms;
        </p>
        <p>
          13.3.2 your conduct poses legal, regulatory, operational, or
          reputational risk to Cartridge, the protocol, or other users; or
        </p>
        <p>
          13.3.3 suspension or termination is necessary to prevent fraud, abuse,
          or harm.
        </p>
        <p>
          <span className="underline">
            13.4 Effect of Suspension or Termination.
          </span>{" "}
          Upon suspension or termination, your right to use the Hosted Services
          will immediately cease. Suspension or termination of Hosted Services
          does not necessarily affect the availability of public Protocol
          Components accessible through third parties. Cartridge will have no
          liability for any inability to access or use public Protocol
          Components through third parties after suspension or termination.
        </p>
        <p>
          <span className="underline">13.5 Survival.</span> Sections that by
          their nature should survive suspension or termination will survive,
          including Sections 4 (Open-Source Software), 5.2 through 5.8
          (Security; Fees; Taxes), 6.6 and 6.7 (No Cash Value; Skill-Based
          Game), 7 (NUMS; Governance), 9.2 and 9.4 (User Content License;
          Feedback), 10 (Ownership; Reservation of Rights), 14 (Assumption of
          Risk), 15 (Disclaimers), 16 (Limitation of Liability), 17
          (Indemnification, solely with respect to acts or omissions occurring
          before termination), 18 (Dispute Resolution), 19 (Governing Law;
          Venue), and 21 (Miscellaneous).
        </p>
        <p>
          <strong>14. Assumption of Risk</strong>
        </p>
        <p>
          <span className="underline">
            14.1 Technical and Blockchain Risks.
          </span>{" "}
          You understand and accept the risks inherent in onchain software,
          open-source code, digital assets, and public blockchain networks,
          including bugs, exploits, hacks, smart-contract vulnerabilities,
          phishing, compromised credentials, chain congestion, RPC failures,
          bridge failures, chain reorganizations, forks, sequencing issues,
          validator behavior, MEV, failed transactions, and total loss of
          digital assets. You further understand and accept the risks specific
          to direct onchain, multi-step, cross-chain, and routed transactions,
          including the risk that funds may be stranded in an intermediate state
          on a third-party bridge, network, or protocol; that sequential
          execution across multiple services may result in partial completion,
          price slippage between steps, or receipt of fewer tokens than
          expected; that onramp, bridge, or swap services may be unavailable,
          delayed, or subject to their own failures; and that Cartridge has no
          ability to reverse, complete, or recover funds involved in failed or
          partially completed third-party transactions. You also understand and
          accept that card or other fiat payments made through Stripe or another
          processor may be declined, delayed, reversed, refunded, or subjected
          to fraud review, reserve, dispute, or chargeback procedures under the
          rules of the applicable processor, bank, or payment network.
        </p>
        <p>
          <span className="underline">14.2 Economic and Gameplay Risks.</span>{" "}
          You understand and accept that gameplay outcomes, referral outcomes,
          reward availability, token supply dynamics, token value, token
          liquidity, slippage, fee levels, and governance outcomes may change or
          behave differently than expected, and that you may receive no reward
          or less value than expected.
        </p>
        <p>
          <span className="underline">14.3 Legal and Regulatory Risks.</span>{" "}
          You understand and accept that the legal, regulatory, tax, and
          accounting treatment of the Services and related digital assets may
          change, may differ across jurisdictions, and may be uncertain. Such
          changes may adversely affect the availability, legality, or value of
          the Services or any associated digital asset.
        </p>
        <p>
          <span className="underline">14.4 User Responsibility.</span> You are
          solely responsible for evaluating whether it is appropriate for you to
          use the Services, submit transactions, hold digital assets,
          participate in governance or staking, rely on Documentation, or act on
          information provided through the Services.
        </p>
        <p>
          <span className="underline">14.5 No Professional Advice.</span>{" "}
          Cartridge does not provide legal, tax, accounting, financial,
          investment, brokerage, or other professional advice. Any information
          Cartridge provides is for general informational purposes only.
        </p>
        <p>
          <strong>15. Disclaimers</strong>
        </p>
        <p>
          <span className="underline">
            15.1 Services Provided "As Is" and "As Available".
          </span>{" "}
          TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICES ARE
          PROVIDED "AS IS," "AS AVAILABLE," AND WITH ALL FAULTS, WITHOUT
          WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR
          OTHERWISE.
        </p>
        <p>
          <span className="underline">15.2 Disclaimer of Warranties.</span> TO
          THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, CARTRIDGE DISCLAIMS
          ALL WARRANTIES, INCLUDING ANY IMPLIED WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, QUIET
          ENJOYMENT, ACCURACY, COMPLETENESS, AVAILABILITY, SECURITY,
          RELIABILITY, AND ANY WARRANTIES ARISING OUT OF COURSE OF DEALING,
          USAGE, OR TRADE.
        </p>
        <p>
          <span className="underline">
            15.3 No Guarantee of Outcomes or Availability.
          </span>{" "}
          WITHOUT LIMITING THE FOREGOING, CARTRIDGE DOES NOT WARRANT THAT THE
          SERVICES, DOCUMENTATION, SMART CONTRACTS, TOKENS, REWARDS, REFERRALS,
          AIRDROPS, GOVERNANCE FEATURES, COMMUNITY SPACES, OR ANY CONTENT WILL
          BE UNINTERRUPTED, ERROR-FREE, SECURE, TIMELY, AVAILABLE, OR FREE OF
          BUGS OR VULNERABILITIES, OR THAT ANY DEFECT WILL BE CORRECTED.
        </p>
        <p>
          <span className="underline">
            15.4 No Warranty as to Value, Liquidity, or Legal Treatment.
          </span>{" "}
          CARTRIDGE DOES NOT GUARANTEE ANY PARTICULAR GAME OUTCOME, REWARD,
          REFERRAL BENEFIT, TOKEN PRICE, TOKEN VALUE, LIQUIDITY, GOVERNANCE
          RESULT, SECONDARY MARKET, TAX RESULT, OR LEGAL OR REGULATORY TREATMENT
          OF ANY DIGITAL ASSET OR FEATURE.
        </p>
        <p>
          <span className="underline">
            15.5 Open-Source Software Disclaimer.
          </span>{" "}
          OPEN-SOURCE SOFTWARE IS ALSO PROVIDED SUBJECT TO THE DISCLAIMER
          LANGUAGE CONTAINED IN THE APPLICABLE OPEN-SOURCE LICENSE, INCLUDING
          THE MIT LICENSE WHERE APPLICABLE.
        </p>
        <p>
          <span className="underline">15.6 Non-Waivable Rights.</span> SOME
          JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR
          LIMITATIONS OF CERTAIN RIGHTS, SO SOME OF THE ABOVE DISCLAIMERS MAY
          NOT APPLY TO YOU TO THE EXTENT PROHIBITED BY LAW.
        </p>
        <p>
          <strong>16. Limitation of Liability</strong>
        </p>
        <p>
          <span className="underline">16.1 Excluded Damages.</span> TO THE
          FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL CARTRIDGE
          OR ITS AFFILIATES, LICENSORS, CONTRIBUTORS, SERVICE PROVIDERS, OR
          THEIR RESPECTIVE DIRECTORS, OFFICERS, EMPLOYEES, CONTRACTORS, AGENTS,
          REPRESENTATIVES, SUCCESSORS, OR ASSIGNS (COLLECTIVELY, THE "CARTRIDGE
          PARTIES") BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF
          PROFITS, REVENUE, GOODWILL, DATA, TOKENS, DIGITAL ASSETS, OPPORTUNITY,
          OR BUSINESS INTERRUPTION, ARISING OUT OF OR RELATING TO THESE TERMS OR
          THE SERVICES, WHETHER IN CONTRACT, TORT, STRICT LIABILITY, STATUTE, OR
          OTHERWISE, EVEN IF ANY CARTRIDGE PARTY HAS BEEN ADVISED OF THE
          POSSIBILITY OF SUCH DAMAGES.
        </p>
        <p>
          <span className="underline">16.2 Specific Risk Allocation.</span> TO
          THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE CARTRIDGE PARTIES
          WILL NOT BE LIABLE FOR ANY DAMAGES, LOSSES, OR LIABILITIES ARISING
          FROM OR RELATING TO THIRD-PARTY SERVICES, PUBLIC BLOCKCHAINS, FORKS,
          CHAIN REORGANIZATIONS, GOVERNANCE ACTIONS, TOKEN MARKET MOVEMENTS,
          WALLET FAILURES, PRIVATE-KEY LOSS, USER ERROR, PHISHING, HACKS,
          EXPLOITS, UNAUTHORIZED ACCESS, DOWNTIME, OUTAGES, DOCUMENTATION
          ERRORS, OR THE ACTS OR OMISSIONS OF OTHER USERS OR THIRD PARTIES.
        </p>
        <p>
          <span className="underline">16.3 Aggregate Liability Cap.</span> TO
          THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE AGGREGATE
          LIABILITY OF THE CARTRIDGE PARTIES FOR ALL CLAIMS ARISING OUT OF OR
          RELATING TO THESE TERMS OR THE SERVICES WILL NOT EXCEED THE GREATER OF
          (A) US$100 OR (B) THE TOTAL AMOUNTS PAID BY YOU DIRECTLY TO CARTRIDGE
          FOR THE SPECIFIC HOSTED SERVICE GIVING RISE TO THE CLAIM DURING THE
          TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE
          CLAIM.
        </p>
        <p>
          <span className="underline">16.4 Basis of the Bargain.</span> THE
          LIMITATIONS IN THIS SECTION 16 APPLY EVEN IF ANY LIMITED REMEDY FAILS
          OF ITS ESSENTIAL PURPOSE AND FORM AN ESSENTIAL BASIS OF THE BARGAIN
          BETWEEN YOU AND CARTRIDGE.
        </p>
        <p>
          <span className="underline">16.5 Non-Waivable Limits.</span> NOTHING
          IN THESE TERMS EXCLUDES OR LIMITS LIABILITY TO THE EXTENT SUCH
          LIABILITY CANNOT BE EXCLUDED OR LIMITED UNDER APPLICABLE LAW.
        </p>
        <p>
          <strong>17. Indemnification</strong>
        </p>
        <p>
          <span className="underline">17.1 Your Indemnity Obligations.</span> To
          the fullest extent permitted by applicable law, you will defend,
          indemnify, and hold harmless the Cartridge Parties from and against
          any and all claims, actions, proceedings, investigations, liabilities,
          damages, judgments, settlements, losses, costs, and expenses,
          including reasonable attorneys’ fees and costs, arising out of or
          relating to: (a) your access to or use of the Services; (b) your
          breach of these Terms or any additional applicable terms; (c) your
          violation of any law or third-party right; (d) your User Content,
          Feedback, or community activity; (e) any fraud, negligence, willful
          misconduct, or exploitative conduct by you; or (f) any dispute between
          you and any third party relating to the Services.
        </p>
        <p>
          <span className="underline">17.2 Control of Defense.</span> Cartridge
          may assume the exclusive defense and control of any matter subject to
          indemnification by you, in which case you will cooperate with
          Cartridge in asserting any available defenses.
        </p>
        <p>
          <strong>18. Dispute Resolution; Binding Arbitration</strong>
        </p>
        <p>
          <span className="underline">
            18.1 PLEASE READ THIS SECTION CAREFULLY.
          </span>{" "}
          IT AFFECTS YOUR LEGAL RIGHTS.
        </p>
        <p>
          <span className="underline">18.2 Informal Resolution.</span> Before
          filing a claim in arbitration or court, the party asserting the
          dispute must first send the other party a written notice describing
          the nature of the dispute, the facts giving rise to it, and the relief
          requested. Notices to Cartridge must be sent to: [legal notices email
          and mailing address]. If the parties do not resolve the dispute within
          thirty (30) days after receipt of the notice, either party may proceed
          as permitted under this Section 18.
        </p>
        <p>
          <span className="underline">18.3 Agreement to Arbitrate.</span> Except
          for (a) eligible individual actions in small claims court and (b)
          actions seeking temporary or preliminary injunctive relief solely to
          protect intellectual property, confidential information, or the
          security of the Services pending final resolution, you and Cartridge
          agree that any dispute, claim, or controversy arising out of or
          relating to these Terms or the Services, including their formation,
          existence, breach, termination, enforcement, interpretation, or
          validity (collectively, "Disputes"), will be resolved exclusively by
          final and binding individual arbitration, and not in court. The
          Federal Arbitration Act, 9 U.S.C. Sections 1–16, governs the
          interpretation and enforcement of this Section 18. Except to the
          extent prohibited by applicable law, the arbitrator has exclusive
          authority to resolve all threshold issues regarding arbitrability,
          including the scope, applicability, enforceability, and formation of
          this arbitration agreement. The arbitrator may award the same
          individualized remedies that a court could award under applicable law,
          subject to the limitations and waivers in these Terms. The
          arbitrator’s award will be final and binding and may be entered as a
          judgment in any court of competent jurisdiction.
        </p>
        <p>
          <span className="underline">18.4 Arbitration Procedure.</span> The
          arbitration will be administered by the American Arbitration
          Association ("AAA") under the AAA Consumer Arbitration Rules if the
          Dispute qualifies as a consumer dispute, or otherwise under the AAA
          Commercial Arbitration Rules, in each case as in effect when the
          Dispute is filed. The arbitration will be heard by a single neutral
          arbitrator. The designated seat and locale will be New York, New York;
          provided, however, that the parties may agree to conduct the
          arbitration remotely and, if the Dispute is a consumer dispute, any
          in-person hearing location must remain reasonably accessible
          consistent with applicable AAA rules and due-process standards.
          Hearings may be conducted by video, telephone, in person, or by
          submission of documents, as determined by the applicable AAA rules,
          the parties’ agreement, or the arbitrator. For consumer Disputes, any
          documents-only or other streamlined procedures will apply only to the
          extent provided by the then-current AAA Consumer Arbitration Rules.
          For non-consumer Disputes, the arbitrator may order streamlined or
          documents-only procedures to the extent permitted by the applicable
          AAA rules and consistent with a fair opportunity for each party to
          present its case. The arbitration will be conducted in English. If you
          are a consumer, your arbitration fees will not exceed the amount the
          applicable AAA Consumer Arbitration Rules permit a consumer to be
          charged, and Cartridge will pay the remainder of the AAA
          administrative fees and arbitrator compensation to the extent required
          by those rules. For non-consumer Disputes, fees and costs will be
          allocated in accordance with the applicable AAA rules and the
          arbitrator’s award. Nothing in these Terms will be interpreted to
          deprive any consumer of any substantive rights or procedural
          protections that cannot be waived under applicable law or the
          applicable AAA rules.
        </p>
        <p>
          <span className="underline">
            18.5 Class Action and Jury Trial Waiver.
          </span>{" "}
          TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, YOU AND CARTRIDGE
          EACH WAIVE ANY RIGHT TO A JURY TRIAL AND ANY RIGHT TO BRING, JOIN, OR
          PARTICIPATE IN A CLASS, COLLECTIVE, REPRESENTATIVE, CONSOLIDATED, OR
          PRIVATE ATTORNEY GENERAL ACTION OR PROCEEDING. THE ARBITRATOR MAY
          AWARD RELIEF ONLY ON AN INDIVIDUAL BASIS AND ONLY TO THE EXTENT
          NECESSARY TO RESOLVE THE CLAIM OF THE PARTY SEEKING RELIEF. UNLESS
          BOTH PARTIES EXPRESSLY AGREE OTHERWISE, THE ARBITRATOR MAY NOT
          CONSOLIDATE MORE THAN ONE PERSON’S CLAIMS AND MAY NOT PRESIDE OVER ANY
          FORM OF REPRESENTATIVE OR CLASS PROCEEDING.
        </p>
        <p>
          <span className="underline">
            18.6 Severability of Arbitration Terms.
          </span>{" "}
          If any portion of this Section 18 is found unenforceable, that portion
          will be severed and the remainder will remain in effect, except that
          if Section 18.4 is found unenforceable with respect to a particular
          claim or request for relief, then that claim or request for relief
          will proceed in a court of competent jurisdiction and the remainder of
          the Dispute will proceed in arbitration to the fullest extent
          permitted by law.
        </p>
        <p>
          <strong>
            19. Governing Law; Venue for Permitted Court Proceedings
          </strong>
        </p>
        <p>
          <span className="underline">19.1 Governing Law.</span> Except as
          provided in Section 18 and to the fullest extent permitted by
          applicable law, these Terms and any Dispute not subject to arbitration
          will be governed by the laws of the State of New York, without regard
          to conflict-of-laws principles.
        </p>
        <p>
          <span className="underline">19.2 Venue.</span> Subject to Section 18,
          the state and federal courts located in New York County, New York will
          have exclusive jurisdiction over any action permitted to proceed in
          court, and you and Cartridge consent to the personal jurisdiction of
          those courts.
        </p>
        <p>
          <strong>20. Changes to the Terms</strong>
        </p>
        <p>
          <span className="underline">20.1 Updates to the Terms.</span>{" "}
          Cartridge may update these Terms from time to time. If Cartridge makes
          material changes, Cartridge will provide notice as reasonably
          practicable, including by posting the updated Terms, updating the
          Effective Date above, or providing notice through the Services.
        </p>
        <p>
          <span className="underline">20.2 Effective Date of Updates.</span>{" "}
          Unless Cartridge states otherwise, updated Terms become effective when
          posted. Your continued use of the Services after the effective date of
          updated Terms constitutes your acceptance of the updated Terms. If you
          do not agree to the updated Terms, you must stop using the Services.
        </p>
        <p>
          <strong>21. Miscellaneous</strong>
        </p>
        <p>
          <span className="underline">21.1 Entire Agreement.</span> These Terms
          constitute the entire agreement between you and Cartridge regarding
          the Services and supersede all prior or contemporaneous understandings
          relating to the Services, except that any applicable open-source
          license governs the code distributed under that license and any
          separate written agreement between you and Cartridge will control to
          the extent of a direct conflict.
        </p>
        <p>
          <span className="underline">21.2 Notices.</span> Cartridge may provide
          notices to you by posting them through the Services, sending them to
          an email address you provide, or using other reasonable electronic
          means. You must send legal notices to Cartridge at the contact details
          listed below unless Cartridge specifies a different notice address.
        </p>
        <p>
          <span className="underline">
            21.3 Electronic Communications and Signatures.
          </span>{" "}
          You consent to receive communications from Cartridge electronically.
          You agree that all agreements, notices, disclosures, and other
          communications that Cartridge provides electronically satisfy any
          legal requirement that such communications be in writing.
        </p>
        <p>
          <span className="underline">21.4 Assignment.</span> You may not assign
          or transfer these Terms, by operation of law or otherwise, without
          Cartridge’s prior written consent. Cartridge may assign or transfer
          these Terms without restriction.
        </p>
        <p>
          <span className="underline">21.5 No Waiver.</span> No failure or delay
          by Cartridge in exercising any right or remedy will operate as a
          waiver of that right or remedy.
        </p>
        <p>
          <span className="underline">21.6 Severability.</span> If any provision
          of these Terms other than Section 18 is found invalid or
          unenforceable, the remaining provisions will remain in full force and
          effect.
        </p>
        <p>
          <span className="underline">21.7 No Third-Party Beneficiaries.</span>{" "}
          Except as expressly provided in these Terms, these Terms do not create
          any third-party beneficiary rights.
        </p>
        <p>
          <span className="underline">21.8 Relationship of the Parties.</span>{" "}
          Nothing in these Terms creates any agency, partnership, joint venture,
          employment, or fiduciary relationship between you and Cartridge.
        </p>
        <p>
          <span className="underline">21.9 Force Majeure.</span> Cartridge will
          not be liable for any delay or failure to perform resulting from
          causes beyond its reasonable control, including acts of God, natural
          disasters, war, terrorism, civil unrest, labor disputes, utility
          failures, internet failures, blockchain or network failures,
          third-party service outages, governmental action, or security
          incidents.
        </p>
        <p>
          <span className="underline">21.10 Interpretation.</span> Headings are
          for convenience only and do not affect interpretation. The word
          "including" means "including without limitation." Any translated
          version of these Terms is provided for convenience only, and the
          English version controls in the event of a conflict.
        </p>
        <p>
          <strong>22. Contact Information</strong>
        </p>
        <p>
          Cartridge Gaming Company
          <br />
          Email:{" "}
          <a href="mailto:contact@cartridge.gg" className="underline">
            contact@cartridge.gg
          </a>
        </p>
      </div>

      <Button variant="tertiary" className="min-h-12 w-full" onClick={onAccept}>
        <span
          className="px-1 text-[28px]/[19px] tracking-wide translate-y-0.5"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
        >
          Accept
        </span>
      </Button>
    </div>
  );
};
