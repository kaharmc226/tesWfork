const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const express = require('express');
const app = express();
const { getSheetsClient, spreadsheetId, sheetRange } = require('./db');
const port = process.env.PORT || 5000;

app.use(express.json());

app.get('/hello', (req, res) => {
   res.send('Hello World!!');
})

//CREATE user
app.post('/users', async (req, res) => {
  console.log('Request body:', req.body);
  const { nama, email } = req.body;

  if (!nama || !email) {
    return res.status(400).json({ error: 'nama and email are required' });
  }

  try {
    const sheets = await getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: sheetRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[nama, email]],
      },
    });
    res.status(201).json({ message: 'User added' });
  } catch (error) {
    console.error('Append error:', error);
    res.status(500).json({ error: 'Failed to append user' });
  }
});

//READ
app.get('/users', async (req, res) => {
  try {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetRange,
    });

    const rows = response.data.values || [];
    const dataRows =
      rows.length &&
      rows[0][0] &&
      rows[0][0].toLowerCase() === 'nama' &&
      rows[0][1] &&
      rows[0][1].toLowerCase() === 'email'
        ? rows.slice(1)
        : rows;

    const users = dataRows.map(row => ({
      nama: row[0] || '',
      email: row[1] || '',
    }));

    res.json(users);
  } catch (error) {
    console.error('Read error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.listen(port, () => {
   console.log(`Example App Listen to ${port}`);
})

