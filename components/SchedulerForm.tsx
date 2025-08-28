// components/SchedulerForm.tsx
import React, { useState } from 'react';
import styles from '../styles/SchedulerForm.module.css';
import { parseISO, format } from 'date-fns';

interface Schedule {
  [date: string]: string[];
}

const SchedulerForm: React.FC = () => {
  const [employees, setEmployees] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // ⭐ New state variable for holidays
  const [holidays, setHolidays] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSchedule(null);
    setIsLoading(true);

    const employeeList = employees.split(',').map(emp => emp.trim()).filter(emp => emp.length > 0);
    // ⭐ Parse holidays from the input
    const holidayList = holidays.split(',').map(h => h.trim()).filter(h => h.length > 0);

    if (employeeList.length < 2) {
      setError('Please enter at least two employees.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month: Number(month),
          year: Number(year),
          employees: employeeList,
          holidays: holidayList, // ⭐ Include holidays in the API request
        }),
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

  const handleDownload = () => {
    window.location.href = `/api/download-schedule?month=${month}&year=${year}`;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>COB Runner Scheduler</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="employees">Employees (comma-separated):</label>
          <textarea
            id="employees"
            value={employees}
            onChange={(e) => setEmployees(e.target.value)}
            rows={4}
            placeholder="e.g., Alice, Bob, Charlie"
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
        <button className={styles.button} type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Schedule'}
        </button>
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
    </div>
  );
};

export default SchedulerForm;