const axios = require('axios');
let salesforceToken = null;
const insertEndpoint = `${process.env.CRM_BASE_URL}/apexrest/RegistrationParticipant/`;
const updateEndpoint = `${process.env.CRM_BASE_URL}/apexrest/UpdateBulkRegistrationParticipant/`;
const getInvoiceUrlEndpoint = `${process.env.CRM_BASE_URL}/apexrest/getInvoiceUrl`;

async function getSalesforceToken() {
  try {
    const res = await fetch(`${process.env.CRM_BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: process.env.CRM_GRANT_TYPE,
        client_id: process.env.CRM_CLIENT_ID,
        client_secret: process.env.CRM_CLIENT_SECRET,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.access_token) {
      throw new Error(data.error_description || 'Salesforce token fetch failed');
    }

    salesforceToken = data.access_token;
    return salesforceToken;
  } catch (err) {
    console.error('Salesforce Auth Error:', err.message);
    throw err;
  }
}

async function insertIntoSalesforce(payload) {
  if (!salesforceToken) {
    await getSalesforceToken();
  }

  console.log("salesforceToken = ",salesforceToken);
  console.log("insertEndpoint = ",insertEndpoint);


  const doInsert = async () => {
  const res = await fetch(insertEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${salesforceToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch (e) {
    parsed = text;
  }

  const bodyText = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
  const isTokenExpired =
    res.status === 401 ||
    res.status === 403 ||
    bodyText.includes('INVALID_SESSION_ID') ||
    bodyText.toLowerCase().includes('session') && bodyText.toLowerCase().includes('expired');

  if (isTokenExpired) {
    return { retry: true };
  }

  if (!res.ok) {
    console.error('Salesforce Insert Error:', parsed);
    // throw new Error('Salesforce insert failed');
    throw new Error(typeof parsed === 'string' ? parsed : parsed?.error || 'Salesforce insert failed');
  }
 
  return { retry: false, data: parsed };
};

  // First try
  let result = await doInsert();

  // Retry once if session expired
  if (result.retry) {
    console.warn('Salesforce session expired, retrying after token refresh...');
    await getSalesforceToken();
    result = await doInsert();

    if (result.retry) {
      throw new Error('Salesforce insert failed after token refresh');
    }
  }

  return result.data;
}

async function updateSalesforceParticipant(delegatePayload) {
  if (!salesforceToken) {
    await getSalesforceToken();
  }

  const doUpdate = async () => {
    const res = await fetch(updateEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${salesforceToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([delegatePayload]), // Wrap single payload in array
    });

    const text = await res.text();
    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (e) {
      parsed = text;
    }

    const bodyText = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
    const isTokenExpired =
      res.status === 401 ||
      res.status === 403 ||
      bodyText.includes('INVALID_SESSION_ID') ||
      (bodyText.toLowerCase().includes('session') && bodyText.toLowerCase().includes('expired'));

    if (isTokenExpired) {
      return { retry: true };
    }

    if (!res.ok) {
      console.error('Salesforce Update Error:', parsed);
      // throw new Error('Salesforce update failed');
       throw new Error(typeof parsed === 'string' ? parsed : parsed?.error || 'Salesforce update failed');
    }

    return { retry: false, data: parsed };
  };

  // First try
  let result = await doUpdate();

  // Retry once if session expired
  if (result.retry) {
    console.warn('Salesforce session expired (update), retrying after token refresh...');
    await getSalesforceToken();
    result = await doUpdate();

    if (result.retry) {
      throw new Error('Salesforce update failed after token refresh');
    }
  }

  return result.data;
}

async function fetchInvoiceFromSalesforce(registrationPaymentId) {
  if (!salesforceToken) {
    await getSalesforceToken();
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchInvoice = async () => {
    console.log('salesforceToken = ', salesforceToken);
    console.log('JSON.stringify({ registrationPaymentId }) = ', JSON.stringify({ registrationPaymentId }));

    const res = await fetch(getInvoiceUrlEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${salesforceToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ registrationPaymentId }),
    });

    const text = await res.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      parsed = text;
    }

    const bodyText = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
    const isTokenExpired =
      res.status === 401 ||
      res.status === 403 ||
      bodyText.includes('INVALID_SESSION_ID') ||
      (bodyText.toLowerCase().includes('session') && bodyText.toLowerCase().includes('expired'));

    return {
      ok: res.ok,
      retry: !res.ok && !isTokenExpired,
      data: parsed,
    };
  };

  let result = await fetchInvoice();

  if (result.retry) {
    console.warn('Salesforce invoice fetch failed. Retrying after 5 seconds...');
    await sleep(5000);
    result = await fetchInvoice();
  }

  if (result.retry) {
    console.warn('Salesforce invoice fetch failed again. Retrying a third time after 5 seconds...');
    await sleep(5000);
    result = await fetchInvoice();
  }

  if (!result.ok) {
    console.error('Salesforce Invoice Fetch Final Error:', result.data);
    // throw new Error('Salesforce invoice fetch failed after 3 attempts');
    throw new Error(typeof result.data === 'string' ? result.data : result.data?.error || 'Salesforce invoice fetch failed after 3 attempts');
  }

  return result.data;
}

module.exports = {
  insertIntoSalesforce,
  getSalesforceToken, // optional if you also want to use it elsewhere
  updateSalesforceParticipant,
  fetchInvoiceFromSalesforce,
};
