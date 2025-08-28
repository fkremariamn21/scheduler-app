import SchedulerForm from '../components/SchedulerForm';
import Head from 'next/head';
import React from 'react';

const Home: React.FC = () => {
  return (
    <div>
      <Head>
        <title>COB Runner Scheduler</title>
        <meta name="description" content="An automatic scheduler for the Close of Business runner." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <SchedulerForm />
      </main>
    </div>
  );
};

export default Home;