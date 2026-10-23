export interface WidgetSnippet {
  id: string;
  title: string;
  category: 'Lifecycle' | 'CRM API' | 'CRM UI' | 'CRM Config' | 'Network & REST';
  description: string;
  code: string;
}

export const ZOHO_SNIPPETS: WidgetSnippet[] = [
  {
    id: 'snip_init',
    title: 'Initialize Zoho SDK',
    category: 'Lifecycle',
    description: 'Signals readiness to parent Zoho CRM host and resolves promise when ready.',
    code: `ZOHO.embeddedApp.init()
  .then(function() {
    console.log("Zoho CRM Widget initialized successfully");
  })
  .catch(function(err) {
    console.error("Initialization failed:", err);
  });`
  },
  {
    id: 'snip_pageload',
    title: 'Handle PageLoad Event',
    category: 'Lifecycle',
    description: 'Receives active Entity module name and current Record ID when widget opens on a record page.',
    code: `ZOHO.embeddedApp.on("PageLoad", function(data) {
  console.log("Widget PageLoad context:", data);
  var entity = data.Entity; // e.g. "Deals", "Contacts"
  var recordId = data.EntityId; // e.g. "548291000001234001"
  
  if (recordId) {
    // Load record details
  }
});`
  },
  {
    id: 'snip_get_record',
    title: 'Get Single Record by ID',
    category: 'CRM API',
    description: 'Retrieves all fields of a specific CRM record.',
    code: `ZOHO.CRM.API.getRecord({ Entity: "Deals", RecordID: recordId })
  .then(function(response) {
    var record = response.data[0];
    console.log("Retrieved record:", record);
  })
  .catch(function(error) {
    console.error("Failed to retrieve record:", error);
  });`
  },
  {
    id: 'snip_get_all_records',
    title: 'Get All Records (Pagination)',
    category: 'CRM API',
    description: 'Fetches paginated list of records from module.',
    code: `ZOHO.CRM.API.getAllRecords({ Entity: "Deals", sort_order: "desc", page: 1, per_page: 50 })
  .then(function(response) {
    var records = response.data || [];
    console.log("Fetched " + records.length + " records:", records);
  })
  .catch(function(error) {
    console.error("Failed to fetch records:", error);
  });`
  },
  {
    id: 'snip_insert_record',
    title: 'Insert New Record',
    category: 'CRM API',
    description: 'Creates a new CRM record with the provided field map.',
    code: `var newRecordData = {
  First_Name: "Jane",
  Last_Name: "Doe",
  Email: "jane.doe@company.demo",
  Company: "Acme Industrial"
};

ZOHO.CRM.API.insertRecord({ Entity: "Leads", APIData: newRecordData })
  .then(function(response) {
    var createdId = response.data[0].details.id;
    console.log("New record created with ID:", createdId);
  })
  .catch(function(error) {
    console.error("Insert failed:", error);
  });`
  },
  {
    id: 'snip_update_record',
    title: 'Update Existing Record',
    category: 'CRM API',
    description: 'Updates specific fields on an existing record. Must include id.',
    code: `var updateData = {
  id: targetRecordId,
  Stage: "Closed Won",
  Amount: 125000
};

ZOHO.CRM.API.updateRecord({ Entity: "Deals", APIData: updateData })
  .then(function(response) {
    console.log("Record updated successfully:", response);
  })
  .catch(function(error) {
    console.error("Update failed:", error);
  });`
  },
  {
    id: 'snip_delete_record',
    title: 'Delete Record',
    category: 'CRM API',
    description: 'Deletes a record from the module.',
    code: `ZOHO.CRM.API.deleteRecord({ Entity: "Tasks", RecordID: recordId })
  .then(function(response) {
    console.log("Record deleted:", response);
  })
  .catch(function(error) {
    console.error("Delete failed:", error);
  });`
  },
  {
    id: 'snip_search_record',
    title: 'Search Records',
    category: 'CRM API',
    description: 'Searches module by text query, phone, or email.',
    code: `ZOHO.CRM.API.searchRecord({ Entity: "Contacts", Type: "email", Query: "alex@example.com" })
  .then(function(response) {
    var matches = response.data || [];
    console.log("Search matches:", matches);
  });`
  },
  {
    id: 'snip_ui_open',
    title: 'Open Record in Native CRM',
    category: 'CRM UI',
    description: 'Navigates the parent CRM window to the standard record detail page.',
    code: `ZOHO.CRM.UI.Record.open({ Entity: "Deals", RecordID: recordId });`
  },
  {
    id: 'snip_ui_close',
    title: 'Close Modal Popup',
    category: 'CRM UI',
    description: 'Closes the widget popup/dialog.',
    code: `ZOHO.CRM.UI.Popup.close();`
  },
  {
    id: 'snip_config_user',
    title: 'Get Current Logged-in User',
    category: 'CRM Config',
    description: 'Fetches identity and role of active CRM user.',
    code: `ZOHO.CRM.CONFIG.getCurrentUser()
  .then(function(response) {
    var user = response.users[0];
    console.log("Current user:", user.name, user.email, user.role);
  });`
  },
  {
    id: 'snip_rest_fetch',
    title: 'Robust REST API Call with Retries',
    category: 'Network & REST',
    description: 'Fetches third-party API endpoint with exponential backoff on 5xx errors.',
    code: `async function fetchWithRetry(url, options = {}, retries = 3, backoff = 500) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      if (res.status >= 500 && retries > 0) {
        await new Promise(r => setTimeout(r, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw new Error("HTTP " + res.status + ": " + res.statusText);
    }
    return await res.json();
  } catch (err) {
    console.error("API Request failed:", err);
    throw err;
  }
}`
  }
];
