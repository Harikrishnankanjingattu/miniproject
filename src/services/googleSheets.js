const SPREADSHEET_ID = '1Qa1QO9BUduwL5P3W_4ulaTHMfbeOwnrrp5UJkArA4d0';
const SHEET_NAME = 'Products';

export const readProductsFromGoogleSheets = async (token) => {
    if (!token) {
        console.warn('Google Token not provided. Using fallback or returning empty.');
        return [];
    }

    try {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/'${SHEET_NAME}'!A2:E`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const result = await response.json();

        if (!result.values) return [];

        return result.values.map((row, index) => ({
            id: `prod-${index}`,
            name: row[0] || 'Unnamed Product',
            details: row[1] || '',
            price: row[2] || '0',
            offeredPrice: row[3] || '',
            syncDate: row[4] || ''
        }));
    } catch (error) {
        console.error('Error reading from Sheets API:', error);
        return [];
    }
};

export const writeToGoogleSheetsAPI = async (payload, token) => {
    if (!token) return { success: false, error: 'Auth required' };

    const { action, data, row } = payload;
    const range = action === 'UPDATE' ? `'${SHEET_NAME}'!A${row}:E${row}` : `'${SHEET_NAME}'!A2:E2`;
    const method = action === 'UPDATE' ? 'PUT' : 'POST';
    const url = action === 'UPDATE'
        ? `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`
        : `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A2:E2:append?valueInputOption=USER_ENTERED`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                values: [data]
            })
        });

        const result = await response.json();
        return { success: true, result };
    } catch (error) {
        console.error('Error writing to Sheets API:', error);
        return { success: false, error: 'API Error' };
    }
};

// Keeping this for compatibility with other parts of the app if needed, 
// but preferring the direct REST API above.
export const writeToGoogleSheetsViaWebApp = async (data, webAppUrl) => {
    if (!webAppUrl) {
        console.warn('Google Apps Script Web App URL not provided.');
        return { success: false, error: 'Web App URL missing' };
    }

    try {
        // We use text/plain for the body to avoid CORS preflight (OPTIONS request)
        // Apps Script's doPost can still parse it with JSON.parse(e.postData.contents)
        const response = await fetch(webAppUrl, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(data)
        });

        // With no-cors, the response is opaque, so we assume success if no exception occurred
        return { success: true };
    } catch (error) {
        console.error('Error writing via Web App:', error);
        return { success: false, error: error.message || 'Network error' };
    }
};

// Existing lead reading function updated with new ID
export const readFromGoogleSheets = async () => {
    try {
        const range = `Sheet1!A:D`;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.values) {
            const [, ...rows] = data.values;
            return rows.map(row => ({
                name: row[0] || '',
                number: row[1] || '',
                remarks: row[2] || '',
                timestamp: row[3] || ''
            }));
        }
        return [];
    } catch (error) {
        return [];
    }
};
