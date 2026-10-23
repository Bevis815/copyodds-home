/**
 * Terms of Service — DRAFT for operations / legal review.
 * Do not treat this page as a finalized binding policy until counsel confirms.
 * Unconfirmed entity names, governing law, fee schedules, and liability caps
 * are intentionally left as pending items rather than invented facts.
 */
export const TERMS_OF_SERVICE = {
  title: 'Terms of Service (Draft)',
  status: 'draft',
  lastUpdated: 'October 23, 2026',
  draftNotice: [
    'This page is a working draft for CopyOdds marketing-site disclosure. It is not a finalized legal agreement.',
    'Operating entity details, governing law, dispute venue, fee schedules, withdrawal SLAs, and liability caps marked “Pending confirmation” must be confirmed by the product owner and legal counsel before this draft is treated as published Terms.',
    'Until then, use the Trust Center, Privacy Policy, in-app disclosures, and official support channels for product facts that are already implemented.',
  ],
  intro: [
    'These draft Terms describe how visitors and users may interact with the CopyOdds website, related documentation, and (where applicable) the CopyOdds trading application and services (collectively, the “Services”).',
    'By accessing the website you acknowledge this draft status. Account registration or funding in the trading app may be subject to additional in-app disclosures once Terms are finalized.',
  ],
  sections: [
    {
      id: 'status',
      title: '1. Document status',
      bullets: [
        'Status: Draft — pending operations and legal confirmation.',
        'This draft must not be presented as a completed, binding Terms of Service until the pending items below are resolved and this notice is removed.',
        'If any statement here conflicts with a later confirmed Terms version or with in-app product rules, the confirmed Terms / in-app rules prevail once published.',
      ],
    },
    {
      id: 'provider',
      title: '2. Service provider (pending confirmation)',
      paragraphs: [
        'Pending confirmation: legal name of the service provider, registered address, and contact for contractual notices.',
      ],
      bullets: [
        'Do not invent a company name, registration number, or jurisdiction on this page.',
        'Until confirmed, treat “CopyOdds” as a product brand name used on this website, not as a verified legal entity identifier.',
      ],
    },
    {
      id: 'services',
      title: '3. Description of Services',
      paragraphs: [
        'The marketing site provides research-oriented information about Polymarket wallets, copy-trading concepts, and links to open-source repositories.',
        'The trading application (where available) provides custodial trading wallets, deposit / withdraw flows, platform Gas packages, and automated copy execution as described in the Trust Center and in-app UI.',
      ],
      bullets: [
        'Copy trading does not remove market risk and does not guarantee matching a followed wallet’s results.',
        'Past performance, leaderboard rankings, and backtest or research curves are not promises of future returns.',
      ],
    },
    {
      id: 'eligibility',
      title: '4. Eligibility and account restrictions (pending confirmation)',
      bullets: [
        'Pending confirmation: age requirements, restricted jurisdictions, and KYC/AML obligations (if any).',
        'Pending confirmation: grounds for freezing, reviewing, or terminating accounts.',
        'Implemented product controls (for example geo-blocks or risk pauses) may already exist in the app; this draft does not expand them beyond what the live product enforces.',
      ],
    },
    {
      id: 'custody',
      title: '5. Custodial wallets and signing',
      paragraphs: [
        'CopyOdds uses a custodial trading-wallet model so copy orders can be signed automatically. Each user is provisioned with a dedicated custodial execution address and a Polymarket Deposit for trading collateral.',
        'Independent addresses do not mean non-custodial control. The platform signs qualifying Relayer message / typed-data operations through a remote wallet service. External wallet bind, private-key import, and direct EOA withdraw are disabled in the live product.',
      ],
      bullets: [
        'Withdrawals require authenticator (TOTP) authorization bound to destination and amount, subject to open-order / position / in-flight blockers as implemented.',
        'Without a withdraw authorization, day-to-day USDC.e outflows are limited to allowlisted recipients.',
      ],
    },
    {
      id: 'fees',
      title: '6. Fees (pending confirmation for contractual wording)',
      paragraphs: [
        'Product implementation today: users purchase platform Gas packages; qualifying live fills deduct platform Gas points at 0.5% of filled notional with 100 Gas points per USDC (example: 100 USDC filled notional → 50 Gas points ≈ 0.5 USDC). Unfilled, failed, or cancelled orders do not deduct platform Gas points. Manual redeem deducts after a successful on-chain redeem.',
      ],
      bullets: [
        'Platform Gas points are an in-app billing unit and are not blockchain network gas.',
        'Polymarket market taker fees and blockchain network fees (when applicable) are separate.',
        'Current product behavior does not charge a performance / profit-share fee or a separate platform withdrawal fee. Contractual commitments about “no fee forever,” refunds, or SLA must still be confirmed by operations / legal before being stated as binding Terms language.',
        'Affiliate or partnership commissions shown on marketing pages are not a user’s trading fees.',
      ],
    },
    {
      id: 'withdrawals',
      title: '7. Deposits and withdrawals (pending confirmation)',
      bullets: [
        'Deposit networks, supported assets, and Bridge paths follow the live app and Trust Center (Polygon custodial address / BSC Bridge EVM as applicable).',
        'Pending confirmation: contractual processing windows, failure remedies, and any chargebacks or reversal policy.',
        'This draft does not publish a guaranteed withdrawal SLA.',
      ],
    },
    {
      id: 'risks',
      title: '8. Risks and disclaimers',
      bullets: [
        'Digital-asset and prediction-market trading can result in partial or total loss of funds.',
        'Latency, slippage, sizing rules, risk skips, and Gas pauses can cause your results to differ from a followed wallet.',
        'Open-source publication improves inspectability; it is not a third-party security audit, certification, or insurance claim.',
        'Pending confirmation: any additional regulatory or consumer-protection notices required in specific regions.',
      ],
    },
    {
      id: 'liability',
      title: '9. Liability boundary (pending confirmation)',
      paragraphs: [
        'Pending confirmation: limitation of liability, indemnity, and force-majeure language suitable for the confirmed operating entity and jurisdictions.',
      ],
      bullets: [
        'Until confirmed, do not treat this draft as establishing caps, exclusions, or warranties beyond the factual product descriptions above.',
        'Third-party services (including Polymarket, blockchain networks, Relayer, bridges, and messaging apps) operate under their own terms.',
      ],
    },
    {
      id: 'disputes',
      title: '10. Governing law and disputes (pending confirmation)',
      bullets: [
        'Pending confirmation: governing law, venue, arbitration vs courts, and language of proceedings.',
        'Do not invent a jurisdiction on this page.',
      ],
    },
    {
      id: 'changes',
      title: '11. Changes',
      paragraphs: [
        'We may update this draft as product facts are confirmed. Material changes should be reflected with an updated “Last Updated” date. Final publication requires removal of the draft notice and confirmation of pending items.',
      ],
    },
    {
      id: 'contact',
      title: '12. Contact',
      paragraphs: [
        'For product and withdrawal questions, use the official Telegram and WhatsApp support entries published on the Trust Center.',
      ],
      contact: {
        application: 'CopyOdds',
        supportNote: 'Official support channels are listed on the Trust Center. Do not share private keys, seed phrases, or authenticator codes with anyone claiming to be support.',
        privacyUrl: 'https://copyodds.io/privacy',
        trustUrl: 'https://copyodds.io/trust',
      },
    },
  ],
  footer: {
    brand: 'CopyOdds',
    copyright: 'Draft Terms of Service — pending legal / operations confirmation. Not a finalized agreement.',
  },
}
