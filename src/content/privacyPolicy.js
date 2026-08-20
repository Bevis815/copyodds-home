/** English Privacy Policy copy (shown for all locales until translated). */
export const PRIVACY_POLICY = {
  title: 'Privacy Policy',
  lastUpdated: 'August 20, 2026',
  intro: [
    'CopyOdds ("CopyOdds", "we", "us", or "our") respects your privacy and is committed to protecting your personal information.',
    'This Privacy Policy explains how CopyOdds collects, uses, stores, shares, and protects information when you use the CopyOdds website, mobile application, and related services (collectively, the "Services").',
    'By using the Services, you acknowledge that you have read and understood this Privacy Policy.',
  ],
  sections: [
    {
      id: 'information-we-collect',
      title: '1. Information We Collect',
      intro: 'Depending on how you use the Services, we may collect the following categories of information.',
      subsections: [
        {
          title: '1.1 Account Information',
          paragraphs: ['When you create or use a CopyOdds account, we may collect:'],
          bullets: [
            'Email address or other account identifiers used for authentication;',
            'Account ID and authentication information;',
            'Login and security information;',
            'User preferences and application settings;',
            'Information you provide when contacting our support team.',
          ],
          afterBullets: [
            'We use this information to create and manage your account, authenticate you, provide the Services, maintain account security, and communicate with you about your account.',
          ],
        },
        {
          title: '1.2 Wallet and Blockchain Information',
          paragraphs: [
            'If you use blockchain-related features, CopyOdds may process publicly available blockchain information, including:',
          ],
          bullets: [
            'Public blockchain wallet addresses;',
            'Blockchain transaction hashes;',
            'Token balances and blockchain asset information;',
            'Trading and transaction records;',
            'On-chain activity associated with a wallet address;',
            'Network information such as blockchain network and chain identifiers.',
          ],
          afterBullets: [
            'Blockchain transactions and wallet addresses may be publicly visible on the relevant blockchain network. Blockchain information may therefore be accessible to third parties independently of CopyOdds.',
            'CopyOdds does not treat a public blockchain address as a password or authentication credential.',
          ],
        },
        {
          title: '1.3 Trading and Copy Trading Information',
          paragraphs: [
            'When you use CopyOdds trading or copy trading features, we may collect and process information such as:',
          ],
          bullets: [
            'Followed trader or strategy information;',
            'Trading activity and order information;',
            'Trade execution records;',
            'Position information;',
            'Transaction status and history;',
            'Trading preferences and copy trading settings;',
            'Performance and statistical information associated with your account.',
          ],
          afterBullets: ['This information is used to provide, maintain, and improve the Services.'],
        },
        {
          title: '1.4 Device and Technical Information',
          paragraphs: ['When you access our Services, we may automatically collect certain technical information, including:'],
          bullets: [
            'IP address;',
            'Device type and operating system;',
            'Browser or application version;',
            'Language and regional settings;',
            'Application crash information;',
            'Log information;',
            'Network information;',
            'Approximate location derived from IP address where necessary for security or service operations.',
          ],
          afterBullets: [
            'We use this information to maintain service availability, detect abuse, troubleshoot technical problems, improve performance, and protect our Services.',
          ],
        },
        {
          title: '1.5 Usage Information',
          paragraphs: ['We may collect information about how you interact with our Services, including:'],
          bullets: [
            'Pages or screens viewed;',
            'Features used;',
            'Actions performed within the application;',
            'Session information;',
            'Error and diagnostic information.',
          ],
          afterBullets: [
            'We use this information to understand product usage, improve functionality, and maintain security.',
          ],
        },
      ],
    },
    {
      id: 'how-we-use-information',
      title: '2. How We Use Information',
      intro: 'We may use collected information for the following purposes:',
      bullets: [
        'Providing and operating the CopyOdds Services;',
        'Creating and managing user accounts;',
        'Authenticating users and maintaining account security;',
        'Providing copy trading and trading-related functionality;',
        'Processing and displaying transaction and blockchain information;',
        'Maintaining and displaying trading records and portfolio information;',
        'Providing customer support;',
        'Detecting and preventing fraud, abuse, unauthorized activity, and security incidents;',
        'Monitoring and improving system performance;',
        'Troubleshooting technical issues;',
        'Developing and improving our products and services;',
        'Complying with applicable laws, regulations, legal obligations, and lawful requests;',
        'Enforcing our Terms of Service and other applicable policies.',
      ],
      afterBullets: [
        'We do not use personal information for purposes that are incompatible with the purposes described in this Privacy Policy unless we provide appropriate notice and obtain consent where required by applicable law.',
      ],
    },
    {
      id: 'information-sharing',
      title: '3. Information Sharing',
      intro:
        'We may share information with the following categories of recipients when reasonably necessary to provide or protect the Services.',
      subsections: [
        {
          title: '3.1 Service Providers',
          paragraphs: ['We may use trusted third-party service providers for services such as:'],
          bullets: [
            'Cloud hosting and infrastructure;',
            'Database and storage services;',
            'Authentication services;',
            'Analytics and monitoring;',
            'Security and fraud prevention;',
            'Customer support;',
            'Communication and email delivery;',
            'Blockchain and RPC infrastructure.',
          ],
          afterBullets: [
            'These service providers may process information on our behalf and are expected to handle information in accordance with applicable privacy and security requirements.',
          ],
        },
        {
          title: '3.2 Blockchain Networks and Related Services',
          paragraphs: ['Certain blockchain transactions and wallet activities are inherently public.'],
          afterBullets: [
            'When you use blockchain-related functionality, relevant transaction information may be transmitted to blockchain networks, blockchain nodes, RPC providers, or other infrastructure providers necessary to process or retrieve blockchain data.',
            'Blockchain networks are decentralized systems and information recorded on a public blockchain may not be capable of being deleted or modified.',
          ],
        },
        {
          title: '3.3 Legal and Compliance Requirements',
          paragraphs: ['We may disclose information when reasonably necessary to:'],
          bullets: [
            'Comply with applicable laws or regulations;',
            'Respond to valid legal processes;',
            'Respond to lawful requests from government authorities;',
            'Detect, prevent, or investigate fraud or security incidents;',
            'Protect the rights, property, or safety of CopyOdds, our users, or others.',
          ],
        },
        {
          title: '3.4 Business Transfers',
          afterBullets: [
            'If CopyOdds is involved in a merger, acquisition, financing, reorganization, sale of assets, or similar business transaction, information may be transferred as part of that transaction, subject to applicable law.',
            'We do not sell personal information to third parties for their independent marketing purposes.',
          ],
        },
      ],
    },
    {
      id: 'data-security',
      title: '4. Data Security',
      intro:
        'We take reasonable technical and organizational measures to protect information against unauthorized access, loss, misuse, alteration, or disclosure.',
      paragraphs: ['Depending on the nature of the information, security measures may include:'],
      bullets: [
        'Encryption of data transmitted over networks using HTTPS/TLS;',
        'Access controls and authentication mechanisms;',
        'Restricted access to production systems;',
        'Security monitoring and logging;',
        'Infrastructure and application security controls;',
        'Protection of sensitive credentials and authentication information;',
        'Regular maintenance and security updates.',
      ],
      afterBullets: ['However, no Internet transmission or electronic storage system can be guaranteed to be completely secure.'],
    },
    {
      id: 'wallet-and-private-key-security',
      title: '5. Wallet and Private Key Security',
      afterBullets: [
        'CopyOdds may support blockchain-related functionality involving user wallets and transactions.',
        'Users are responsible for protecting their own wallet credentials, private keys, seed phrases, recovery phrases, and other authentication credentials that are not directly controlled by CopyOdds.',
        'CopyOdds will not ask you to disclose your private key or recovery phrase through customer support.',
        'If a private key or recovery phrase is compromised, blockchain transactions may be irreversible and CopyOdds may not be able to recover assets or reverse transactions.',
      ],
    },
    {
      id: 'data-retention',
      title: '6. Data Retention',
      intro:
        'We retain personal information only for as long as reasonably necessary to provide the Services, maintain legitimate business records, comply with legal obligations, resolve disputes, enforce agreements, and protect the security of our Services.',
      paragraphs: ['Retention periods may vary depending on:'],
      bullets: [
        'The type of information;',
        'The purpose for which it was collected;',
        'Legal and regulatory requirements;',
        'Security and fraud-prevention requirements;',
        'Whether the information is necessary to provide an active service.',
      ],
      afterBullets: [
        'Public blockchain records are maintained by the relevant blockchain network and are generally not controlled or removable by CopyOdds.',
      ],
    },
    {
      id: 'account-and-data-deletion',
      title: '7. Account and Data Deletion',
      afterBullets: [
        'If you have a CopyOdds account, you may request deletion of your account and associated personal information.',
        'To request account deletion, contact us using the privacy contact information provided below or use the account deletion functionality provided within the CopyOdds application, where available.',
        'When we receive a valid deletion request, we will take reasonable steps to delete or anonymize personal information associated with the account, subject to applicable legal, regulatory, security, fraud-prevention, and legitimate business requirements.',
        'Certain information may need to be retained where required by law or reasonably necessary for legal claims, security, fraud prevention, dispute resolution, or other lawful purposes.',
        'Information recorded on public blockchains cannot generally be deleted or modified by CopyOdds because such records are maintained by decentralized blockchain networks.',
      ],
    },
    {
      id: 'cookies-and-similar-technologies',
      title: '8. Cookies and Similar Technologies',
      intro: 'Our website and Services may use cookies, local storage, SDKs, or similar technologies to:',
      bullets: [
        'Maintain authentication sessions;',
        'Remember user preferences;',
        'Maintain security;',
        'Understand application performance;',
        'Diagnose technical problems;',
        'Improve the Services.',
      ],
      afterBullets: [
        'You may be able to control certain cookie or storage settings through your browser or device settings. Disabling certain technologies may affect some functionality of the Services.',
      ],
    },
    {
      id: 'third-party-services-and-links',
      title: '9. Third-Party Services and Links',
      afterBullets: [
        'The Services may integrate with or provide access to third-party services, websites, blockchain networks, wallets, APIs, or infrastructure providers.',
        'Third-party services operate under their own privacy policies and terms. CopyOdds is not responsible for the privacy practices of third-party services that are not controlled by CopyOdds.',
        'We encourage users to review the privacy policies of third-party services before providing information to them.',
      ],
    },
    {
      id: 'childrens-privacy',
      title: "10. Children's Privacy",
      afterBullets: [
        'The Services are not directed to children.',
        'We do not knowingly collect personal information from children in violation of applicable law. If you believe that a child has provided personal information to us, please contact us so that we can take appropriate action.',
      ],
    },
    {
      id: 'international-data-transfers',
      title: '11. International Data Transfers',
      afterBullets: [
        'Depending on where you access the Services and where our service providers operate, information may be processed or stored in countries other than your country of residence.',
        'Where required by applicable law, we will implement appropriate safeguards for international transfers of personal information.',
      ],
    },
    {
      id: 'your-privacy-rights',
      title: '12. Your Privacy Rights',
      intro:
        'Depending on your jurisdiction, you may have certain rights regarding your personal information, including rights to:',
      bullets: [
        'Access your personal information;',
        'Request correction of inaccurate information;',
        'Request deletion of personal information;',
        'Request restriction of certain processing;',
        'Object to certain processing;',
        'Request portability of certain information;',
        'Withdraw consent where processing is based on consent.',
      ],
      afterBullets: [
        'These rights may be subject to applicable legal limitations and exceptions.',
        'To exercise applicable privacy rights, please contact us using the information below.',
      ],
    },
    {
      id: 'changes-to-this-privacy-policy',
      title: '13. Changes to This Privacy Policy',
      afterBullets: [
        'We may update this Privacy Policy from time to time to reflect changes to our Services, technology, legal requirements, or privacy practices.',
        'When we make changes, we will update the "Last Updated" date at the top of this Privacy Policy.',
        'If material changes are made, we may provide additional notice through the Services or other appropriate means where required by applicable law.',
      ],
    },
    {
      id: 'contact-us',
      title: '14. Contact Us',
      intro:
        'If you have questions about this Privacy Policy, our privacy practices, or wish to request access, correction, or deletion of your personal information, please contact us:',
      contact: {
        application: 'CopyOdds',
        email: 'privacy@copyodds.com',
        policyUrl: 'https://copyodds.com/privacy',
      },
      afterBullets: [
        'We will review and respond to privacy requests within a reasonable period and in accordance with applicable law.',
      ],
    },
  ],
  footer: {
    brand: 'CopyOdds',
    copyright: '© 2026 CopyOdds. All rights reserved.',
  },
}
