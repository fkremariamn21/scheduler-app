// pages/api/generate-schedule.ts

import { getDaysInMonth, isSunday, format } from 'date-fns';
import type { NextApiRequest, NextApiResponse } from 'next';

// Sample holidays.
const staticHolidays = [
  '2025-01-01', // New Year's Day
  '2025-02-17', // President's Day
  '2025-05-26', // Memorial Day
  '2025-07-04', // Independence Day
  '2025-09-01', // Labor Day
  '2025-11-27', // Thanksgiving
  '2025-11-28', // Day after Thanksgiving
  '2025-12-25', // Christmas Day
];

// Type for the schedule object
type Schedule = { [date: string]: string[] };

// Function to shuffle an array (Fisher-Yates shuffle)
const shuffleArray = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { month, year, employees, holidays, numAssignees } = req.body;

  if (
    !month ||
    !year ||
    !Array.isArray(employees) ||
    employees.length < numAssignees
  ) {
    return res.status(400).json({ message: `Invalid input: month, year, and at least ${numAssignees} employees are required.` });
  }

  const allHolidays = [...staticHolidays, ...(holidays || [])];

  const isBusinessDay = (date: Date): boolean => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return !isSunday(date) && !allHolidays.includes(formattedDate);
  };

  try {
    const numDaysInMonth = getDaysInMonth(new Date(year, month - 1));
    const schedule: Schedule = {};
    const assignmentCounts: { [key: string]: number } = employees.reduce((acc, emp) => ({ ...acc, [emp]: 0 }), {});

    for (let day = 1; day <= numDaysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);

      if (!isBusinessDay(currentDate)) {
        continue;
      }

      let availableEmployees = [...employees].sort((a, b) => assignmentCounts[a] - assignmentCounts[b]);

      if (availableEmployees.length < numAssignees) {
        availableEmployees = [...employees];
        shuffleArray(availableEmployees);
      }

      const assigned = availableEmployees.slice(0, numAssignees);
      
      assigned.forEach(emp => {
          assignmentCounts[emp]++;
      });

      schedule[format(currentDate, 'yyyy-MM-dd')] = assigned;
    }
    
    // ⭐ Removed all file system code (`fs` and `path` imports)
    return res.status(200).json({ schedule });

  } catch (error) {
    console.error('Schedule generation error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
