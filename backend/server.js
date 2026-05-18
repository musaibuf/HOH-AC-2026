const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const app = express();
// Allow all origins for CORS (you can restrict this later to your frontend URL)
app.use(cors());
app.use(express.json());

const SHEET_ID = '1crpRVJlJx5KS11ybGtDmnfHZ7L1dYiRjWokeozY2A2c';

// Parse credentials from Environment Variable
let creds;
try {
  creds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
} catch (err) {
  console.error("Failed to parse GOOGLE_CREDENTIALS. Make sure it is set in Render.");
}

const serviceAccountAuth = new JWT({
  email: creds?.client_email,
  key: creds?.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Health check route for Render
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.post('/submit', async (req, res) => {
  const { shared, assessorData } = req.body;

  try {
    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    const buildRow = (assessorObj) => {
      const row = {
        'Candidate': shared.candidate ? shared.candidate['Full Name'] : 'N/A',
        'CNIC': shared.candidate ? shared.candidate['CNIC'] : 'N/A',
        'University': shared.candidate ? shared.candidate['University'] : 'N/A',
        'Date': shared.date,
        'Batch': shared.batch,
        'Assessor Name': assessorObj.assessor,
        'Star Candidate': assessorObj.starCandidate ? 'Yes' : 'No',
        'Comments': assessorObj.comments,
      };

      Object.entries(assessorObj.ratings).forEach(([key, val]) => {
        row[key] = val; 
      });

      return row;
    };

    const row1 = buildRow(assessorData[0]);
    const row2 = buildRow(assessorData[1]);

    await sheet.addRows([row1, row2]);

    res.status(200).send({ message: 'Success! Two rows added.' });
  } catch (error) {
    console.error('Error writing to sheet:', error);
    res.status(500).send({ error: error.message });
  }
});

// Use Render's port or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));