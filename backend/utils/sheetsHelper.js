import { google } from 'googleapis'
import dotenv from 'dotenv'

dotenv.config()

const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  null,
  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/spreadsheets']
)

const sheets = google.sheets({ version: 'v4', auth })

// Append a row to a sheet
export async function appendToSheet(sheetId, sheetName, values) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  })
}

// Update a specific cell by finding row with matching email
export async function updatePaymentStatus(sheetId, sheetName, email, status) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sheetName}!A:F`,
  })
  const rows = response.data.values || []
  const rowIndex = rows.findIndex((row) => row[2] === email)
  if (rowIndex === -1) return

  // Column F (index 5) = payment status
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${sheetName}!F${rowIndex + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[status]] },
  })
}
