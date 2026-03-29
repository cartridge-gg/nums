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
          “Welcome to Cartridge Gaming Company ("Cartridge," "we," "our," or
          "us"). Please read these Terms of Service (these “Terms”, and,
          collectively with the Privacy Policy (defined below), this
          "Agreement") carefully as they govern your access to and use of our
          website(s), products, services and applications (collectively, the
          "Services"). If you have any questions, comments, or concerns
          regarding these terms or the Services, please contact us at:
        </p>
        <p>
          Email:{" "}
          <a href="mailto:contact@cartridge.gg" className="underline">
            contact@cartridge.gg
          </a>
        </p>
        <p>
          Address: Cartridge Gaming Company, 1 Dock 72 Way, Brooklyn, NY 11205
        </p>
        <p>
          These Terms are a binding contract between you and Cartridge. Your use
          of the Services in any way means that you agree to all of these Terms,
          and these Terms will remain in effect while you use the Services. If
          you are using the Services on behalf of an organization or entity, you
          agree that you are authorized to agree to these Terms on such
          organization's or entity's behalf (in which case, all references to
          "you" and "your" hereunder include such organization or entity).
        </p>
        <p>
          PLEASE READ THESE TERMS CAREFULLY. THEY INCLUDE IMPORTANT INFORMATION
          ABOUT YOUR LEGAL RIGHTS, REMEDIES, AND OBLIGATIONS. BY ACCESSING OR
          USING THE SERVICES, YOU AGREE TO BE BOUND BY ALL OF THESE TERMS.
        </p>
        <p>
          ARBITRATION NOTICE AND CLASS ACTION WAIVER: EXCEPT FOR CERTAIN TYPES
          OF DISPUTES DESCRIBED IN THE ARBITRATION SECTION BELOW, YOU AGREE THAT
          DISPUTES BETWEEN YOU AND US WILL BE RESOLVED BY BINDING, INDIVIDUAL
          ARBITRATION AND YOU WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION
          LAWSUIT OR CLASS-WIDE ARBITRATION.
        </p>
        <p>
          Services Description What Cartridge Does Cartridge provides three core
          Services to its customers: We authenticate your wallet with Web3
          applications and initialize Web3 applications for your use and
          enjoyment. We provide you with embedded wallets so you can easily
          transact and access on-chain systems as part of using the Services. We
          provide a web3 transaction service to facilitate transaction execution
          and service payment. We sell non-refundable credits that you can use
          for our Services whose costs are denominated in Cartridge Credits
          (defined below).
        </p>
        <p>
          Basic Usage Cartridge Credits Nature of Credits "Cartridge Credits"
          are digital units of value that can be used solely within our
          Services. Cartridge Credits have no cash value and cannot be redeemed
          for cash. Cartridge Credits are not a cryptocurrency, virtual
          currency, security, commodity, or any other kind of financial
          instrument. Purchase of Cartridge Credits does not represent an
          investment or speculation opportunity.
        </p>
        <p>
          Purchasing Credits Credits can be purchased using fiat currency
          through our Stripe-powered payment system. Credit purchases are final
          and non-refundable unless otherwise required by applicable law. We
          reserve the right to change the purchase price of Credits at any time.
          Minimum and maximum purchase amounts may apply.
        </p>
        <p>
          Credit Balance and Usage Your Credit balance represents a limited
          right to use features of our Services Credits are non-transferable and
          may not be resold, exchanged, or transferred for value Credits may
          only be used for designated services within our platform We reserve
          the right to expire, revoke, or modify Credits at any time
        </p>
        <p>
          Restrictions You may not sell, barter, or trade Cartridge Credits. You
          may not accumulate Credits through unauthorized means. Creating
          multiple accounts to accumulate Credits is prohibited. Any attempt to
          manipulate, hack, or abuse the Credit system is strictly prohibited.
        </p>
        <p>
          Account Management You are responsible for all Credit purchases made
          through your account. Unauthorized use of your account to purchase
          Credits should be reported immediately. We may suspend Credit
          purchases or usage if we suspect fraudulent activity. Credit balances
          may be forfeited upon account termination.
        </p>
        <p>
          Fees and Charges We may charge administrative fees for Credit-related
          transactions. All applicable taxes on Credit purchases will be
          collected at the time of purchase. Currency conversion fees may apply
          for international transactions. Payment processing fees are included
          in the displayed Credit purchase price.
        </p>
        <p>
          Refunds and Cancellations Credit purchases are generally
          non-refundable We may, at our sole discretion, issue refunds in
          exceptional circumstances Refunds, if issued, will be processed
          through the original payment method Chargebacks or payment disputes
          may result in account suspension
        </p>
        <p>
          Service Changes We reserve the right to modify, suspend, or
          discontinue the Credit system The value, utility, or features
          available for Credits may change We will make reasonable efforts to
          notify users of significant changes No compensation will be provided
          for changes in Credit utility or value
        </p>
        <p>
          Errors and Corrections We reserve the right to correct any errors in
          Credit balances Credit balances displayed may be adjusted to reflect
          actual purchase history Users must report suspected Credit balance
          errors within 30 days We may suspend Credit usage during error
          investigation
        </p>
        <p>
          Legal Compliance Credit purchases and usage must comply with all
          applicable laws We may require additional verification for large
          Credit purchases We reserve the right to limit or decline Credit
          purchases We will cooperate with law enforcement investigations
          regarding Credit transactions
        </p>
        <p>
          Credit Expiration Credits do not expire under normal circumstances
          Credits may be forfeited for violation of these Terms Inactive
          accounts of over 2 years may have Credits suspended or forfeited
        </p>
        <p>
          Disputes Disputes regarding Credits must be submitted in writing
          Resolution of Credit disputes is at our sole discretion The
          arbitration provisions in these Terms apply to Credit-related disputes
          Small claims court may be used for eligible Credit-related disputes
        </p>
        <p>
          Payment Processing Services We use Stripe, Inc. ("Stripe") as our
          payment processing service to process credit and debit card
          transactions By making a purchase on our Services, you agree to be
          bound by Stripe's Terms of Service (available at
          https://stripe.com/legal) and acknowledge Stripe's Privacy Policy
          (available at https://stripe.com/privacy) You expressly authorize us
          and our third-party payment processor, Stripe, to charge your payment
          method for all amounts due Your payment information is processed and
          stored by Stripe in accordance with their security standards and
          policies We do not directly collect, store, or process your credit
          card or banking information You are responsible for the accuracy of
          the payment information you provide
        </p>
        <p>
          Account Creation and Security Registration Requirements You may be
          required to sign up for an account and create a credential. You
          promise to provide us with accurate, complete, and updated
          registration information about yourself. You agree that you will not
          set up an account with the intent to impersonate another person.
        </p>
        <p>
          Wallet Security When you create a Wallet with which to interact with
          the Services, you will be able to a passkey ("Passkey") to generate
          encrypted private keys to protect that Wallet. You should safeguard
          your Passkey as it is necessary to access your Wallet. IMPORTANT:
          Cartridge does not store any Wallet or unencrypted Passkey in any
          Cartridge system and never has access to your unencrypted Passkey. You
          acknowledge that Cartridge only provides self-custodial (i.e.,
          non-custodial) Wallets and Cartridge does not store or have access to
          your Wallets, Credentials or assets contained in Wallets. Accordingly,
          Cartridge cannot assist with retrieving any such Credentials.
        </p>
        <p>
          Security Responsibilities You are responsible for: Storing and
          safeguarding your Passkey, any passwords, private keys, recovery
          phrases and other credentials Using commercially reasonable efforts to
          prevent unauthorized access All activities that occur under your
          account Notifying us immediately of any unauthorized or suspicious
          activity
        </p>
        <p>
          NEITHER CARTRIDGE NOR ITS EMPLOYEES WILL EVER ASK YOU FOR INFORMATION
          ABOUT YOUR WALLET SECRET OR OTHER DETAILS THAT COULD BE USED TO TAKE
          FULL CONTROL OVER YOUR WALLET.
        </p>
        <p>
          Transactions and Third-Party Services Transactions Through Cartridge
          Credits The Cartridge Credits enable you to access third-party
          applications, including decentralized applications ("DAPP") and select
          Web3 games, which may allow you to earn, swap, or trade digital
          assets. Cartridge is not responsible for our access or use of any DAPP
          or Web3 Game on your behalf. Your use of any DAPP or Web3 game is
          subject to the terms and conditions of the third-party DAPP or Web3
          game provider.
        </p>
        <p>
          Important points regarding Web3 transactions: We cannot freeze, cancel
          or modify any transaction executed by or for you We do not store,
          send, or receive digital assets Transactions occur on the relevant
          blockchain network Unless otherwise set by us, you are responsible for
          all gas fees and transaction fees We cannot guarantee transaction
          completion
        </p>
        <p>
          Prohibited Activities You agree that you will not use your Cartridge
          Credits to: Pay for, support, or engage in illegal activities Purchase
          or sell illegal goods or services Engage in fraud or money laundering
          Support terrorist activities
        </p>
        <p>
          User Representations and Warranties By accessing or using the
          Services, you represent, warrant, and covenant that: Legal Capacity
          You are an individual of legal age to form a binding contract in your
          jurisdiction. If acting on behalf of an entity, you have full
          authority to bind that entity to these Terms. If not of legal age, you
          have received your parent's or guardian's permission and they agree to
          be bound by these Terms.
        </p>
        <p>
          Compliance with Laws Your access to and use of the Services is not
          prohibited by, and does not otherwise violate or assist you to
          violate, any applicable laws, rules, or regulations You will comply
          with all applicable local, state, national, and international laws,
          rules, and regulations, including, without limitation: Any applicable
          sanctions laws Export control laws Securities or other financial
          regulatory laws Anti-money laundering laws Privacy laws Data
          protection laws
        </p>
        <p>
          Identity and Location All registration information you submit is
          truthful and accurate You will maintain the accuracy of such
          information
        </p>
        <p>
          Prohibited Persons and Territories For the duration of your use of the
          Services, you will not be: The subject of economic or trade sanctions
          administered or enforced by any governmental authority Listed on any
          sanctions-related list of sanctioned persons maintained by: The United
          Nations Security Council The European Union His Majesty's Treasury of
          the United Kingdom The U.S. Department of Treasury Any other relevant
          sanctions authority Located, organized, or resident in a country or
          territory that is the subject of comprehensive sanctions, including:
          Cuba Iran North Korea Syria The Crimea, Donetsk, and Luhansk regions
          of Ukraine Any other restricted territories as defined by applicable
          authorities
        </p>
        <p>
          Technical and Security Warranties You represent, warrant, and covenant
          that you will not: Security Measures: Use any Virtual Private Network
          (VPN) or other privacy or anonymization tools to circumvent
          restrictions Attempt to bypass or circumvent any security features
          Interfere with or disrupt the integrity or performance of the Services
          Attempt to gain unauthorized access to the Services or related systems
        </p>
        <p>
          Technical Restrictions: Use any robot, spider, scraper, or other
          automated means to access the Services Engage in any data mining,
          harvesting, or extraction activities Attempt to decompile, reverse
          engineer, or otherwise attempt to obtain the source code Use the
          Services in a manner that could damage, disable, overburden, or impair
          any servers or networks You will not attempt to probe, scan, or test
          our systems or security You will not use the Services in any way that
          could damage our reputation You will not engage in any activity that
          interferes with or disrupts the Services You will respect the
          intellectual property rights of others
        </p>
        <p>
          Digital Assets and Transactions You represent, warrant, and covenant
          that: Ownership and Authority: You either own or are authorized to use
          any digital assets you interact with through the Services You have the
          right to engage in any transaction you initiate or ask us to initiate
          for you Any assets you use in connection with the Services are legally
          obtained and owned
        </p>
        <p>
          Transaction Understanding: You understand the nature and risks of
          digital asset transactions You accept that transactions may be
          irreversible You acknowledge that the value of digital assets can be
          volatile You understand that you are solely responsible for
          determining any tax obligations
        </p>
        <p>
          Service Usage Warranties. You warrant and covenant that you will not
          use the Services to: Content and Communication: Upload or transmit any
          content that infringes intellectual property rights Share content that
          is defamatory, obscene, or harmful Distribute unauthorized promotional
          or advertising materials Transmit any malicious code or malware Engage
          in activities that violate others' privacy
        </p>
        <p>
          Prohibited Activities: Engage in market manipulation or fraudulent
          activities Conduct or promote illegal activities Impersonate any
          person or entity Attempt to bypass any restrictions on the Services
          Use the Services for money laundering or terrorist financing
        </p>
        <p>
          Acknowledgments. You acknowledge and agree that: Risk Awareness:
          Digital asset transactions involve substantial risk Past performance
          is not indicative of future results You could lose all assets stored
          in your wallet Technical failures could impact your ability to access
          your assets
        </p>
        <p>
          Service Limitations: We do not provide investment, legal, or tax
          advice We cannot guarantee the availability or performance of the
          Services We are not responsible for third-party services or products
          We may modify or discontinue Services at any time
        </p>
        <p>
          Responsibility: You are solely responsible for your use of the
          Services You are responsible for maintaining backups of your
          information You must evaluate and bear all risks associated with using
          the Services You are responsible for ensuring your use complies with
          applicable laws
        </p>
        <p>
          Verification Rights. We reserve the right to verify your compliance
          with these representations, warranties, and covenants at any time.
          Violation of any of these provisions is grounds for immediate
          termination of your access to the Services.
        </p>
        <p>
          Privacy and Data Protection Data Collection and Use "PII" means any
          information obtained in connection with your use of the Services that
          can reasonably be used to identify you, including but not limited to:
          Full name Contact information Wallet information Other identifiers For
          complete information about our privacy practices, please see our
          Privacy Policy (available at
          https://cartridge.gg/pages/privacy-policy).
        </p>
        <p>
          Data Security Cartridge implements appropriate technical and
          organizational measures to protect your PII against: Unauthorized
          access Unlawful processing Accidental loss or destruction Security
          breaches We will notify you promptly of any security breaches
          affecting your data.
        </p>
        <p>
          Intellectual Property Rights General Ownership The Services and their
          entire contents, features, and functionality (including but not
          limited to all information, software, text, displays, images, video
          and audio, and the design, selection, and arrangement thereof) are
          owned by Cartridge, our licensors, or other providers of such material
          and are protected by United States and international copyright,
          trademark, patent, trade secret, and other intellectual property or
          proprietary rights laws. Neither this Agreement nor your use of the
          Services transfers to you or any third party any rights, title, or
          interest in or to such intellectual property rights, except for the
          limited, personal, non-exclusive license granted below.
        </p>
        <p>
          License Grant and Restrictions Subject to the terms of this Agreement,
          we grant you a limited, revocable, non-exclusive, non-sublicensable,
          non-transferable license to: Access and use our Services solely in
          accordance with this Agreement Download and display locally Content
          solely for purposes of using the Services Access and utilize any
          developer tools or documentation we provide, subject to any additional
          terms
        </p>
        <p>
          You agree that you will not: Use, modify, distribute, tamper with,
          reverse engineer, disassemble or decompile any of our Services Create
          derivative works based on the Services or any part thereof Copy,
          reproduce, modify, translate, publish, broadcast, transmit,
          distribute, perform, upload, display, license, sell, or otherwise
          exploit the Services or Content for any purpose Remove or modify any
          proprietary notices or labels Use any data mining, robots, scraping,
          or similar data gathering methods Attempt to probe, scan or test the
          vulnerability of the Services or circumvent any security measures
          Access the Services to build a similar or competitive website,
          product, or service
        </p>
        <p>
          Content Usage and Restrictions The Services may contain material such
          as software, text, graphics, images, designs, sound recordings,
          audiovisual works, and other content provided by or on behalf of
          Cartridge ("Content"). The Content is protected under both United
          States and foreign laws. All goodwill generated from the use of
          Cartridge Trademarks inures to our benefit. Elements of the Services
          are protected by trade dress, trademark, unfair competition, and other
          state and federal laws and may not be copied or imitated in whole or
          in part, by any means, including, but not limited to, the use of
          framing or mirrors.
        </p>
        <p>
          Trademarks and Trade Dress The trademarks, service marks, and logos of
          Cartridge (the "Cartridge Trademarks") used and displayed on the
          Services are registered and unregistered trademarks or service marks
          of Cartridge. Other company, product, and service names located on the
          Services may be trademarks or service marks owned by others (the
          "Third-Party Trademarks," and, collectively with Cartridge Trademarks,
          the "Trademarks"). Nothing in this Agreement or on the Services should
          be construed as granting, by implication, estoppel, or otherwise, any
          license or right to use any Trademark displayed on the Services
          without our prior written permission. The use of our trade names,
          trademarks, or service marks in any manner that is likely to cause
          confusion among customers, or that disparages or discredits Cartridge,
          is prohibited.
        </p>
        <p>
          Software and Developer Tools Unless otherwise agreed between Cartridge
          and you, each of the applications, services, or tools marketed on our
          site is made available solely for license, not sale, to you and other
          prospective customers under the terms, conditions and restrictions of
          the license agreement made available to you herein and when purchasing
          our applications or services. You will comply with all terms and
          conditions of the specific license agreement for any applications or
          services you obtain through us, including, but not limited to, all
          confidentiality obligations and restrictions on resale, use, reverse
          engineering, copying, making, modifying, improving, sublicensing, and
          transfer of those licensed applications and services.
        </p>
        <p>
          Feedback and Contributions If you provide us with any feedback or
          suggestions regarding the Services ("Feedback"), you hereby: Assign to
          us all rights in such Feedback Agree that we have the right to use and
          fully exploit such Feedback and related information in any manner we
          deem appropriate Verify that any such Feedback will be treated as
          non-confidential and non-proprietary We will be entitled to the
          unrestricted use and dissemination of such Feedback for any purpose,
          commercial or otherwise, without acknowledgment, attribution, or
          compensation to you.
        </p>
        <p>
          User Content Any content you upload to the Services remains your
          property, but you grant us a worldwide, non-exclusive, royalty-free
          license (with the right to sublicense) to use, copy, reproduce,
          process, adapt, modify, publish, transmit, display and distribute such
          content in any and all media or distribution methods (now known or
          later developed) to provide the Services.
        </p>
        <p>
          Copyright Infringement Claims We respect the intellectual property
          rights of others and attempt to comply with all relevant laws. We will
          review all claims of copyright infringement received and remove any
          content deemed to have been posted or distributed in violation of any
          such laws. If you believe that your work has been copied on the
          Services in a way that constitutes copyright infringement, please
          provide our agent with notice including: A description of the
          copyrighted work that has been infringed A description of where the
          allegedly infringing material is located Your contact information A
          statement by you that you have a good faith belief that the disputed
          use is not authorized A statement by you, made under penalty of
          perjury, that the information in your notice is accurate An electronic
          or physical signature of the copyright owner or authorized person
        </p>
        <p>
          Third-Party Intellectual Property This Agreement does not transfer
          from Cartridge to you any Third-Party Intellectual Property, and all
          right, title, and interest in and to such property will remain solely
          with the Third-Party owner. Cartridge, the Cartridge logo, and all
          other trademarks, service marks, graphics and logos used in connection
          with Cartridge or the Services are trademarks or registered trademarks
          of Cartridge or Cartridge's licensors. Other trademarks, service
          marks, graphics and logos used in connection with the Services may be
          the trademarks of other third parties. Your use of the Services grants
          you no right or license to reproduce or otherwise use any Cartridge or
          Third-Party trademarks.
        </p>
        <p>
          Disclaimers and Limitations of Liability Warranty Disclaimer Cartridge
          and its licensors, suppliers, partners, parent, subsidiaries or
          affiliated entities, and each of their respective officers, directors,
          members, employees, consultants, contract employees, representatives
          and agents, and each of their respective successors and assigns
          (Cartridge and all such parties together, the "Cartridge Parties")
          make no representations or warranties concerning the Services,
          including without limitation regarding any Content contained in or
          accessed through the Services, and the Cartridge Parties will not be
          responsible or liable for the accuracy, copyright compliance,
          legality, or decency of material contained in or accessed through the
          Services or any claims, actions, suits procedures, costs, expenses,
          damages or liabilities arising out of use of, or in any way related to
          your participation in, the Services.
        </p>
        <p>
          THE SERVICES AND CONTENT ARE PROVIDED BY CARTRIDGE (AND ITS LICENSORS
          AND SUPPLIERS) ON AN "AS-IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
          EITHER EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, IMPLIED
          WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
          NON-INFRINGEMENT, OR THAT USE OF THE SERVICES WILL BE UNINTERRUPTED OR
          ERROR-FREE. SOME STATES DO NOT ALLOW LIMITATIONS ON HOW LONG AN
          IMPLIED WARRANTY LASTS, SO THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.
        </p>
        <p>
          YOU ACKNOWLEDGE THAT DIGITAL ASSETS INVOLVE RISKS, INCLUDING THE RISK
          OF LOSS OF SOME OR ALL DIGITAL ASSETS. USE OF ANY WALLET RECOVERY
          SERVICE INCLUDED AS PART OF THE SERVICES IS OFFERED TO USERS AS A
          CONVENIENCE, SUBJECT TO THE TERMS SET FORTH IN THIS AGREEMENT.
          CARTRIDGE DOES NOT AND WILL NOT ACT AS A CUSTODIAN OF A USER'S WALLETS
          OR CREDENTIALS UNDER ANY CIRCUMSTANCES. USERS ARE SOLELY IN CONTROL OF
          AND RESPONSIBLE FOR STORING AND SECURING THEIR CREDENTIALS.
        </p>
        <p>
          Limitation of Liability TO THE FULLEST EXTENT ALLOWED BY APPLICABLE
          LAW, UNDER NO CIRCUMSTANCES AND UNDER NO LEGAL THEORY (INCLUDING,
          WITHOUT LIMITATION, TORT, CONTRACT, STRICT LIABILITY, OR OTHERWISE)
          SHALL ANY OF THE CARTRIDGE PARTIES BE LIABLE TO YOU OR TO ANY OTHER
          PERSON FOR: ANY INDIRECT, SPECIAL, INCIDENTAL, PUNITIVE OR
          CONSEQUENTIAL DAMAGES OF ANY KIND, INCLUDING DAMAGES FOR LOST PROFITS,
          BUSINESS INTERRUPTION, LOSS OF DATA, LOSS OF GOODWILL, WORK STOPPAGE,
          ACCURACY OF RESULTS, OR COMPUTER FAILURE OR MALFUNCTION, ANY
          SUBSTITUTE GOODS, SERVICES OR TECHNOLOGY, ANY AMOUNT, IN THE
          AGGREGATE, IN EXCESS OF ONE-HUNDRED ($100) DOLLARS, OR ANY MATTER
          BEYOND OUR REASONABLE CONTROL.
        </p>
        <p>
          FOR CLARITY, CARTRIDGE WILL NOT BE RESPONSIBLE OR LIABLE FOR ANY LOSS
          AND TAKES NO RESPONSIBILITY FOR, AND WILL NOT BE LIABLE FOR, ANY USE
          OF THE SERVICES INCLUDING BUT NOT LIMITED TO ANY LOSSES, DAMAGES OR
          CLAIMS ARISING FROM: USER ERROR SUCH AS FORGOTTEN CREDENTIALS,
          INCORRECTLY CONSTRUCTED TRANSACTIONS, OR MISTYPED ADDRESSES SERVER
          FAILURE OR DATA LOSS CORRUPTED WALLET FILES UNAUTHORIZED ACCESS TO
          APPLICATIONS ANY UNAUTHORIZED THIRD-PARTY ACTIVITIES, INCLUDING
          WITHOUT LIMITATION THE USE OF VIRUSES, PHISHING, BRUTE FORCING OR
          OTHER MEANS OF ATTACK AGAINST THE SITE OR SERVICES
        </p>
        <p>
          Indemnification To the fullest extent permitted by applicable laws,
          you agree to indemnify, defend and hold harmless Cartridge, as well as
          its affiliates, licensors, suppliers, service providers, and each of
          their respective past, present and future officers, directors,
          members, employees, consultants, representatives, contractors, agents,
          successors, assignees, and insurers (collectively, the "Indemnified
          Parties") from and against any and all actual or alleged third party:
          Claims, demands, actions, suits, investigations, proceedings, or
          litigation Damages, losses, deficiencies, settlements, liabilities,
          and obligations Taxes, penalties, interest, fees, and expenses
          (including without limitation reasonable attorneys' fees and expenses,
          court costs, costs of settlement, and costs of pursuing
          indemnification and insurance) Judgments, awards, assessments, fines
          of every kind and nature whatsoever, whether known or unknown,
          foreseen or unforeseen, matured or unmatured, or suspected or
          unsuspected, in law or equity, whether in tort, contract, or otherwise
          (collectively, "Claims").
        </p>
        <p>
          You agree to promptly notify us of any third-party Claims and
          cooperate with the Indemnified Parties in defending such Claims. You
          further agree that the Indemnified Parties shall have control of the
          defense or settlement of any third-party Claims, at your expense. This
          indemnity is in addition to, and not in lieu of, any other indemnities
          set forth in a written agreement between you and Cartridge.
        </p>
        <p>
          Additional Indemnification Terms Assumption of Defense: The
          Indemnified Parties have the right, but not the obligation, to assume
          the exclusive defense and control of any matter subject to
          indemnification by you. In such case: You agree to cooperate with any
          reasonable requests in assisting our defense of such matter You may
          not settle or compromise any Claim without our prior written consent
          We may participate in the defense at our own expense
        </p>
        <p>
          Advancement of Expenses: You agree to advance all expenses actually
          and reasonably incurred by the Indemnified Parties in connection with
          the investigation, defense, settlement, or appeal of any covered
          Claim. No Limitation: Your obligations under this section will not be
          limited by any limitation on amount or type of damages, compensation,
          or benefits payable by you under workers' compensation acts,
          disability benefit acts, or other employee benefit acts.
        </p>
        <p>
          Survival: These indemnification obligations will survive the
          termination of your account or this Agreement and your use of the
          Services. Notice of Claims: While we will make reasonable efforts to
          provide you with notice of any Claims, failure to provide such notice
          will not relieve you of your indemnification obligations except to the
          extent you are materially prejudiced by such failure. Independent
          Obligation: Your indemnification obligations under this Agreement are
          independent of your other obligations under this Agreement.
        </p>
        <p>
          Exceptions The indemnification obligations set forth in this section
          shall not apply to Claims to the extent they arise from the
          Indemnified Parties' willful misconduct, gross negligence, material
          breach of this Agreement, or violation of applicable law, provided
          that such exception shall only apply to the extent such Claim would
          not have arisen but for such conduct. This indemnification section
          shall be construed in a manner that gives maximum permissible effect
          to your indemnification obligations while preserving its
          enforceability under applicable law.
        </p>
        <p>
          Dispute Resolution Arbitration Agreement Please read the following
          ARBITRATION AGREEMENT carefully because it requires you to arbitrate
          certain disputes and claims with Cartridge and limits the manner in
          which you can seek relief from Cartridge.
        </p>
        <p>
          Arbitration Rules; Applicability of Arbitration Agreement. The parties
          shall use their best efforts to settle any dispute, claim, question,
          or disagreement arising out of or relating to the subject matter of
          these Terms directly through good-faith negotiations, which shall be a
          precondition to either party initiating arbitration. If such
          negotiations do not resolve the dispute, it shall be finally settled
          by binding arbitration in New York, New York. The arbitration will
          proceed in the English language, in accordance with the JAMS
          Streamlined Arbitration Rules and Procedures (the "Rules") then in
          effect, by one commercial arbitrator with substantial experience in
          resolving intellectual property and commercial contract disputes.
        </p>
        <p>
          Costs of Arbitration. The Rules will govern payment of all arbitration
          fees. Cartridge will not seek its attorneys' fees and costs in
          arbitration unless the arbitrator determines that your claim is
          frivolous.
        </p>
        <p>
          Small Claims Court; Infringement. Either you or Cartridge may assert
          claims, if they qualify, in small claims court in Brooklyn, New York
          or any United States county where you live or work. Furthermore,
          notwithstanding the foregoing obligation to arbitrate disputes, each
          party shall have the right to pursue injunctive or other equitable
          relief at any time, from any court of competent jurisdiction, to
          prevent the actual or threatened infringement, misappropriation or
          violation of a party's copyrights, trademarks, trade secrets, patents
          or other intellectual property rights.
        </p>
        <p>
          Class Action Waiver ALL CLAIMS AND DISPUTES WITHIN THE SCOPE OF THIS
          ARBITRATION AGREEMENT MUST BE ARBITRATED OR LITIGATED ON AN INDIVIDUAL
          BASIS AND NOT ON A CLASS BASIS. CLAIMS OF MORE THAN ONE CUSTOMER OR
          USER CANNOT BE ARBITRATED OR LITIGATED JOINTLY OR CONSOLIDATED WITH
          THOSE OF ANY OTHER CUSTOMER OR USER. YOU AND CARTRIDGE AGREE THAT EACH
          MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL
          CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED
          CLASS OR REPRESENTATIVE PROCEEDING.
        </p>
        <p>
          Opt-Out Rights You have the right to opt out of the provisions of this
          Arbitration section by sending written notice of your decision to opt
          out to: Cartridge Gaming Company, 1 Dock 72 Way, Brooklyn, NY 11205
          postmarked within thirty (30) days of first accepting these Terms. You
          must include: Your name and residence address The email address and/or
          telephone number associated with your account A clear statement that
          you want to opt out of these Terms' arbitration agreement
        </p>
        <p>
          Termination We reserve the right, in our sole discretion, to restrict,
          suspend, or terminate this Agreement and your access to all or any
          part of the Services, at any time and for any reason without prior
          notice or liability. We reserve the right to change, suspend, or
          discontinue all or any part of the Services at any time without prior
          notice or liability.
        </p>
        <p>
          Upon termination: All rights granted to you under these Terms will
          immediately cease You must cease all use of the Services You remain
          bound by Sections of these Terms We may delete your account and all
          associated data after a reasonable period You may export your private
          keys and other essential data
        </p>
        <p>
          Account termination may result in destruction of any Content
          associated with your account, so keep that in mind before you decide
          to terminate your account. If you have deleted your account by
          mistake, contact us immediately at contact@cartridge.gg we will try to
          help, but unfortunately, we can't promise that we can recover or
          restore anything.
        </p>
        <p>
          Modifications to Terms We reserve the right, in our sole discretion,
          to modify these Terms from time to time. If we make any material
          modifications, we will notify you by: Updating the date at the top of
          these Terms Sending you an email to the last email address you
          provided to us Providing notice through the Services Requiring you to
          accept the updated terms before continuing to use the Services
        </p>
        <p>
          All modifications will be effective when they are posted, and your
          continued access to or use of any of the Services will serve as
          confirmation of your acceptance of those modifications. If you do not
          agree with any modifications to these Terms, you must immediately stop
          accessing and using all of the Services.
        </p>
        <p>
          Miscellaneous Governing Law These Terms are governed by and will be
          construed under the laws of the State of Delaware, without regard to
          the conflicts of laws provisions thereof.
        </p>
        <p>
          Assignment You may not assign, delegate or transfer these Terms or
          your rights or obligations hereunder, or your Services account, in any
          way (by operation of law or otherwise) without Cartridge's prior
          written consent. We may transfer, assign, or delegate these Terms and
          our rights and obligations without consent.
        </p>
        <p>
          Severability If any provision of these Terms shall be determined to be
          invalid or unenforceable under any rule, law, or regulation of any
          local, state, or federal government agency, such provision will be
          changed and interpreted to accomplish the objectives of the provision
          to the greatest extent possible under any applicable law and the
          validity or enforceability of any other provision of these Terms shall
          not be affected.
        </p>
        <p>
          Force Majeure We will not be liable for any delay or failure to
          perform resulting from causes outside our reasonable control,
          including, but not limited to, acts of God, war, terrorism, pandemic,
          epidemic, changes in law or regulatory requirements, failure of
          third-party providers, or other similar events.
        </p>
        <p>
          No Waiver The failure of Cartridge to exercise or enforce any right or
          provision of these Terms will not operate as a waiver of such right or
          provision.
        </p>
        <p>
          Entire Agreement These Terms, together with our Privacy Policy and any
          other agreements expressly incorporated by reference herein,
          constitute the entire and exclusive understanding and agreement
          between you and Cartridge regarding your use of and access to the
          Services, and supersede and replace any and all prior oral or written
          understandings or agreements between you and Cartridge regarding the
          Services.
        </p>
        <p>
          Contact Information For questions about these Terms or the Services,
          please contact us at: Email: contact@cartridge.gg Address: Cartridge
          Gaming Company, 1 Dock 72 Way, Brooklyn, NY 11205
        </p>
        <p>Copyright © 2024 Cartridge Gaming Company. All rights reserved.</p>
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
