// pages/scheduler.tsx
import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/SchedulerForm.module.css';
import { parseISO, format } from 'date-fns';

interface Schedule {
  [date: string]: string[];
}

const SchedulerPage: React.FC = () => {
  const router = useRouter();
  const [employees, setEmployees] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [holidays, setHolidays] = useState('');
  const [numAssignees, setNumAssignees] = useState<number>(2);

  const getFormData = () => {
    return {
      month: Number(month),
      year: Number(year),
      employees: employees.split(',').map(emp => emp.trim()).filter(emp => emp.length > 0),
      holidays: holidays.split(',').map(h => h.trim()).filter(h => h.length > 0),
      numAssignees: numAssignees,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSchedule(null);
    setIsLoading(true);

    const formData = getFormData();
    if (formData.employees.length < numAssignees) {
      setError(`Please enter at least ${numAssignees} employees.`);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to generate schedule.');
      }
      setSchedule(data.schedule);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    setError('');
    const formData = getFormData();
    
    // ⭐ Make a POST request to the API with the download flag
    try {
      const res = await fetch('/api/generate-schedule?download=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (!res.ok) {
        throw new Error('Failed to download the schedule.');
      }
  
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Monthly_COB_Schedule.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during download.');
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div>
      <Head>
        <title>COB Runner Scheduler</title>
        <meta name="description" content="An automatic scheduler for the Close of Business runner." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <h1 className={styles.title1}>Nib International Bank</h1>
        <h1 className={styles.title2}>IS Application Department</h1>
        <h1 className={styles.title}>Monthly COB Scheduler</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="employees">Employees (comma-separated):</label>
            <textarea
              id="employees"
              value={employees}
              onChange={(e) => setEmployees(e.target.value)}
              rows={4}
              placeholder="e.g., Fkremariam, Kalkidan, Alemayehu,..."
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="numAssignees">Number of Employees per day:</label>
            <input
              id="numAssignees"
              type="number"
              value={numAssignees}
              onChange={(e) => setNumAssignees(parseInt(e.target.value, 10))}
              min="1"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="holidays">Additional Holidays (comma-separated, YYYY-MM-DD):</label>
            <textarea
              id="holidays"
              value={holidays}
              onChange={(e) => setHolidays(e.target.value)}
              rows={2}
              placeholder="e.g., 2025-01-01, 2025-12-25"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="month">Month:</label>
            <input
              id="month"
              type="number"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              min="1"
              max="12"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="year">Year:</label>
            <input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min="2024"
              required
            />
          </div>
          <div className={styles.buttonContainer}>
            <button className={`${styles.button} ${styles.backButton}`} type="button" onClick={handleBack}>
              Back
            </button>
            <button className={styles.button} type="submit" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Schedule'}
            </button>
          </div>
        </form>

        {error && <div className={styles.error}>{error}</div>}

        {schedule && (
          <div className={styles.results}>
            <h2 className={styles.subtitle}>Generated Schedule</h2>
            <table className={styles.scheduleTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Assigned Persons</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(schedule).map(([date, persons]) => {
                  const dateObj = parseISO(date);
                  const dayOfWeek = format(dateObj, 'EEEE');
                  return (
                    <tr key={date}>
                      <td>{date}</td>
                      <td>{dayOfWeek}</td>
                      <td>{persons.join(', ')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button className={styles.button} onClick={handleDownload}>
              Download as Excel
            </button>
          </div>
        )}

        <footer className={styles.footer}>
          <p>&copy; 2025 IS Application Department, Nib International Bank. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default SchedulerPage;
