// pages/index.tsx
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/WelcomePage.module.css';
import Image from 'next/image';
import React from 'react';

const WelcomePage: React.FC = () => {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/Scheduler');
  };

  return (
    <div>
      <Head>
        <title>Welcome to COB Scheduler</title>
        <meta name="description" content="Welcome page for the COB Runner Scheduler." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <h1 className={styles.title1}>Nib International Bank</h1>
        <h1 className={styles.title2}>IS Application Department</h1>
        <h1 className={styles.title3}>Monthly COB Scheduler</h1>
        <div className={styles.logoContainer}>
          <Image src="/logo.png" alt="Nib International Bank Logo" width={200} height={200} />
        </div>
        <button className={styles.button} onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;