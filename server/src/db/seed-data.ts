import { CRMModuleSchema, CRMUser, CRMOrgInfo } from '@zoho-studio/shared';

export const DEFAULT_USER: CRMUser = {
  id: '548291000000287001',
  name: 'Alex Mercer',
  email: 'alex.mercer@innovatetech.demo',
  role: 'CEO',
  profile: 'Administrator',
  status: 'active'
};

export const DEFAULT_ORG: CRMOrgInfo = {
  id: '548291000000100001',
  company_name: 'Innovate Tech Solutions Demo',
  primary_email: 'admin@innovatetech.demo',
  currency_symbol: '$',
  time_zone: 'America/Los_Angeles',
  domain_name: 'innovatetech.zohocrm.com'
};

export const STANDARD_MODULES: CRMModuleSchema[] = [
  {
    api_name: 'Deals',
    singular_label: 'Deal',
    plural_label: 'Deals',
    is_custom: false,
    fields: [
      { api_name: 'Deal_Name', display_label: 'Deal Name', data_type: 'text', required: true },
      { api_name: 'Amount', display_label: 'Amount', data_type: 'currency', required: true },
      {
        api_name: 'Stage',
        display_label: 'Stage',
        data_type: 'picklist',
        required: true,
        pick_list_values: [
          { display_value: 'Qualification', actual_value: 'Qualification' },
          { display_value: 'Needs Analysis', actual_value: 'Needs Analysis' },
          { display_value: 'Value Proposition', actual_value: 'Value Proposition' },
          { display_value: 'Identify Decision Makers', actual_value: 'Identify Decision Makers' },
          { display_value: 'Proposal/Price Quote', actual_value: 'Proposal/Price Quote' },
          { display_value: 'Negotiation/Review', actual_value: 'Negotiation/Review' },
          { display_value: 'Closed Won', actual_value: 'Closed Won' },
          { display_value: 'Closed Lost', actual_value: 'Closed Lost' }
        ]
      },
      { api_name: 'Closing_Date', display_label: 'Closing Date', data_type: 'date', required: true },
      { api_name: 'Probability', display_label: 'Probability (%)', data_type: 'integer' },
      { api_name: 'Account_Name', display_label: 'Account Name', data_type: 'lookup', lookup_module: 'Accounts' },
      { api_name: 'Contact_Name', display_label: 'Contact Name', data_type: 'lookup', lookup_module: 'Contacts' },
      {
        api_name: 'Type',
        display_label: 'Type',
        data_type: 'picklist',
        pick_list_values: [
          { display_value: 'New Business', actual_value: 'New Business' },
          { display_value: 'Existing Business', actual_value: 'Existing Business' }
        ]
      },
      { api_name: 'Description', display_label: 'Description', data_type: 'textarea' }
    ]
  },
  {
    api_name: 'Contacts',
    singular_label: 'Contact',
    plural_label: 'Contacts',
    is_custom: false,
    fields: [
      { api_name: 'First_Name', display_label: 'First Name', data_type: 'text' },
      { api_name: 'Last_Name', display_label: 'Last Name', data_type: 'text', required: true },
      { api_name: 'Email', display_label: 'Email', data_type: 'email', required: true },
      { api_name: 'Phone', display_label: 'Phone', data_type: 'phone' },
      { api_name: 'Title', display_label: 'Title', data_type: 'text' },
      { api_name: 'Department', display_label: 'Department', data_type: 'text' },
      { api_name: 'Account_Name', display_label: 'Account Name', data_type: 'lookup', lookup_module: 'Accounts' },
      { api_name: 'Mailing_City', display_label: 'Mailing City', data_type: 'text' },
      { api_name: 'Mailing_Country', display_label: 'Mailing Country', data_type: 'text' }
    ]
  },
  {
    api_name: 'Accounts',
    singular_label: 'Account',
    plural_label: 'Accounts',
    is_custom: false,
    fields: [
      { api_name: 'Account_Name', display_label: 'Account Name', data_type: 'text', required: true },
      { api_name: 'Phone', display_label: 'Phone', data_type: 'phone' },
      { api_name: 'Website', display_label: 'Website', data_type: 'text' },
      {
        api_name: 'Industry',
        display_label: 'Industry',
        data_type: 'picklist',
        pick_list_values: [
          { display_value: 'Software', actual_value: 'Software' },
          { display_value: 'Finance', actual_value: 'Finance' },
          { display_value: 'Healthcare', actual_value: 'Healthcare' },
          { display_value: 'Manufacturing', actual_value: 'Manufacturing' },
          { display_value: 'Telecommunications', actual_value: 'Telecommunications' }
        ]
      },
      { api_name: 'Annual_Revenue', display_label: 'Annual Revenue', data_type: 'currency' },
      { api_name: 'Billing_City', display_label: 'Billing City', data_type: 'text' },
      { api_name: 'Billing_Country', display_label: 'Billing Country', data_type: 'text' }
    ]
  },
  {
    api_name: 'Leads',
    singular_label: 'Lead',
    plural_label: 'Leads',
    is_custom: false,
    fields: [
      { api_name: 'First_Name', display_label: 'First Name', data_type: 'text' },
      { api_name: 'Last_Name', display_label: 'Last Name', data_type: 'text', required: true },
      { api_name: 'Company', display_label: 'Company', data_type: 'text', required: true },
      { api_name: 'Email', display_label: 'Email', data_type: 'email' },
      { api_name: 'Phone', display_label: 'Phone', data_type: 'phone' },
      {
        api_name: 'Lead_Status',
        display_label: 'Lead Status',
        data_type: 'picklist',
        pick_list_values: [
          { display_value: 'Not Contacted', actual_value: 'Not Contacted' },
          { display_value: 'Contacted', actual_value: 'Contacted' },
          { display_value: 'Pre-Qualified', actual_value: 'Pre-Qualified' },
          { display_value: 'Attempted to Contact', actual_value: 'Attempted to Contact' }
        ]
      },
      { api_name: 'Annual_Revenue', display_label: 'Annual Revenue', data_type: 'currency' }
    ]
  },
  {
    api_name: 'Tasks',
    singular_label: 'Task',
    plural_label: 'Tasks',
    is_custom: false,
    fields: [
      { api_name: 'Subject', display_label: 'Subject', data_type: 'text', required: true },
      { api_name: 'Due_Date', display_label: 'Due Date', data_type: 'date' },
      {
        api_name: 'Status',
        display_label: 'Status',
        data_type: 'picklist',
        pick_list_values: [
          { display_value: 'Not Started', actual_value: 'Not Started' },
          { display_value: 'In Progress', actual_value: 'In Progress' },
          { display_value: 'Completed', actual_value: 'Completed' },
          { display_value: 'Deferred', actual_value: 'Deferred' }
        ]
      },
      {
        api_name: 'Priority',
        display_label: 'Priority',
        data_type: 'picklist',
        pick_list_values: [
          { display_value: 'High', actual_value: 'High' },
          { display_value: 'Normal', actual_value: 'Normal' },
          { display_value: 'Low', actual_value: 'Low' }
        ]
      },
      { api_name: 'What_Id', display_label: 'Related To', data_type: 'lookup' },
      { api_name: 'Description', display_label: 'Description', data_type: 'textarea' }
    ]
  },
  {
    api_name: 'Calls',
    singular_label: 'Call',
    plural_label: 'Calls',
    is_custom: false,
    fields: [
      { api_name: 'Subject', display_label: 'Subject', data_type: 'text', required: true },
      {
        api_name: 'Call_Type',
        display_label: 'Call Type',
        data_type: 'picklist',
        pick_list_values: [
          { display_value: 'Outbound', actual_value: 'Outbound' },
          { display_value: 'Inbound', actual_value: 'Inbound' },
          { display_value: 'Missed', actual_value: 'Missed' }
        ]
      },
      { api_name: 'Call_Start_Time', display_label: 'Call Start Time', data_type: 'datetime' },
      { api_name: 'Call_Duration', display_label: 'Call Duration (mins)', data_type: 'integer' },
      { api_name: 'Call_Purpose', display_label: 'Call Purpose', data_type: 'text' }
    ]
  },
  {
    api_name: 'Meetings',
    singular_label: 'Meeting',
    plural_label: 'Meetings',
    is_custom: false,
    fields: [
      { api_name: 'Title', display_label: 'Title', data_type: 'text', required: true },
      { api_name: 'From', display_label: 'From', data_type: 'datetime', required: true },
      { api_name: 'To', display_label: 'To', data_type: 'datetime', required: true },
      { api_name: 'Venue', display_label: 'Venue', data_type: 'text' },
      { api_name: 'Related_To', display_label: 'Related To', data_type: 'lookup' }
    ]
  },
  {
    api_name: 'Products',
    singular_label: 'Product',
    plural_label: 'Products',
    is_custom: false,
    fields: [
      { api_name: 'Product_Name', display_label: 'Product Name', data_type: 'text', required: true },
      { api_name: 'Product_Code', display_label: 'Product Code', data_type: 'text' },
      { api_name: 'Unit_Price', display_label: 'Unit Price', data_type: 'currency', required: true },
      { api_name: 'Qty_in_Stock', display_label: 'Qty in Stock', data_type: 'integer' },
      { api_name: 'Product_Active', display_label: 'Active', data_type: 'boolean' }
    ]
  }
];

