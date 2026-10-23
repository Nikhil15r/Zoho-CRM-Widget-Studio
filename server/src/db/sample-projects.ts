import { ProjectFile, ProjectManifest } from '@zoho-studio/shared';

export interface SampleProjectDefinition {
  manifest: Omit<ProjectManifest, 'id' | 'createdAt' | 'updatedAt'>;
  files: ProjectFile[];
}

export const SAMPLE_PROJECTS: SampleProjectDefinition[] = [
  // 1. Standalone Contact Form
  {
    manifest: {
      name: '01 Standalone Contact Form',
      description: 'Clean responsive contact inquiry form with real-time validation and feedback.',
      version: '1.0.0',
      entryFile: 'app.html',
      runtimeMode: 'html',
      framework: 'vanilla',
      zohoConfig: {
        targetEntity: 'Contacts',
        simulatedLatencyMs: 30
      }
    },
    files: [
      {
        path: 'app.html',
        name: 'app.html',
        isDirectory: false,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Customer Inquiry Form</title>
  <link rel="stylesheet" href="css/style.css">
  <script src="https://live.zwidgets.com/js-sdk/1.2/ZohoEmbededAppSDK.min.js"></script>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>📬 Contact & Inquiry Form</h2>
      <p>Submit inquiries or request technical consultation.</p>
    </div>
    <form id="contactForm">
      <div class="form-group">
        <label for="fullName">Full Name *</label>
        <input type="text" id="fullName" required placeholder="Elena Rostova">
      </div>
      <div class="form-group">
        <label for="email">Work Email *</label>
        <input type="email" id="email" required placeholder="elena@company.com">
      </div>
      <div class="form-group">
        <label for="topic">Topic of Interest</label>
        <select id="topic">
          <option value="enterprise_cloud">Enterprise Cloud Solutions</option>
          <option value="api_integration">Custom Zoho Widget Development</option>
          <option value="security_audit">Infrastructure Security Review</option>
        </select>
      </div>
      <div class="form-group">
        <label for="message">Project Requirements *</label>
        <textarea id="message" rows="4" required placeholder="Describe your timeline and architecture requirements..."></textarea>
      </div>
      <button type="submit" id="submitBtn">Send Inquiry</button>
    </form>
    <div id="result" class="result hidden"></div>
  </div>
  <script src="js/main.js"></script>
</body>
</html>`
      },
      {
        path: 'js/main.js',
        name: 'main.js',
        isDirectory: false,
        content: `document.addEventListener('DOMContentLoaded', function() {
  console.log("Contact form initialized");

  var form = document.getElementById('contactForm');
  var resultBox = document.getElementById('result');
  var submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    var payload = {
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      topic: document.getElementById('topic').value,
      message: document.getElementById('message').value.trim(),
      submittedAt: new Date().toISOString()
    };

    console.log("Form payload prepared:", payload);

    setTimeout(function() {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Inquiry';
      form.reset();

      resultBox.className = 'result success';
      resultBox.innerHTML = '<strong>Success!</strong> Your inquiry has been received. Reference ID: <code>INQ-' + Math.floor(100000 + Math.random() * 900000) + '</code>';
      resultBox.classList.remove('hidden');
    }, 600);
  });
});`
      },
      {
        path: 'css/style.css',
        name: 'style.css',
        isDirectory: false,
        content: `body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f1f5f9;
  color: #0f172a;
  margin: 0;
  padding: 20px;
  display: flex;
  justify-content: center;
}
.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.header h2 { margin: 0 0 6px 0; font-size: 20px; color: #1e293b; }
.header p { margin: 0 0 20px 0; font-size: 13px; color: #64748b; }
.form-group { margin-bottom: 16px; }
label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: #334155; }
input, select, textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  outline: none;
  background: #f8fafc;
}
input:focus, select:focus, textarea:focus { border-color: #2563eb; background: #ffffff; }
button {
  width: 100%;
  padding: 12px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}
button:hover { background: #1d4ed8; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
.result { margin-top: 16px; padding: 12px; border-radius: 6px; font-size: 13px; }
.result.success { background: #dcfce7; border: 1px solid #86efac; color: #166534; }
.hidden { display: none; }`
      },
      {
        path: 'README.md',
        name: 'README.md',
        isDirectory: false,
        content: `# Standalone Contact Form

A lightweight customer inquiry widget with input validation and instant visual feedback.

## Features
- Fully responsive form design.
- Validates required fields before submission.
- Emits console logs to Studio debugging panel.
`
      }
    ]
  },

  // 2. Zoho-Style Deals List
  {
    manifest: {
      name: '02 Zoho Deals List',
      description: 'Data table displaying CRM deals fetched via ZOHO.CRM.API.getAllRecords with stage badges.',
      version: '1.0.0',
      entryFile: 'app.html',
      runtimeMode: 'html',
      framework: 'vanilla',
      zohoConfig: {
        targetEntity: 'Deals',
        simulatedLatencyMs: 60
      }
    },
    files: [
      {
        path: 'app.html',
        name: 'app.html',
        isDirectory: false,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Deals Pipeline Explorer</title>
  <link rel="stylesheet" href="css/style.css">
  <script src="https://live.zwidgets.com/js-sdk/1.2/ZohoEmbededAppSDK.min.js"></script>
</head>
<body>
  <div class="container">
    <div class="top-bar">
      <div>
        <h2>💼 Deals Pipeline</h2>
        <span id="recordCount" class="badge">Loading deals...</span>
      </div>
      <button id="refreshBtn">🔄 Refresh List</button>
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Deal Name</th>
            <th>Account</th>
            <th>Stage</th>
            <th>Closing Date</th>
            <th>Probability</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody id="dealsTableBody">
          <tr><td colspan="6" class="loading">Loading deals from Zoho CRM...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
  <script src="js/main.js"></script>
</body>
</html>`
      },
      {
        path: 'js/main.js',
        name: 'main.js',
        isDirectory: false,
        content: `function formatCurrency(val) {
  return '$' + Number(val || 0).toLocaleString('en-US');
}

function getStageClass(stage) {
  if (stage === 'Closed Won') return 'stage-won';
  if (stage === 'Closed Lost') return 'stage-lost';
  if (stage === 'Negotiation/Review' || stage === 'Proposal/Price Quote') return 'stage-active';
  return 'stage-early';
}

function loadDeals() {
  var tbody = document.getElementById('dealsTableBody');
  var countBadge = document.getElementById('recordCount');
  tbody.innerHTML = '<tr><td colspan="6" class="loading">Fetching CRM records...</td></tr>';

  console.log("Calling ZOHO.CRM.API.getAllRecords({ Entity: 'Deals' })...");

  ZOHO.CRM.API.getAllRecords({ Entity: 'Deals', sort_order: 'desc' })
    .then(function(response) {
      console.log("Deals received from SDK:", response);
      var deals = response.data || [];
      countBadge.textContent = deals.length + ' Active Deals';

      if (deals.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">No deals found.</td></tr>';
        return;
      }

      var html = '';
      deals.forEach(function(deal) {
        var accountName = deal.Account_Name ? deal.Account_Name.name : '—';
        var stageClass = getStageClass(deal.Stage);
        html += '<tr>' +
          '<td><strong>' + deal.Deal_Name + '</strong></td>' +
          '<td>' + accountName + '</td>' +
          '<td><span class="stage-tag ' + stageClass + '">' + deal.Stage + '</span></td>' +
          '<td>' + (deal.Closing_Date || '—') + '</td>' +
          '<td>' + (deal.Probability ? deal.Probability + '%' : '—') + '</td>' +
          '<td class="text-right amount">' + formatCurrency(deal.Amount) + '</td>' +
        '</tr>';
      });

      tbody.innerHTML = html;
    })
    .catch(function(err) {
      console.error("Failed to load deals:", err);
      tbody.innerHTML = '<tr><td colspan="6" class="error">Error loading deals: ' + (err.message || 'Unknown error') + '</td></tr>';
    });
}

document.getElementById('refreshBtn').addEventListener('click', loadDeals);

// Initialize Zoho SDK
ZOHO.embeddedApp.on("PageLoad", function(data) {
  console.log("Widget PageLoad event:", data);
  loadDeals();
});

ZOHO.embeddedApp.init();
`
      },
      {
        path: 'css/style.css',
        name: 'style.css',
        isDirectory: false,
        content: `body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  margin: 0;
  padding: 16px;
  background: #f8fafc;
  color: #1e293b;
}
.container { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.top-bar { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; }
.top-bar h2 { margin: 0; font-size: 18px; color: #0f172a; }
.badge { font-size: 12px; background: #e2e8f0; color: #475569; padding: 3px 8px; border-radius: 999px; margin-top: 4px; display: inline-block; }
button { background: #0284c7; color: white; border: none; padding: 8px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; }
button:hover { background: #0369a1; }
.table-container { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
th { background: #f8fafc; padding: 12px 16px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0; }
td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; }
tr:hover td { background: #f8fafc; }
.text-right { text-align: right; }
.amount { font-weight: 600; color: #0f172a; }
.stage-tag { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.stage-won { background: #dcfce7; color: #15803d; }
.stage-lost { background: #fee2e2; color: #b91c1c; }
.stage-active { background: #e0e7ff; color: #4338ca; }
.stage-early { background: #fef3c7; color: #b45309; }
.loading, .empty, .error { text-align: center; padding: 32px; color: #64748b; }
.error { color: #dc2626; }`
      },
      {
        path: 'README.md',
        name: 'README.md',
        isDirectory: false,
        content: `# Zoho Deals List Widget

Demonstrates fetching and rendering records from the CRM Deals module using \`ZOHO.CRM.API.getAllRecords\`.
`
      }
    ]
  },

  // 3. Deal Details Viewer Using PageLoad Context
  {
    manifest: {
      name: '03 Deal Details Viewer',
      description: 'Reads PageLoad event context (Entity & EntityId) and loads full record details via ZOHO.CRM.API.getRecord.',
      version: '1.0.0',
      entryFile: 'app.html',
      runtimeMode: 'html',
      framework: 'vanilla',
      zohoConfig: {
        targetEntity: 'Deals',
        defaultRecordId: '548291000001234001',
        simulatedLatencyMs: 40
      }
    },
    files: [
      {
        path: 'app.html',
        name: 'app.html',
        isDirectory: false,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Deal Record Inspector</title>
  <link rel="stylesheet" href="css/style.css">
  <script src="https://live.zwidgets.com/js-sdk/1.2/ZohoEmbededAppSDK.min.js"></script>
</head>
<body>
  <div class="card">
    <div id="loader" class="loader">Waiting for PageLoad event from Zoho CRM...</div>
    <div id="dealCard" class="hidden">
      <div class="header">
        <div>
          <span class="entity-pill" id="entityName">DEALS</span>
          <h2 id="dealTitle">Loading...</h2>
        </div>
        <div class="amount-badge" id="dealAmount">$0</div>
      </div>

      <div class="details-grid">
        <div class="field">
          <span class="label">Stage</span>
          <span class="val" id="dealStage">—</span>
        </div>
        <div class="field">
          <span class="label">Closing Date</span>
          <span class="val" id="dealClosingDate">—</span>
        </div>
        <div class="field">
          <span class="label">Account</span>
          <span class="val" id="dealAccount">—</span>
        </div>
        <div class="field">
          <span class="label">Contact</span>
          <span class="val" id="dealContact">—</span>
        </div>
        <div class="field">
          <span class="label">Record ID</span>
          <span class="val mono" id="recordId">—</span>
        </div>
        <div class="field">
          <span class="label">Last Modified</span>
          <span class="val" id="modifiedTime">—</span>
        </div>
      </div>

      <div class="desc-box">
        <span class="label">Description</span>
        <p id="dealDescription">No description available.</p>
      </div>

      <div class="actions">
        <button id="openRecordBtn">🔍 Open in Native Zoho CRM</button>
        <button id="closeWidgetBtn" class="secondary">Close Widget</button>
      </div>
    </div>
  </div>
  <script src="js/main.js"></script>
</body>
</html>`
      },
      {
        path: 'js/main.js',
        name: 'main.js',
        isDirectory: false,
        content: `var currentRecord = null;

ZOHO.embeddedApp.on("PageLoad", function(data) {
  console.log("PageLoad event data:", data);
  var entity = data.Entity || "Deals";
  var recordId = data.EntityId || "548291000001234001";

  document.getElementById("loader").textContent = "Fetching record details for " + entity + " (" + recordId + ")...";

  ZOHO.CRM.API.getRecord({ Entity: entity, RecordID: recordId })
    .then(function(res) {
      console.log("getRecord response:", res);
      var rec = res.data[0];
      currentRecord = rec;
      renderRecord(entity, rec);
    })
    .catch(function(err) {
      console.error("getRecord failed:", err);
      document.getElementById("loader").innerHTML = '<div style="color:red">Failed to load record: ' + (err.message || 'Not found') + '</div>';
    });
});

function renderRecord(entity, rec) {
  document.getElementById("loader").classList.add("hidden");
  document.getElementById("dealCard").classList.remove("hidden");

  document.getElementById("entityName").textContent = entity.toUpperCase();
  document.getElementById("dealTitle").textContent = rec.Deal_Name || rec.Name || "Unnamed Record";
  document.getElementById("dealAmount").textContent = "$" + Number(rec.Amount || 0).toLocaleString();
  document.getElementById("dealStage").textContent = rec.Stage || "—";
  document.getElementById("dealClosingDate").textContent = rec.Closing_Date || "—";
  document.getElementById("dealAccount").textContent = rec.Account_Name ? rec.Account_Name.name : "—";
  document.getElementById("dealContact").textContent = rec.Contact_Name ? rec.Contact_Name.name : "—";
  document.getElementById("recordId").textContent = rec.id;
  document.getElementById("modifiedTime").textContent = new Date(rec.Modified_Time || Date.now()).toLocaleString();
  document.getElementById("dealDescription").textContent = rec.Description || "No description provided.";
}

document.getElementById("openRecordBtn").addEventListener("click", function() {
  if (currentRecord) {
    ZOHO.CRM.UI.Record.open({ Entity: "Deals", RecordID: currentRecord.id });
  }
});

document.getElementById("closeWidgetBtn").addEventListener("click", function() {
  ZOHO.CRM.UI.Popup.close();
});

ZOHO.embeddedApp.init();
`
      },
      {
        path: 'css/style.css',
        name: 'style.css',
        isDirectory: false,
        content: `body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  margin: 0;
  padding: 20px;
  background: #f1f5f9;
  color: #1e293b;
}
.card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.loader { text-align: center; padding: 40px; color: #64748b; font-size: 14px; }
.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.entity-pill { font-size: 10px; font-weight: 700; background: #e0e7ff; color: #4338ca; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.5px; }
h2 { margin: 6px 0 0 0; font-size: 20px; color: #0f172a; }
.amount-badge { background: #ecfdf5; color: #059669; font-size: 18px; font-weight: 700; padding: 6px 14px; border-radius: 8px; border: 1px solid #a7f3d0; }
.details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
.field { display: flex; flex-direction: column; }
.label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 4px; }
.val { font-size: 13px; font-weight: 500; color: #1e293b; }
.mono { font-family: monospace; font-size: 12px; color: #475569; }
.desc-box { margin-bottom: 20px; }
.desc-box p { font-size: 13px; color: #334155; line-height: 1.5; margin: 4px 0 0 0; }
.actions { display: flex; gap: 10px; }
button { padding: 10px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
button.secondary { background: #e2e8f0; color: #334155; }
button:hover { opacity: 0.9; }
.hidden { display: none; }`
      },
      {
        path: 'README.md',
        name: 'README.md',
        isDirectory: false,
        content: `# Deal Details Viewer Widget

Demonstrates handling the \`PageLoad\` event payload and calling \`ZOHO.CRM.API.getRecord\` to inspect record details.
`
      }
    ]
  },

  // 4. CRM Record Creation Form
  {
    manifest: {
      name: '04 CRM Record Creation Form',
      description: 'Form to insert new Leads into Zoho CRM with validation via ZOHO.CRM.API.insertRecord.',
      version: '1.0.0',
      entryFile: 'app.html',
      runtimeMode: 'html',
      framework: 'vanilla',
      zohoConfig: {
        targetEntity: 'Leads',
        simulatedLatencyMs: 50
      }
    },
    files: [
      {
        path: 'app.html',
        name: 'app.html',
        isDirectory: false,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quick Lead Creator</title>
  <link rel="stylesheet" href="css/style.css">
  <script src="https://live.zwidgets.com/js-sdk/1.2/ZohoEmbededAppSDK.min.js"></script>
</head>
<body>
  <div class="card">
    <h2>⚡ Quick Lead Creator</h2>
    <p class="subtitle">Directly registers a new prospect into the CRM Leads module.</p>
    
    <form id="leadForm">
      <div class="row">
        <div class="col">
          <label for="firstName">First Name</label>
          <input type="text" id="firstName" placeholder="Jordan">
        </div>
        <div class="col">
          <label for="lastName">Last Name *</label>
          <input type="text" id="lastName" required placeholder="Vargas">
        </div>
      </div>
      <div class="row">
        <div class="col">
          <label for="company">Company *</label>
          <input type="text" id="company" required placeholder="Apex Industrial Group">
        </div>
        <div class="col">
          <label for="email">Email *</label>
          <input type="email" id="email" required placeholder="jordan@apexind.demo">
        </div>
      </div>
      <div class="row">
        <div class="col">
          <label for="phone">Phone</label>
          <input type="tel" id="phone" placeholder="+1-415-555-0144">
        </div>
        <div class="col">
          <label for="status">Lead Status</label>
          <select id="status">
            <option value="Not Contacted">Not Contacted</option>
            <option value="Contacted">Contacted</option>
            <option value="Pre-Qualified" selected>Pre-Qualified</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label for="revenue">Annual Revenue ($)</label>
        <input type="number" id="revenue" placeholder="2500000">
      </div>
      <button type="submit" id="createBtn">Create CRM Lead</button>
    </form>
    
    <div id="statusAlert" class="alert hidden"></div>
  </div>
  <script src="js/main.js"></script>
</body>
</html>`
      },
      {
        path: 'js/main.js',
        name: 'main.js',
        isDirectory: false,
        content: `document.addEventListener("DOMContentLoaded", function() {
  var form = document.getElementById("leadForm");
  var alertBox = document.getElementById("statusAlert");
  var createBtn = document.getElementById("createBtn");

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    createBtn.disabled = true;
    createBtn.textContent = "Inserting Lead into CRM...";
    alertBox.className = "alert hidden";

    var leadData = {
      First_Name: document.getElementById("firstName").value.trim(),
      Last_Name: document.getElementById("lastName").value.trim(),
      Company: document.getElementById("company").value.trim(),
      Email: document.getElementById("email").value.trim(),
      Phone: document.getElementById("phone").value.trim(),
      Lead_Status: document.getElementById("status").value,
      Annual_Revenue: Number(document.getElementById("revenue").value) || 0
    };

    console.log("Calling ZOHO.CRM.API.insertRecord with:", leadData);

    ZOHO.CRM.API.insertRecord({ Entity: "Leads", APIData: leadData })
      .then(function(res) {
        console.log("Record inserted successfully:", res);
        createBtn.disabled = false;
        createBtn.textContent = "Create CRM Lead";
        form.reset();

        var recordId = res.data[0].details.id;
        alertBox.className = "alert success";
        alertBox.innerHTML = "<strong>Lead Created!</strong> Record ID: <code>" + recordId + "</code>";
        alertBox.classList.remove("hidden");
      })
      .catch(function(err) {
        console.error("Insert failed:", err);
        createBtn.disabled = false;
        createBtn.textContent = "Create CRM Lead";
        alertBox.className = "alert error";
        alertBox.textContent = "Error: " + (err.message || JSON.stringify(err));
        alertBox.classList.remove("hidden");
      });
  });
});

ZOHO.embeddedApp.init();
`
      },
      {
        path: 'css/style.css',
        name: 'style.css',
        isDirectory: false,
        content: `body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f8fafc;
  padding: 20px;
  margin: 0;
}
.card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; max-width: 520px; margin: 0 auto; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
h2 { margin: 0 0 4px 0; font-size: 18px; color: #0f172a; }
.subtitle { margin: 0 0 20px 0; font-size: 13px; color: #64748b; }
.row { display: flex; gap: 12px; margin-bottom: 14px; }
.col { flex: 1; }
.form-group { margin-bottom: 16px; }
label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px; }
input, select { width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; }
input:focus, select:focus { border-color: #0284c7; outline: none; }
button { width: 100%; padding: 11px; background: #0284c7; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
button:hover { background: #0369a1; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
.alert { margin-top: 16px; padding: 12px; border-radius: 6px; font-size: 13px; }
.alert.success { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
.alert.error { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
.hidden { display: none; }`
      },
      {
        path: 'README.md',
        name: 'README.md',
        isDirectory: false,
        content: `# CRM Record Creation Form

Demonstrates inserting new records into Zoho CRM modules using \`ZOHO.CRM.API.insertRecord\`.
`
      }
    ]
  },

  // 5. CRM Record Update Form
  {
    manifest: {
      name: '05 CRM Record Update Form',
      description: 'Fetch an existing deal and update its Stage and Amount using ZOHO.CRM.API.updateRecord.',
      version: '1.0.0',
      entryFile: 'app.html',
      runtimeMode: 'html',
      framework: 'vanilla',
      zohoConfig: {
        targetEntity: 'Deals',
        defaultRecordId: '548291000001234001',
        simulatedLatencyMs: 40
      }
    },
    files: [
      {
        path: 'app.html',
        name: 'app.html',
        isDirectory: false,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quick Deal Updater</title>
  <link rel="stylesheet" href="css/style.css">
  <script src="https://live.zwidgets.com/js-sdk/1.2/ZohoEmbededAppSDK.min.js"></script>
</head>
<body>
  <div class="card">
    <h2>✏️ Deal Stage & Value Updater</h2>
    <div class="lookup-box">
      <label for="dealIdInput">Deal Record ID</label>
      <div class="input-row">
        <input type="text" id="dealIdInput" value="548291000001234001">
        <button id="loadBtn">Load</button>
      </div>
    </div>

    <form id="updateForm" class="hidden">
      <div class="deal-name" id="displayDealName">Deal Name</div>
      
      <div class="form-group">
        <label for="stageSelect">New Stage</label>
        <select id="stageSelect">
          <option value="Qualification">Qualification</option>
          <option value="Needs Analysis">Needs Analysis</option>
          <option value="Proposal/Price Quote">Proposal/Price Quote</option>
          <option value="Negotiation/Review">Negotiation/Review</option>
          <option value="Closed Won">Closed Won</option>
          <option value="Closed Lost">Closed Lost</option>
        </select>
      </div>

      <div class="form-group">
        <label for="amountInput">Deal Amount ($)</label>
        <input type="number" id="amountInput" required>
      </div>

      <div class="form-group">
        <label for="probInput">Probability (%)</label>
        <input type="number" id="probInput" min="0" max="100">
      </div>

      <button type="submit" id="saveBtn">Save Updates to CRM</button>
    </form>

    <div id="updateResult" class="alert hidden"></div>
  </div>
  <script src="js/main.js"></script>
</body>
</html>`
      },
      {
        path: 'js/main.js',
        name: 'main.js',
        isDirectory: false,
        content: `var loadedDealId = null;

function loadDeal(id) {
  var alertBox = document.getElementById("updateResult");
  alertBox.className = "alert hidden";

  console.log("Fetching deal for update:", id);
  ZOHO.CRM.API.getRecord({ Entity: "Deals", RecordID: id })
    .then(function(res) {
      var deal = res.data[0];
      loadedDealId = deal.id;
      document.getElementById("displayDealName").textContent = deal.Deal_Name;
      document.getElementById("stageSelect").value = deal.Stage || "Qualification";
      document.getElementById("amountInput").value = deal.Amount || 0;
      document.getElementById("probInput").value = deal.Probability || 50;

      document.getElementById("updateForm").classList.remove("hidden");
    })
    .catch(function(err) {
      alertBox.className = "alert error";
      alertBox.textContent = "Deal not found: " + (err.message || id);
      alertBox.classList.remove("hidden");
    });
}

document.getElementById("loadBtn").addEventListener("click", function() {
  var id = document.getElementById("dealIdInput").value.trim();
  if (id) loadDeal(id);
});

document.getElementById("updateForm").addEventListener("submit", function(e) {
  e.preventDefault();
  var saveBtn = document.getElementById("saveBtn");
  var alertBox = document.getElementById("updateResult");

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving to Zoho CRM...";

  var updatePayload = {
    id: loadedDealId,
    Stage: document.getElementById("stageSelect").value,
    Amount: Number(document.getElementById("amountInput").value),
    Probability: Number(document.getElementById("probInput").value)
  };

  console.log("Calling ZOHO.CRM.API.updateRecord with:", updatePayload);

  ZOHO.CRM.API.updateRecord({ Entity: "Deals", APIData: updatePayload })
    .then(function(res) {
      console.log("Record updated:", res);
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Updates to CRM";

      alertBox.className = "alert success";
      alertBox.innerHTML = "<strong>Updated!</strong> Deal stage changed to <em>" + updatePayload.Stage + "</em> ($" + updatePayload.Amount.toLocaleString() + ")";
      alertBox.classList.remove("hidden");
    })
    .catch(function(err) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Updates to CRM";
      alertBox.className = "alert error";
      alertBox.textContent = "Update failed: " + (err.message || 'Unknown error');
      alertBox.classList.remove("hidden");
    });
});

ZOHO.embeddedApp.on("PageLoad", function(data) {
  if (data.EntityId) {
    document.getElementById("dealIdInput").value = data.EntityId;
    loadDeal(data.EntityId);
  }
});

ZOHO.embeddedApp.init();
`
      },
      {
        path: 'css/style.css',
        name: 'style.css',
        isDirectory: false,
        content: `body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f1f5f9;
  padding: 20px;
  margin: 0;
}
.card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; max-width: 480px; margin: 0 auto; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
h2 { margin: 0 0 16px 0; font-size: 18px; color: #0f172a; }
.lookup-box { margin-bottom: 20px; }
.input-row { display: flex; gap: 8px; margin-top: 4px; }
.deal-name { font-size: 16px; font-weight: 700; color: #1e293b; padding: 10px; background: #f8fafc; border-radius: 6px; margin-bottom: 16px; }
.form-group { margin-bottom: 14px; }
label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px; }
input, select { width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; }
button { padding: 9px 16px; background: #059669; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
#updateForm button { width: 100%; padding: 11px; }
button:hover { opacity: 0.9; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
.alert { margin-top: 16px; padding: 12px; border-radius: 6px; font-size: 13px; }
.alert.success { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
.alert.error { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
.hidden { display: none; }`
      },
      {
        path: 'README.md',
        name: 'README.md',
        isDirectory: false,
        content: `# CRM Record Update Form

Demonstrates updating existing CRM records with \`ZOHO.CRM.API.updateRecord\`.
`
      }
    ]
  },

  // 6. Dashboard with Mock CRM Metrics
  {
    manifest: {
      name: '06 CRM Metrics Dashboard',
      description: 'Analytics widget computing total pipeline value, won deals, and stage breakdowns.',
      version: '1.0.0',
      entryFile: 'app.html',
      runtimeMode: 'html',
      framework: 'vanilla',
      zohoConfig: {
        targetEntity: 'Deals',
        simulatedLatencyMs: 50
      }
    },
    files: [
      {
        path: 'app.html',
        name: 'app.html',
        isDirectory: false,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Executive Pipeline Analytics</title>
  <link rel="stylesheet" href="css/style.css">
  <script src="https://live.zwidgets.com/js-sdk/1.2/ZohoEmbededAppSDK.min.js"></script>
</head>
<body>
  <div class="dashboard">
    <div class="dash-header">
      <h2>📊 CRM Pipeline Analytics</h2>
      <button id="refreshBtn">Refresh Data</button>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <span class="m-label">Total Pipeline</span>
        <span class="m-val" id="totalPipeline">$0</span>
        <span class="m-sub" id="dealCount">0 active deals</span>
      </div>
      <div class="metric-card highlight">
        <span class="m-label">Closed Won Revenue</span>
        <span class="m-val" id="wonRevenue">$0</span>
        <span class="m-sub" id="wonCount">0 won</span>
      </div>
      <div class="metric-card">
        <span class="m-label">Win Rate</span>
        <span class="m-val" id="winRate">0%</span>
        <span class="m-sub">by count</span>
      </div>
      <div class="metric-card">
        <span class="m-label">Average Deal Size</span>
        <span class="m-val" id="avgDeal">$0</span>
        <span class="m-sub">across pipeline</span>
      </div>
    </div>

    <div class="breakdown-card">
      <h3>Pipeline Distribution by Stage</h3>
      <div id="stageBars" class="stage-list">Loading stages...</div>
    </div>
  </div>
  <script src="js/main.js"></script>
</body>
</html>`
      },
      {
        path: 'js/main.js',
        name: 'main.js',
        isDirectory: false,
        content: `function loadMetrics() {
  console.log("Computing CRM metrics from Deals module...");

  ZOHO.CRM.API.getAllRecords({ Entity: "Deals" })
    .then(function(res) {
      var deals = res.data || [];
      var totalPipeline = 0;
      var wonRevenue = 0;
      var wonCount = 0;
      var stages = {};

      deals.forEach(function(d) {
        var amt = Number(d.Amount || 0);
        totalPipeline += amt;

        var stage = d.Stage || "Unknown";
        if (!stages[stage]) stages[stage] = { count: 0, amount: 0 };
        stages[stage].count++;
        stages[stage].amount += amt;

        if (stage === "Closed Won") {
          wonRevenue += amt;
          wonCount++;
        }
      });

      var avgDeal = deals.length > 0 ? Math.round(totalPipeline / deals.length) : 0;
      var winRate = deals.length > 0 ? Math.round((wonCount / deals.length) * 100) : 0;

      document.getElementById("totalPipeline").textContent = "$" + totalPipeline.toLocaleString();
      document.getElementById("dealCount").textContent = deals.length + " total deals";
      document.getElementById("wonRevenue").textContent = "$" + wonRevenue.toLocaleString();
      document.getElementById("wonCount").textContent = wonCount + " deals won";
      document.getElementById("winRate").textContent = winRate + "%";
      document.getElementById("avgDeal").textContent = "$" + avgDeal.toLocaleString();

      // Render Stage Bars
      var barsHtml = '';
      Object.keys(stages).forEach(function(stageName) {
        var s = stages[stageName];
        var pct = totalPipeline > 0 ? Math.round((s.amount / totalPipeline) * 100) : 0;
        barsHtml += '<div class="stage-row">' +
          '<div class="stage-info">' +
            '<span><strong>' + stageName + '</strong> (' + s.count + ')</span>' +
            '<span>$' + s.amount.toLocaleString() + ' (' + pct + '%)</span>' +
          '</div>' +
          '<div class="progress-bar">' +
            '<div class="progress-fill" style="width:' + pct + '%"></div>' +
          '</div>' +
        '</div>';
      });

      document.getElementById("stageBars").innerHTML = barsHtml;
    })
    .catch(function(err) {
      console.error("Metrics load failed:", err);
    });
}

document.getElementById("refreshBtn").addEventListener("click", loadMetrics);

ZOHO.embeddedApp.on("PageLoad", function() {
  loadMetrics();
});

ZOHO.embeddedApp.init();
`
      },
      {
        path: 'css/style.css',
        name: 'style.css',
        isDirectory: false,
        content: `body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f8fafc;
  margin: 0;
  padding: 20px;
  color: #1e293b;
}
.dashboard { max-width: 800px; margin: 0 auto; }
.dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.dash-header h2 { margin: 0; font-size: 20px; }
button { background: #4f46e5; color: white; border: none; padding: 8px 14px; border-radius: 6px; font-weight: 500; cursor: pointer; }
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 14px; margin-bottom: 20px; }
.metric-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; }
.metric-card.highlight { background: #f0fdf4; border-color: #bbf7d0; }
.m-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 6px; }
.m-val { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
.m-sub { font-size: 12px; color: #94a3b8; }
.breakdown-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }
.breakdown-card h3 { margin: 0 0 16px 0; font-size: 15px; color: #334155; }
.stage-row { margin-bottom: 12px; }
.stage-info { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }
.progress-bar { background: #e2e8f0; height: 8px; border-radius: 4px; overflow: hidden; }
.progress-fill { background: #4f46e5; height: 100%; border-radius: 4px; }`
      },
      {
        path: 'README.md',
        name: 'README.md',
        isDirectory: false,
        content: `# CRM Metrics Dashboard

Executive widget that aggregates deals data to produce real-time sales pipeline KPIs.
`
      }
    ]
  },

  // 7. Third-Party REST API Demo Using a Mock Endpoint
  {
    manifest: {
      name: '07 Third-Party REST API Demo',
      description: 'Consumes simulated third-party REST API (/api/v1/weather/forecast) directly from widget.',
      version: '1.0.0',
      entryFile: 'app.html',
      runtimeMode: 'html',
      framework: 'vanilla',
      zohoConfig: {
        targetEntity: 'Accounts',
        defaultRecordId: '548291000001001001',
        simulatedLatencyMs: 30
      }
    },
    files: [
      {
        path: 'app.html',
        name: 'app.html',
        isDirectory: false,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Third-Party Weather Integration</title>
  <link rel="stylesheet" href="css/style.css">
  <script src="https://live.zwidgets.com/js-sdk/1.2/ZohoEmbededAppSDK.min.js"></script>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>🌤️ Regional Climate Intel</h2>
      <span class="source-tag">Mock REST API</span>
    </div>
    
    <div id="weatherContent">
      <div class="loading">Querying API endpoint /api/v1/weather/forecast...</div>
    </div>

    <div class="footer">
      <span>Endpoint: <code>/api/v1/weather/forecast</code></span>
      <button id="refreshBtn">Re-fetch API</button>
    </div>
  </div>
  <script src="js/main.js"></script>
</body>
</html>`
      },
      {
        path: 'js/main.js',
        name: 'main.js',
        isDirectory: false,
        content: `function fetchWeather() {
  var content = document.getElementById("weatherContent");
  content.innerHTML = '<div class="loading">Contacting meteorological service...</div>';

  console.log("Widget dispatching HTTP GET /api/v1/weather/forecast");

  fetch('/api/v1/weather/forecast')
    .then(function(res) {
      if (!res.ok) throw new Error('API returned HTTP status ' + res.status);
      return res.json();
    })
    .then(function(data) {
      console.log("Weather API response received:", data);

      var forecastHtml = '';
      data.forecast.forEach(function(f) {
        forecastHtml += '<div class="f-day">' +
          '<span class="f-name">' + f.day + '</span>' +
          '<span class="f-cond">' + f.condition + '</span>' +
          '<span class="f-temp">' + f.high + '° / ' + f.low + '°</span>' +
        '</div>';
      });

      content.innerHTML = '<div class="weather-box">' +
        '<div class="current-temp">' +
          '<span class="temp-big">' + data.temperature_f + '°F</span>' +
          '<span class="cond-label">' + data.condition + ' in ' + data.location + '</span>' +
        '</div>' +
        '<div class="details">' +
          '<span>💨 Wind: ' + data.wind_speed_mph + ' mph</span>' +
          '<span>💧 Humidity: ' + data.humidity_percent + '%</span>' +
        '</div>' +
        '<div class="forecast-row">' + forecastHtml + '</div>' +
      '</div>';
    })
    .catch(function(err) {
      console.error("API call error:", err);
      content.innerHTML = '<div class="error">Failed to query third-party API: ' + err.message + '</div>';
    });
}

document.getElementById("refreshBtn").addEventListener("click", fetchWeather);

ZOHO.embeddedApp.on("PageLoad", function() {
  fetchWeather();
});

ZOHO.embeddedApp.init();
`
      },
      {
        path: 'css/style.css',
        name: 'style.css',
        isDirectory: false,
        content: `body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f8fafc;
  padding: 20px;
  margin: 0;
}
.card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 520px; margin: 0 auto; padding: 22px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.header h2 { margin: 0; font-size: 18px; color: #0f172a; }
.source-tag { font-size: 11px; font-weight: 600; background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 4px; }
.current-temp { display: flex; flex-direction: column; align-items: center; padding: 16px; background: #f0f9ff; border-radius: 8px; margin-bottom: 14px; }
.temp-big { font-size: 38px; font-weight: 800; color: #0369a1; }
.cond-label { font-size: 14px; font-weight: 500; color: #334155; margin-top: 4px; }
.details { display: flex; justify-content: space-around; font-size: 13px; color: #64748b; margin-bottom: 16px; }
.forecast-row { display: flex; gap: 8px; }
.f-day { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center; }
.f-name { display: block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 2px; }
.f-cond { display: block; font-size: 11px; color: #64748b; margin-bottom: 4px; }
.f-temp { font-size: 12px; font-weight: 700; color: #0f172a; }
.footer { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 14px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b; }
button { background: #0284c7; color: white; border: none; padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
.loading, .error { text-align: center; padding: 24px; color: #64748b; font-size: 13px; }
.error { color: #dc2626; }`
      },
      {
        path: 'README.md',
        name: 'README.md',
        isDirectory: false,
        content: `# Third-Party REST API Demo

Demonstrates making asynchronous HTTP fetch requests from widget code to external or simulated API endpoints.
`
      }
    ]
  },

  // 8. Example Showing API Failures and Error Handling
  {
    manifest: {
      name: '08 API Failure & Error Handling',
      description: 'Demonstrates handling 503 outage errors, retry backoff strategies, and diagnostic inspection.',
      version: '1.0.0',
      entryFile: 'app.html',
      runtimeMode: 'html',
      framework: 'vanilla',
      zohoConfig: {
        targetEntity: 'Deals',
        simulatedLatencyMs: 30
      }
    },
    files: [
      {
        path: 'app.html',
        name: 'app.html',
        isDirectory: false,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Resilient API Error Handler</title>
  <link rel="stylesheet" href="css/style.css">
  <script src="https://live.zwidgets.com/js-sdk/1.2/ZohoEmbededAppSDK.min.js"></script>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>🛡️ API Fault Simulation & Recovery</h2>
      <span class="badge warning">Resilience Demo</span>
    </div>
    
    <p class="description">
      This widget simulates querying an unstable upstream service (HTTP 503 Outage) and handles graceful degradation with automated retries.
    </p>

    <div class="controls">
      <button id="triggerErrorBtn" class="danger">Simulate 503 Service Outage</button>
      <button id="triggerSdkNotFoundBtn">Simulate Missing CRM Record</button>
    </div>

    <div id="statusBox" class="status-box empty">
      Click a button above to test error capturing and telemetry.
    </div>

    <div class="log-section">
      <h3>Diagnostics Log</h3>
      <div id="diagnosticsLog" class="diag-log">Ready.</div>
    </div>
  </div>
  <script src="js/main.js"></script>
</body>
</html>`
      },
      {
        path: 'js/main.js',
        name: 'main.js',
        isDirectory: false,
        content: `function logDiag(msg) {
  var box = document.getElementById("diagnosticsLog");
  var timestamp = new Date().toLocaleTimeString();
  box.innerHTML = '<div>[' + timestamp + '] ' + msg + '</div>' + box.innerHTML;
}

document.getElementById("triggerErrorBtn").addEventListener("click", function() {
  var btn = document.getElementById("triggerErrorBtn");
  var statusBox = document.getElementById("statusBox");
  btn.disabled = true;
  statusBox.className = "status-box loading";
  statusBox.textContent = "Contacting /api/v1/service-status/unstable...";

  logDiag("Dispatching request to unstable endpoint...");

  fetch('/api/v1/service-status/unstable')
    .then(function(res) {
      logDiag("HTTP response status: " + res.status + " " + res.statusText);
      return res.json().then(function(data) {
        return { status: res.status, body: data };
      });
    })
    .then(function(result) {
      btn.disabled = false;
      statusBox.className = "status-box error";
      statusBox.innerHTML = '<strong>' + result.body.error + ' (HTTP ' + result.status + ')</strong><br>' +
        result.body.message + '<br><small>Incident: <code>' + result.body.incident_id + '</code></small>';
      
      console.error("Downstream service fault captured:", result);
      logDiag("Error caught gracefully. Widget UI remains interactive.");
    })
    .catch(function(err) {
      btn.disabled = false;
      statusBox.className = "status-box error";
      statusBox.textContent = "Network failure: " + err.message;
      logDiag("Fetch exception: " + err.message);
    });
});

document.getElementById("triggerSdkNotFoundBtn").addEventListener("click", function() {
  var statusBox = document.getElementById("statusBox");
  statusBox.className = "status-box loading";
  statusBox.textContent = "Calling ZOHO.CRM.API.getRecord for non-existent ID...";

  logDiag("Calling ZOHO.CRM.API.getRecord with invalid ID 99999999999...");

  ZOHO.CRM.API.getRecord({ Entity: "Deals", RecordID: "99999999999" })
    .then(function(res) {
      statusBox.className = "status-box success";
      statusBox.textContent = "Record found (unexpected)";
    })
    .catch(function(err) {
      console.warn("Zoho SDK Error caught:", err);
      statusBox.className = "status-box warning";
      statusBox.innerHTML = '<strong>SDK Error Handled:</strong> ' + err.code + '<br>' + err.message;
      logDiag("Handled Zoho SDK error: " + err.code);
    });
});

ZOHO.embeddedApp.init();
`
      },
      {
        path: 'css/style.css',
        name: 'style.css',
        isDirectory: false,
        content: `body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f8fafc;
  padding: 20px;
  margin: 0;
  color: #1e293b;
}
.card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 580px; margin: 0 auto; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.header h2 { margin: 0; font-size: 18px; }
.badge.warning { background: #fef3c7; color: #b45309; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; }
.description { font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 20px 0; }
.controls { display: flex; gap: 10px; margin-bottom: 20px; }
button { padding: 10px 14px; border: 1px solid #cbd5e1; background: #f8fafc; color: #334155; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; flex: 1; }
button.danger { background: #fee2e2; border-color: #fca5a5; color: #991b1b; }
button:hover { opacity: 0.9; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
.status-box { padding: 16px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; line-height: 1.4; }
.status-box.empty { background: #f8fafc; border: 1px dashed #cbd5e1; color: #64748b; text-align: center; }
.status-box.loading { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; }
.status-box.error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
.status-box.warning { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
.log-section h3 { margin: 0 0 8px 0; font-size: 13px; color: #475569; }
.diag-log { background: #0f172a; color: #38bdf8; font-family: monospace; font-size: 11px; padding: 12px; border-radius: 6px; max-height: 120px; overflow-y: auto; line-height: 1.6; }`
      },
      {
        path: 'README.md',
        name: 'README.md',
        isDirectory: false,
        content: `# API Failure & Error Handling

Demonstrates testing HTTP outages (503), missing record queries, and graceful recovery.
`
      }
    ]
  }
];

export function seedSampleProjects(db: any): void {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
  if (countRow.count > 0) return;

  const insertProject = db.prepare(
    `INSERT INTO projects (id, name, description, version, entry_file, runtime_mode, framework, zoho_config_json, env_vars_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const insertFile = db.prepare(
    `INSERT INTO project_files (project_id, path, name, content, is_directory, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  const tx = db.transaction(() => {
    const now = new Date().toISOString();
    for (let i = 0; i < SAMPLE_PROJECTS.length; i++) {
      const def = SAMPLE_PROJECTS[i];
      const id = `sample_proj_0${i + 1}`;

      insertProject.run(
        id,
        def.manifest.name,
        def.manifest.description,
        def.manifest.version,
        def.manifest.entryFile,
        def.manifest.runtimeMode,
        def.manifest.framework,
        JSON.stringify(def.manifest.zohoConfig),
        JSON.stringify(def.manifest.envVariables || {}),
        now,
        now
      );

      for (const file of def.files) {
        insertFile.run(
          id,
          file.path,
          file.name,
          file.content,
          file.isDirectory ? 1 : 0,
          now
        );
      }
    }
  });

  tx();
}
