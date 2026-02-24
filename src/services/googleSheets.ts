const SPREADSHEET_ID = '1Qa1QO9BUduwL5P3W_4ulaTHMfbeOwnrrp5UJkArA4d0';
const SHEET_NAME = 'Products';

export const readProductsFromGoogleSheets = async (token: string | null) => {
  if (!token) return [];
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/'${SHEET_NAME}'!A2:E`,
      { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    const result = await response.json();
    if (!result.values) return [];
    return result.values.map((row: string[], index: number) => ({
      id: `prod-${index}`, name: row[0] || 'Unnamed Product',
      details: row[1] || '', price: row[2] || '0',
      offeredPrice: row[3] || '', syncDate: row[4] || ''
    }));
  } catch (error) {
    console.error('Error reading from Sheets API:', error);
    return [];
  }
};

export const writeToGoogleSheetsAPI = async (payload: any, token: string) => {
  if (!token) return { success: false, error: 'Auth required' };
  const { action, data, row } = payload;
  const range = action === 'UPDATE' ? `'${SHEET_NAME}'!A${row}:E${row}` : `'${SHEET_NAME}'!A2:E2`;
  const method = action === 'UPDATE' ? 'PUT' : 'POST';
  const url = action === 'UPDATE'
    ? `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`
    : `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A2:E2:append?valueInputOption=USER_ENTERED`;
  try {
    const response = await fetch(url, {
      method, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [data] })
    });
    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    return { success: false, error: 'API Error' };
  }
};

export const writeToGoogleSheetsViaWebApp = async (data: any, webAppUrl?: string) => {
  if (!webAppUrl) return { success: false, error: 'Web App URL missing' };
  try {
    await fetch(webAppUrl, {
      method: 'POST', mode: 'no-cors', cache: 'no-cache',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error' };
  }
};

export const readFromGoogleSheets = async (token: string | null) => {
  if (!token) return [];
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!A:D`;
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    if (data.values) {
      const [, ...rows] = data.values;
      return rows.map((row: string[]) => ({
        name: row[0] || '', number: row[1] || '', remarks: row[2] || '', timestamp: row[3] || ''
      }));
    }
    return [];
  } catch (error) {
    return [];
  }
};