export const INITIAL_RECORDS: Record<string, Array<Record<string, any>>> = {
  Accounts: [
    {
      id: '548291000001001001',
      Account_Name: 'Acme Global Enterprises',
      Phone: '+1-415-555-0190',
      Website: 'https://acme-global.demo',
      Industry: 'Manufacturing',
      Annual_Revenue: 12500000,
      Billing_City: 'San Francisco',
      Billing_Country: 'United States'
    },
    {
      id: '548291000001001002',
      Account_Name: 'Starlight Media Networks',
      Phone: '+1-212-555-0144',
      Website: 'https://starlight-media.demo',
      Industry: 'Telecommunications',
      Annual_Revenue: 8400000,
      Billing_City: 'New York',
      Billing_Country: 'United States'
    },
    {
      id: '548291000001001003',
      Account_Name: 'Nexus Cloud Systems',
      Phone: '+1-512-555-0177',
      Website: 'https://nexuscloud.demo',
      Industry: 'Software',
      Annual_Revenue: 24000000,
      Billing_City: 'Austin',
      Billing_Country: 'United States'
    },
    {
      id: '548291000001001004',
      Account_Name: 'Vertex Financial Group',
      Phone: '+44-20-7946-0921',
      Website: 'https://vertex-fin.demo',
      Industry: 'Finance',
      Annual_Revenue: 45000000,
      Billing_City: 'London',
      Billing_Country: 'United Kingdom'
    },
    {
      id: '548291000001001005',
      Account_Name: 'BioHealth Dynamics',
      Phone: '+1-617-555-0133',
      Website: 'https://biohealth-dynamics.demo',
      Industry: 'Healthcare',
      Annual_Revenue: 16800000,
      Billing_City: 'Boston',
      Billing_Country: 'United States'
    }
  ],
  Contacts: [
    {
      id: '548291000001002001',
      First_Name: 'Elena',
      Last_Name: 'Rostova',
      Email: 'elena.rostova@acme-global.demo',
      Phone: '+1-415-555-0191',
      Title: 'VP of Global Operations',
      Department: 'Operations',
      Account_Name: { id: '548291000001001001', name: 'Acme Global Enterprises' },
      Mailing_City: 'San Francisco',
      Mailing_Country: 'United States'
    },
    {
      id: '548291000001002002',
      First_Name: 'Marcus',
      Last_Name: 'Vance',
      Email: 'marcus.vance@starlight-media.demo',
      Phone: '+1-212-555-0145',
      Title: 'Chief Technology Officer',
      Department: 'Engineering',
      Account_Name: { id: '548291000001001002', name: 'Starlight Media Networks' },
      Mailing_City: 'New York',
      Mailing_Country: 'United States'
    },
    {
      id: '548291000001002003',
      First_Name: 'Samantha',
      Last_Name: 'Reed',
      Email: 'sam.reed@nexuscloud.demo',
      Phone: '+1-512-555-0178',
      Title: 'Director of Procurement',
      Department: 'Procurement',
      Account_Name: { id: '548291000001001003', name: 'Nexus Cloud Systems' },
      Mailing_City: 'Austin',
      Mailing_Country: 'United States'
    },
    {
      id: '548291000001002004',
      First_Name: 'Arthur',
      Last_Name: 'Pendleton',
      Email: 'a.pendleton@vertex-fin.demo',
      Phone: '+44-20-7946-0922',
      Title: 'Head of Information Systems',
      Department: 'IT',
      Account_Name: { id: '548291000001001004', name: 'Vertex Financial Group' },
      Mailing_City: 'London',
      Mailing_Country: 'United Kingdom'
    },
    {
      id: '548291000001002005',
      First_Name: 'Dr. Clara',
      Last_Name: 'Hensley',
      Email: 'c.hensley@biohealth-dynamics.demo',
      Phone: '+1-617-555-0134',
      Title: 'Chief Medical Officer',
      Department: 'Clinical Operations',
      Account_Name: { id: '548291000001001005', name: 'BioHealth Dynamics' },
      Mailing_City: 'Boston',
      Mailing_Country: 'United States'
    }
  ],
  Deals: [
    {
      id: '548291000001234001',
      Deal_Name: 'Enterprise Cloud Migration 2026',
      Amount: 185000,
      Stage: 'Negotiation/Review',
      Closing_Date: '2026-11-30',
      Probability: 80,
      Account_Name: { id: '548291000001001003', name: 'Nexus Cloud Systems' },
      Contact_Name: { id: '548291000001002003', name: 'Samantha Reed' },
      Type: 'Existing Business',
      Description: 'Migration of on-prem workload clusters to managed private cloud architecture with SLA tier 1.'
    },
    {
      id: '548291000001234002',
      Deal_Name: 'Global IoT Fleet Rollout',
      Amount: 320000,
      Stage: 'Proposal/Price Quote',
      Closing_Date: '2026-12-15',
      Probability: 60,
      Account_Name: { id: '548291000001001001', name: 'Acme Global Enterprises' },
      Contact_Name: { id: '548291000001002001', name: 'Elena Rostova' },
      Type: 'New Business',
      Description: 'Supply of 5,000 telemetry sensor hub units and real-time analytics dashboards.'
    },
    {
      id: '548291000001234003',
      Deal_Name: 'Broadband Streaming CDN Infrastructure',
      Amount: 95000,
      Stage: 'Closed Won',
      Closing_Date: '2026-10-14',
      Probability: 100,
      Account_Name: { id: '548291000001001002', name: 'Starlight Media Networks' },
      Contact_Name: { id: '548291000001002002', name: 'Marcus Vance' },
      Type: 'Existing Business',
      Description: 'Low-latency edge caching rollout across 12 strategic metro points of presence.'
    },
    {
      id: '548291000001234004',
      Deal_Name: 'Algorithmic Risk Engine License',
      Amount: 450000,
      Stage: 'Value Proposition',
      Closing_Date: '2027-01-20',
      Probability: 40,
      Account_Name: { id: '548291000001001004', name: 'Vertex Financial Group' },
      Contact_Name: { id: '548291000001002004', name: 'Arthur Pendleton' },
      Type: 'New Business',
      Description: 'High-frequency transaction surveillance and compliance anomaly detection suite.'
    },
    {
      id: '548291000001234005',
      Deal_Name: 'HIPAA Compliant Patient Portal App',
      Amount: 140000,
      Stage: 'Qualification',
      Closing_Date: '2026-12-31',
      Probability: 25,
      Account_Name: { id: '548291000001001005', name: 'BioHealth Dynamics' },
      Contact_Name: { id: '548291000001002005', name: 'Dr. Clara Hensley' },
      Type: 'New Business',
      Description: 'Mobile app for patient records, telemedicine consultation booking, and electronic prescriptions.'
    }
  ],
  Leads: [
    {
      id: '548291000001004001',
      First_Name: 'Darren',
      Last_Name: 'Chambers',
      Company: 'Omni Retail Solutions',
      Email: 'd.chambers@omniretail.demo',
      Phone: '+1-312-555-0182',
      Lead_Status: 'Pre-Qualified',
      Annual_Revenue: 5200000
    },
    {
      id: '548291000001004002',
      First_Name: 'Chloe',
      Last_Name: 'Bennett',
      Company: 'AeroDynamics Propulsion',
      Email: 'cbennett@aeroprop.demo',
      Phone: '+1-206-555-0199',
      Lead_Status: 'Contacted',
      Annual_Revenue: 18900000
    },
    {
      id: '548291000001004003',
      First_Name: 'Kenji',
      Last_Name: 'Takahashi',
      Company: 'Kyoto Robotics Corp',
      Email: 'takahashi@kyotorobotics.demo',
      Phone: '+81-75-555-0143',
      Lead_Status: 'Not Contacted',
      Annual_Revenue: 34000000
    }
  ],
  Tasks: [
    {
      id: '548291000001005001',
      Subject: 'Review contract SLA clauses with Nexus legal',
      Due_Date: '2026-10-28',
      Status: 'In Progress',
      Priority: 'High',
      What_Id: { id: '548291000001234001', name: 'Enterprise Cloud Migration 2026' },
      Description: 'Verify 99.99% uptime commitments with regional engineering team.'
    },
    {
      id: '548291000001005002',
      Subject: 'Send pricing schedule revision to Acme',
      Due_Date: '2026-10-26',
      Status: 'Not Started',
      Priority: 'Normal',
      What_Id: { id: '548291000001234002', name: 'Global IoT Fleet Rollout' },
      Description: 'Include volume tier discount options for hardware hubs.'
    }
  ],
  Calls: [
    {
      id: '548291000001006001',
      Subject: 'Discovery Call with Marcus Vance',
      Call_Type: 'Outbound',
      Call_Start_Time: '2026-10-22T14:00:00Z',
      Call_Duration: 35,
      Call_Purpose: 'Discuss bandwidth scaling during prime broadcast events'
    }
  ],
  Meetings: [
    {
      id: '548291000001007001',
      Title: 'Quarterly Executive Solution Architecture Sync',
      From: '2026-10-29T10:00:00Z',
      To: '2026-10-29T11:30:00Z',
      Venue: 'Zoom Room Alpha / Executive Conference Suite',
      Related_To: { id: '548291000001001003', name: 'Nexus Cloud Systems' }
    }
  ],
  Products: [
    {
      id: '548291000001008001',
      Product_Name: 'Cloud Orchestrator Enterprise',
      Product_Code: 'PRD-CLD-ENT',
      Unit_Price: 12000,
      Qty_in_Stock: 999,
      Product_Active: true
    },
    {
      id: '548291000001008002',
      Product_Name: 'Telemetry Gateway Unit V4',
      Product_Code: 'PRD-TEL-V4',
      Unit_Price: 650,
      Qty_in_Stock: 480,
      Product_Active: true
    },
    {
      id: '548291000001008003',
      Product_Name: '24/7 Priority Mission Support',
      Product_Code: 'SRV-SPT-247',
      Unit_Price: 24000,
      Qty_in_Stock: 100,
      Product_Active: true
    }
  ]
};

