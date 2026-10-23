import { SdkMethodDoc } from './types/sdk.js';

export const SDK_METHOD_CATALOG: SdkMethodDoc[] = [
  {
    name: 'ZOHO.embeddedApp.init',
    category: 'embeddedApp',
    signature: 'ZOHO.embeddedApp.init(): Promise<void>',
    description: 'Initializes the widget lifecycle and notifies the parent Zoho CRM host that the widget is ready.',
    status: 'simulated',
    supportedInSimulation: true,
    example: 'ZOHO.embeddedApp.init().then(() => {\n  console.log("Widget initialized");\n});'
  },
  {
    name: 'ZOHO.embeddedApp.on',
    category: 'embeddedApp',
    signature: 'ZOHO.embeddedApp.on(eventName: string, callback: (data: any) => void): void',
    description: 'Registers an event listener for widget events like "PageLoad", "DialerActive", or custom CRM events.',
    status: 'simulated',
    supportedInSimulation: true,
    example: 'ZOHO.embeddedApp.on("PageLoad", function(data) {\n  console.log("Entity:", data.Entity, "ID:", data.EntityId);\n});'
  },
  {
    name: 'ZOHO.embeddedApp.Trigger',
    category: 'embeddedApp',
    signature: 'ZOHO.embeddedApp.Trigger(eventName: string, data: any): void',
    description: 'Triggers a custom event across widget components or parent frame listeners.',
    status: 'simulated',
    supportedInSimulation: true,
    example: 'ZOHO.embeddedApp.Trigger("custom_event", { message: "RefreshNeeded" });'
  },
  {
    name: 'ZOHO.CRM.API.getRecord',
    category: 'CRM.API',
    signature: 'ZOHO.CRM.API.getRecord({ Entity: string, RecordID: string }): Promise<ZohoRecordResponse>',
    description: 'Fetches full details of a specific record by its Zoho CRM Entity module and unique RecordID.',
    status: 'simulated',
    supportedInSimulation: true,
    example: 'ZOHO.CRM.API.getRecord({ Entity: "Deals", RecordID: "548291000001234001" })\n  .then(function(response) {\n    console.log("Record:", response.data[0]);\n  });'
  },
  {
    name: 'ZOHO.CRM.API.getAllRecords',
    category: 'CRM.API',
    signature: 'ZOHO.CRM.API.getAllRecords({ Entity: string, sort_order?: "asc" | "desc", page?: number, per_page?: number }): Promise<ZohoRecordResponse>',
    description: 'Fetches paginated list of records from the specified CRM module.',
    status: 'simulated',
    supportedInSimulation: true,
    example: 'ZOHO.CRM.API.getAllRecords({ Entity: "Contacts", page: 1, per_page: 20 })\n  .then(function(res) {\n    console.log("Records:", res.data);\n  });'
  },
  {
    name: 'ZOHO.CRM.API.insertRecord',
    category: 'CRM.API',
    signature: 'ZOHO.CRM.API.insertRecord({ Entity: string, APIData: Record<string, any> }): Promise<ZohoActionResponse>',
    description: 'Creates a new record in the specified CRM module with the supplied field data.',
    status: 'simulated',
    supportedInSimulation: true,
    example: 'ZOHO.CRM.API.insertRecord({\n  Entity: "Leads",\n  APIData: { First_Name: "Jane", Last_Name: "Doe", Email: "jane@example.com", Company: "Acme Corp" }\n}).then(console.log);'
  },
  {
    name: 'ZOHO.CRM.API.updateRecord',
    category: 'CRM.API',
    signature: 'ZOHO.CRM.API.updateRecord({ Entity: string, APIData: Record<string, any> }): Promise<ZohoActionResponse>',
    description: 'Updates an existing record. The APIData object must include the target "id".',
    status: 'simulated',
    supportedInSimulation: true,
    example: 'ZOHO.CRM.API.updateRecord({\n  Entity: "Deals",\n  APIData: { id: "548291000001234001", Stage: "Closed Won", Amount: 75000 }\n}).then(console.log);'
  },
  {
    name: 'ZOHO.CRM.API.deleteRecord',
    category: 'CRM.API',
    signature: 'ZOHO.CRM.API.deleteRecord({ Entity: string, RecordID: string }): Promise<ZohoActionResponse>',
    description: 'Deletes a record from the specified module using its RecordID.',
    status: 'simulated',
    supportedInSimulation: true,
    example: 'ZOHO.CRM.API.deleteRecord({ Entity: "Tasks", RecordID: "548291000001234099" }).then(console.log);'
  },
  {
    name: 'ZOHO.CRM.API.searchRecord',
    category: 'CRM.API',
    signature: 'ZOHO.CRM.API.searchRecord({ Entity: string, Type: "criteria" | "email" | "phone" | "word", Query: string, page?: number, per_page?: number }): Promise<ZohoRecordResponse>',
    description: 'Searches for records within a module matching search text, email, phone, or criteria.',
    status: 'simulated',
    supportedInSimulation: true,
    example: 'ZOHO.CRM.API.searchRecord({ Entity: "Contacts", Type: "email", Query: "alex@example.com" }).then(console.log);'
  },
  {
    name: 'ZOHO.CRM.UI.Record.open',
    category: 'CRM.UI',
    signature: 'ZOHO.CRM.UI.Record.open({ Entity: string, RecordID: string }): Promise<void>',
    description: 'Navigates the parent CRM window to the standard record detail view for the specified entity.',
    status: 'simulated',
    supportedInSimulation: true,
    example: 'ZOHO.CRM.UI.Record.open({ Entity: "Deals", RecordID: "548291000001234001" });'
  },
  {
    name: 'ZOHO.CRM.UI.Popup.close',
    category: 'CRM.UI',
    signature: 'ZOHO.CRM.UI.Popup.close(): Promise<void>',
    description: 'Closes the current widget popup or modal window.',
    status: 'simulated',
    supportedInSimulation: true,
    example: 'ZOHO.CRM.UI.Popup.close();'
  },
  {
    name: 'ZOHO.CRM.UI.Popup.closeReload',
    category: 'CRM.UI',
    signature: 'ZOHO.CRM.UI.Popup.closeReload(): Promise<void>',
    description: 'Closes the widget modal window and reloads the underlying CRM record page.',
    status: 'simulated',
    supportedInSimulation: true,
    example: 'ZOHO.CRM.UI.Popup.closeReload();'
  },
  {
    name: 'ZOHO.CRM.CONFIG.getCurrentUser',
    category: 'CRM.CONFIG',
    signature: 'ZOHO.CRM.CONFIG.getCurrentUser(): Promise<{ users: CRMUser[] }>',
    description: 'Returns profile, name, email, and permissions of the currently authenticated CRM user.',
    status: 'simulated',
    supportedInSimulation: true,
    example: 'ZOHO.CRM.CONFIG.getCurrentUser().then(res => console.log("User:", res.users[0]));'
  },
  {
    name: 'ZOHO.CRM.CONFIG.getOrgInfo',
    category: 'CRM.CONFIG',
    signature: 'ZOHO.CRM.CONFIG.getOrgInfo(): Promise<{ org: CRMOrgInfo[] }>',
    description: 'Returns metadata for the current Zoho CRM organization, including company name and primary currency.',
    status: 'simulated',
    supportedInSimulation: true,
    example: 'ZOHO.CRM.CONFIG.getOrgInfo().then(res => console.log("Org:", res.org[0]));'
  },
  {
    name: 'ZOHO.CRM.CONNECTIONS.invoke',
    category: 'CRM.CONNECTIONS',
    signature: 'ZOHO.CRM.CONNECTIONS.invoke(connName: string, reqData: any): Promise<any>',
    description: 'Invokes configured third-party integration connections registered in Zoho CRM Developer Space.',
    status: 'real_only',
    supportedInSimulation: false,
    example: 'ZOHO.CRM.CONNECTIONS.invoke("slack_integration", { text: "Hello" }).then(console.log);'
  },
  {
    name: 'ZOHO.CRM.BLUEPRINT.proceed',
    category: 'CRM.API',
    signature: 'ZOHO.CRM.BLUEPRINT.proceed(): Promise<any>',
    description: 'Transitions a record through its active CRM Blueprint stage.',
    status: 'unsupported',
    supportedInSimulation: false,
    example: '// Blueprint transition is only available in live CRM with configured blueprint flows'
  }
];
