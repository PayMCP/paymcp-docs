import type {ComponentProps, ComponentType, ReactElement} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import styles from './index.module.css';

type Provider = {
  name: string;
  Logo: ComponentType<ComponentProps<'svg'>>;
};

type Feature = {
  title: string;
  description: string;
};

const providers: Provider[] = [
  {
    name: 'Stripe',
    Logo: require('@site/static/img/providers/stripe.svg').default,
  },
  {
    name: 'PayPal',
    Logo: require('@site/static/img/providers/paypal.svg').default,
  },
  {
    name: 'Square',
    Logo: require('@site/static/img/providers/square.svg').default,
  },
  {
    name: 'Adyen',
    Logo: require('@site/static/img/providers/adyen.svg').default,
  },
  {
    name: 'Coinbase',
    Logo: require('@site/static/img/providers/coinbase.svg').default,
  },
  {
    name: 'Walleot',
    Logo: require('@site/static/img/providers/walleot.svg').default,
  },
];

const features: Feature[] = [
  {
    title: 'Easy Integration',
    description:
      'Enable per-call or subscription billing for AI services with just two lines of code.',
  },
  {
    title: 'Universal Compatibility',
    description:
      'Works out-of-the-box with any MCP-compliant AI agent, ensuring broad applicability across platforms.',
  },
  {
    title: 'Flexible Payments',
    description:
      'Provider-agnostic support for Stripe, PayPal, crypto, Walleot, or your own custom gateway with just one adapter.',
  },
];

function HeroProviders(): ReactElement {
  return (
    <div className={styles.heroProviders}>
      <span className={styles.heroProvidersLabel}>Connect instantly with</span>
      <div className={styles.heroProvidersGrid}>
        {providers.map(({name, Logo}) => (
          <Logo
            key={name}
            className={styles.providerLogo}
            role="img"
            aria-label={name}
          />
        ))}
      </div>
    </div>
  );
}

function FeaturesSection(): ReactElement {
  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <div className={styles.featuresHeading}>
          <h3>
            Focus on building transformative agent experiences while PayMCP
            handles payment flows and provider orchestration.
          </h3>
        </div>
        <div className={styles.featuresGrid}>
          {features.map(({title, description}) => (
            <article key={title} className={styles.featureCard}>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCallToAction(): ReactElement {
  return (
    <section className={styles.finalCtaSection}>
      <div className="container">
        <div className={styles.finalCtaCard}>
          <h2>Launch payments for your AI agents today</h2>
          <p>
            Follow the Quickstart to wire up MCP tools, then explore the API
            reference to tailor the billing experience.
          </p>
          <div className={styles.ctaRow}>
            <Link className="button button--primary button--lg" to="/docs/quickstart">
              Start with the Quickstart
            </Link>
            <Link className="button button--secondary button--lg" to="/docs/api-reference">
              Explore the API
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactElement {
  return (
    <Layout
      title="PayMCP | Powering Payments for AI Agents"
      description="Monetize any MCP-compliant agent with two lines of code using PayMCP."
    >
      <header className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>PayMCP</span>
            <h1>Powering Payments for AI Agents</h1>
            <p className={styles.heroSubtitle}>
              Monetize any MCP-compliant agent with two lines of code.
            </p>
            <div className={styles.ctaRow}>
              <Link className="button button--primary button--lg" to="/docs">
                Read the Docs
              </Link>
            </div>
            <HeroProviders />
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <FeaturesSection />
        <FinalCallToAction />
      </main>
    </Layout>
  );
}