export const DEFAULT_MOCK_ENDPOINTS = [
  {
    id: 'mock-endpoint-weather',
    name: 'Weather Forecast API',
    method: 'GET',
    path: '/api/v1/weather/forecast',
    statusCode: 200,
    responseHeaders: { 'Content-Type': 'application/json', 'X-Powered-By': 'MockStudioEngine' },
    responseBody: JSON.stringify(
      {
        location: 'San Francisco, CA',
        condition: 'Sunny',
        temperature_f: 68,
        humidity_percent: 54,
        wind_speed_mph: 9,
        forecast: [
          { day: 'Today', high: 70, low: 53, condition: 'Clear' },
          { day: 'Tomorrow', high: 66, low: 52, condition: 'Partly Cloudy' },
          { day: 'Friday', high: 64, low: 50, condition: 'Fog' }
        ]
      },
      null,
      2
    ),
    latencyMs: 70,
    isError: false,
    enabled: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-endpoint-sms',
    name: 'SMS Dispatch Service',
    method: 'POST',
    path: '/api/v1/notifications/sms',
    statusCode: 201,
    responseHeaders: { 'Content-Type': 'application/json' },
    responseBody: JSON.stringify(
      {
        status: 'queued',
        message_id: 'sms_msg_9847192847',
        recipient: '+1-555-019-2831',
        parts: 1,
        timestamp: '2026-10-23T10:00:00Z'
      },
      null,
      2
    ),
    latencyMs: 120,
    isError: false,
    enabled: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-endpoint-failing',
    name: 'Simulated 503 Service Outage',
    method: 'GET',
    path: '/api/v1/service-status/unstable',
    statusCode: 503,
    responseHeaders: { 'Content-Type': 'application/json', 'Retry-After': '30' },
    responseBody: JSON.stringify(
      {
        error: 'SERVICE_UNAVAILABLE',
        message: 'Downstream payment gateway is undergoing scheduled database maintenance.',
        incident_id: 'INC-2026-9041'
      },
      null,
      2
    ),
    latencyMs: 150,
    isError: true,
    enabled: true,
    createdAt: new Date().toISOString()
  }
];
