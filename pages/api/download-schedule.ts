// pages/api/download-schedule.ts

import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { parseISO, format } from 'date-fns';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { month, year } = req.query;

  // 1. Validate the query parameters
  if (!month || !year) {
    return res.status(400).json({ message: 'Month and year are required.' });
  }

  // 2. Define the path to the saved schedule file
  const filename = `schedule-${year}-${month}.json`;
  const filePath = path.join(process.cwd(), 'schedules', filename);

  try {
    // 3. Check if the file exists before attempting to read it
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Schedule not found. Please generate it first.' });
    }

    // 4. Read the JSON file and parse the data
    const scheduleData = fs.readFileSync(filePath, 'utf-8');
    const schedule = JSON.parse(scheduleData);

    // 5. Convert the JSON schedule to a format compatible with XLSX
    // We add 'Day' as the second header
    const worksheetData = [
      ['Date', 'Day', 'Assigned Persons'],
      ...Object.entries(schedule).map(([date, persons]) => {
        // Parse the date string and format it to get the day name
        const dateObj = parseISO(date);
        const dayOfWeek = format(dateObj, 'EEEE'); // 'EEEE' formats the day as a full name (e.g., 'Monday')
        return [date, dayOfWeek, (persons as string[]).join(', ')];
      }),
    ];

    // 6. Create a new workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'COB Schedule');

    // 7. Generate a buffer from the workbook
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 8. Set the appropriate headers for an Excel file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="cob-schedule-${year}-${month}.xlsx"`);
    
    // 9. Send the file buffer as the response
    res.send(buffer);

  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}