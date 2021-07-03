import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import React from 'react';
import App from '../components/test/App';

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`MyAlgo Connect ${siteConfig.title}`}
      description="MyAlgo Connect Documentation">
      <App />
    </Layout>
  );
}
