import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'PayMCP',
      collapsed: false,
      items: [
        'index',
        'quickstart',
        'concepts-and-flows',
        'api-reference',
        {
          type: 'category',
          label: 'Providers',
          items: [
            'providers/walleot',
            'providers/stripe',
            'providers/paypal',
            'providers/square',
            'providers/adyen',
            'providers/coinbase',
          ],
        },
        {
          type: 'category',
          label: 'Examples',
          items: [
            'examples/pay-per-request',
            'examples/subscription-demo',
          ],
        },
        'troubleshooting',
      ],
    },
  ],
};

export default sidebars;
