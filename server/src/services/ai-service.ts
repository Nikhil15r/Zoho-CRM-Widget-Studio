import { Database as DatabaseType } from 'better-sqlite3';
import axios from 'axios';
import {
  AiProvider,
  AiModelConfig,
  AiChatMessage,
  AiContextPayload,
  AiQuickActionType,
  SDK_METHOD_CATALOG
} from '@zoho-studio/shared';

const DEFAULT_CONFIG: AiModelConfig = {
  provider: 'simulator',
  model: 'zoho-copilot-sim',
  temperature: 0.2,
  maxTokens: 2500,
  isConfigured: true
};

export class AiService {
  constructor(private db: DatabaseType) {}

  public getPublicConfig(): AiModelConfig {
    const stored = this.getStoredConfig();
    return {
      provider: stored.provider,
      model: stored.model,
      endpointUrl: stored.endpointUrl,
      temperature: stored.temperature ?? 0.2,
      maxTokens: stored.maxTokens ?? 2500,
      systemPromptExtra: stored.systemPromptExtra,
      isConfigured: stored.provider === 'simulator' || Boolean(stored.apiKey || stored.endpointUrl)
      // Omit apiKey for security
    };
  }

  public getStoredConfig(): AiModelConfig {
    const row = this.db.prepare('SELECT value_json FROM studio_settings WHERE key = ?').get('ai_config') as any;
    if (!row) return DEFAULT_CONFIG;
    try {
      return { ...DEFAULT_CONFIG, ...JSON.parse(row.value_json) };
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  public saveConfig(updates: Partial<AiModelConfig>): AiModelConfig {
    const existing = this.getStoredConfig();
    const merged: AiModelConfig = {
      ...existing,
      ...updates,
      // If placeholder or mask is provided, retain existing secret
      apiKey: updates.apiKey && updates.apiKey !== '••••••••' ? updates.apiKey : existing.apiKey
    };

    merged.isConfigured = merged.provider === 'simulator' || Boolean(merged.apiKey || merged.endpointUrl);

    this.db.prepare(
      'INSERT OR REPLACE INTO studio_settings (key, value_json) VALUES (?, ?)'
    ).run('ai_config', JSON.stringify(merged));

    return this.getPublicConfig();
  }

  public async chat(params: {
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    context?: AiContextPayload;
    providerOverride?: Partial<AiModelConfig>;
  }): Promise<AiChatMessage> {
    const config = {
      ...this.getStoredConfig(),
      ...(params.providerOverride || {})
    };

    const systemPrompt = this.constructSystemPrompt(params.context, config.systemPromptExtra);

    let rawAssistantContent = '';

    if (config.provider === 'simulator') {
      rawAssistantContent = this.generateSimulatedResponse(params.messages, params.context);
    } else if (config.provider === 'openai' || config.provider === 'ollama' || config.provider === 'custom') {
      rawAssistantContent = await this.callOpenAiCompatible(config, systemPrompt, params.messages);
    } else if (config.provider === 'anthropic') {
      rawAssistantContent = await this.callAnthropic(config, systemPrompt, params.messages);
    } else if (config.provider === 'gemini') {
      rawAssistantContent = await this.callGemini(config, systemPrompt, params.messages);
    } else {
      rawAssistantContent = this.generateSimulatedResponse(params.messages, params.context);
    }

    // Extract proposed files from markdown code blocks
    const proposedFiles = this.extractProposedFiles(rawAssistantContent, params.context?.activeFilePath);

    return {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      role: 'assistant',
      content: rawAssistantContent,
      timestamp: new Date().toISOString(),
      proposedFiles
    };
  }

  public async executeQuickAction(params: {
    action: AiQuickActionType;
    prompt?: string;
    context: AiContextPayload;
  }): Promise<AiChatMessage> {
    const { action, prompt, context } = params;

    let userInstruction = '';
    switch (action) {
      case 'explain':
        userInstruction = context.selectedCode
          ? `Please explain this selected code and how it interacts with Zoho CRM Widget SDK:\n\`\`\`javascript\n${context.selectedCode}\n\`\`\``
          : `Please explain the active widget file (${context.activeFilePath || 'file'}) and its architecture.`;
        break;
      case 'fix':
        userInstruction = `There is an issue in the active file (${context.activeFilePath || 'widget'}).\n` +
          (context.recentConsoleErrors && context.recentConsoleErrors.length > 0
            ? `Recent Errors captured by Studio DevTools:\n${JSON.stringify(context.recentConsoleErrors, null, 2)}\n`
            : '') +
          `Please diagnose the problem and provide the complete corrected code.`;
        break;
      case 'refactor':
        userInstruction = `Refactor the current code for better performance, clean error handling with ZOHO.CRM.API, and modern best practices.\n` +
          (prompt ? `Additional instructions: ${prompt}` : '');
        break;
      case 'generate_component':
        userInstruction = `Generate a complete Zoho CRM widget component based on this requirement: "${prompt || 'Interactive record list with search and details viewer'}"`;
        break;
      case 'generate_tests':
        userInstruction = `Write test scenarios and verification assertions for the logic in this widget file (${context.activeFilePath || 'app'}).`;
        break;
      case 'optimize':
        userInstruction = `Optimize this widget code for fast page load, minimal DOM recalculations, and resilient caching of CRM record queries.`;
        break;
    }

    return this.chat({
      messages: [{ role: 'user', content: userInstruction }],
      context
    });
  }

  private constructSystemPrompt(context?: AiContextPayload, extraPrompt?: string): string {
    const sdkSummary = SDK_METHOD_CATALOG.map((m) => `- ${m.signature}: ${m.description}`).join('\n');

    let prompt = `You are the Zoho CRM Widget Studio AI Copilot, an expert in Zoho CRM embedded app development, JavaScript, React, REST APIs, and modern frontend engineering.

### Zoho CRM Embedded App SDK Knowledge:
${sdkSummary}

### Key Zoho Widget Rules:
1. Always initialize the SDK using \`ZOHO.embeddedApp.init()\` at the bottom or entry of the script.
2. Register event listeners like \`ZOHO.embeddedApp.on("PageLoad", function(data) { ... })\`.
3. Standard modules are: Deals, Leads, Contacts, Accounts, Tasks, Calls, Meetings, Products.
4. When calling \`ZOHO.CRM.API.updateRecord\`, the \`APIData\` object MUST contain the target record \`id\`.
5. Wrap API calls in \`.then(...).catch(...)\` or \`try { await ... } catch (err) { ... }\` to handle errors gracefully.
6. When generating or editing code, output clean, self-contained markdown code blocks with the target filename in a comment on line 1, e.g.:
\`\`\`javascript
// js/main.js
...
\`\`\``;

    if (context?.activeFilePath && context?.activeFileContent) {
      prompt += `\n\n### Current Active File (${context.activeFilePath}):\n\`\`\`\n${context.activeFileContent}\n\`\`\``;
    }

    if (context?.selectedCode) {
      prompt += `\n\n### Selected Code by User:\n\`\`\`\n${context.selectedCode}\n\`\`\``;
    }

    if (context?.recentConsoleErrors && context.recentConsoleErrors.length > 0) {
      prompt += `\n\n### Recent DevTools Errors:\n${JSON.stringify(context.recentConsoleErrors, null, 2)}`;
    }

    if (extraPrompt) {
      prompt += `\n\n### User Custom Instructions:\n${extraPrompt}`;
    }

    return prompt;
  }

  private async callOpenAiCompatible(
    config: AiModelConfig,
    systemPrompt: string,
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  ): Promise<string> {
    const baseUrl = (config.endpointUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const model = config.model || 'gpt-4o-mini';

    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: config.temperature ?? 0.2,
        max_tokens: config.maxTokens ?? 2500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {})
        },
        timeout: 45000
      }
    );

    return response.data?.choices?.[0]?.message?.content || 'No response generated from AI provider.';
  }

  private async callAnthropic(
    config: AiModelConfig,
    systemPrompt: string,
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  ): Promise<string> {
    const model = config.model || 'claude-3-5-sonnet-20241022';
    const anthropicMessages = messages.map((m) => ({
      role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: m.content
    }));

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model,
        system: systemPrompt,
        messages: anthropicMessages,
        max_tokens: config.maxTokens ?? 2500,
        temperature: config.temperature ?? 0.2
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey || '',
          'anthropic-version': '2023-06-01'
        },
        timeout: 45000
      }
    );

    return response.data?.content?.[0]?.text || 'No response received from Anthropic.';
  }

  private async callGemini(
    config: AiModelConfig,
    systemPrompt: string,
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  ): Promise<string> {
    const model = config.model || 'gemini-1.5-flash';
    const key = config.apiKey || '';

    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: config.temperature ?? 0.2,
          maxOutputTokens: config.maxTokens ?? 2500
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 45000
      }
    );

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received from Gemini.';
  }

  /**
   * High-quality offline simulated AI intelligence for Zoho CRM widgets
   */
  private generateSimulatedResponse(
    messages: Array<{ role: string; content: string }>,
    context?: AiContextPayload
  ): string {
    const lastUserMsg = messages.filter((m) => m.role === 'user').pop()?.content || '';
    const lower = lastUserMsg.toLowerCase();

    if (lower.includes('explain')) {
      const activeFile = context?.activeFilePath || 'app.html';
      const snippetContext = context?.selectedCode ? `\n\n**Analyzed Code Snippet:**\n\`\`\`javascript\n${context.selectedCode}\n\`\`\`` : '';
      return `### 📘 Code Architecture Analysis: \`${activeFile}\`
${snippetContext}
This widget component is designed for the **Zoho CRM Embedded App** environment:

1. **Lifecycle Binding**:
   - The widget hooks into \`ZOHO.embeddedApp.on("PageLoad", ...)\` to receive context when opened inside a Zoho CRM record page or web tab.
   - It signals readiness back to the Zoho parent container via \`ZOHO.embeddedApp.init()\`.

2. **Data Flow**:
   - Record data is queried asynchronously through \`ZOHO.CRM.API.getRecord\` or \`ZOHO.CRM.API.getAllRecords\` (e.g. for Deals, Leads, or custom modules).
   - The returned response conforms to Zoho's standard envelope: \`{ data: [ { id: "...", ...fields } ], info: { ... } }\`.

3. **Recommendations**:
   - Always implement loading and error states for network latency.
   - If writing back to CRM, ensure mandatory fields are validated before \`insertRecord\` or \`updateRecord\`.`;
    }

    if (lower.includes('fix') || lower.includes('error') || lower.includes('diagnos')) {
      return `### 🛠️ Bug Fix & Resilience Patch

I analyzed the active widget code and recent runtime state. Common failure points in Zoho widgets include:
- Unhandled Promise rejection during \`ZOHO.CRM.API\` calls.
- Missing \`ZOHO.embeddedApp.init()\` invocation.
- Missing \`id\` field in \`APIData\` when calling \`updateRecord\`.

Here is the robust, patched version with complete error handling:

\`\`\`javascript
// js/main.js
console.log("Widget initializing with resilient error boundary...");

ZOHO.embeddedApp.on("PageLoad", function(data) {
  try {
    console.log("PageLoad context received:", data);
    var entity = data.Entity || "Deals";
    var recordId = data.EntityId;

    if (!recordId) {
      console.warn("No EntityId provided in PageLoad event context.");
      return;
    }

    ZOHO.CRM.API.getRecord({ Entity: entity, RecordID: recordId })
      .then(function(res) {
        if (!res || !res.data || res.data.length === 0) {
          throw new Error("No record found with ID " + recordId);
        }
        var record = res.data[0];
        console.log("Loaded record successfully:", record);
      })
      .catch(function(err) {
        console.error("SDK getRecord failed:", err);
      });
  } catch (ex) {
    console.error("Exception in PageLoad handler:", ex);
  }
});

// Always initialize the SDK
ZOHO.embeddedApp.init().catch(function(err) {
  console.error("SDK initialization failed:", err);
});
\`\`\`

**Changes Applied:**
- Added \`try/catch\` block inside \`PageLoad\`.
- Validated that \`recordId\` exists before issuing the API request.
- Attached \`.catch()\` to both \`getRecord\` and \`init()\` to prevent unhandled promise rejections.`;
    }

    if (lower.includes('deal') || lower.includes('pipeline') || lower.includes('table')) {
      return `Here is a complete, production-ready Zoho CRM Deals table component with stage badges and live data fetching:

\`\`\`javascript
// js/deals-table.js
function renderDealsPipeline() {
  var container = document.getElementById("content");
  if (!container) return;

  container.innerHTML = "<div class='loading'>Fetching Deals from Zoho CRM...</div>";

  ZOHO.CRM.API.getAllRecords({ Entity: "Deals", sort_order: "desc", per_page: 50 })
    .then(function(res) {
      var deals = res.data || [];
      if (deals.length === 0) {
        container.innerHTML = "<p>No active deals found.</p>";
        return;
      }

      var html = "<table class='crm-table'><thead><tr><th>Deal Name</th><th>Stage</th><th>Amount</th><th>Action</th></tr></thead><tbody>";
      deals.forEach(function(d) {
        html += "<tr>" +
          "<td><strong>" + (d.Deal_Name || 'Untitled') + "</strong></td>" +
          "<td><span class='badge'>" + (d.Stage || 'New') + "</span></td>" +
          "<td>$" + Number(d.Amount || 0).toLocaleString() + "</td>" +
          "<td><button onclick='openDeal(\\"" + d.id + "\\")'>Open</button></td>" +
        "</tr>";
      });
      html += "</tbody></table>";
      container.innerHTML = html;
    })
    .catch(function(err) {
      container.innerHTML = "<div class='error'>Error loading deals: " + (err.message || 'Unknown') + "</div>";
    });
}

function openDeal(dealId) {
  ZOHO.CRM.UI.Record.open({ Entity: "Deals", RecordID: dealId });
}

ZOHO.embeddedApp.on("PageLoad", function() {
  renderDealsPipeline();
});

ZOHO.embeddedApp.init();
\`\`\`

You can click **"Insert at Cursor"** or **"Apply to File"** to add this directly to your widget.`;
    }

    return `### 🤖 Zoho CRM Widget AI Copilot

I can help you build, test, and optimize custom Zoho CRM widgets:

- **Generate Zoho SDK code**: PageLoad handlers, record retrieval (\`getRecord\`, \`getAllRecords\`), record creation (\`insertRecord\`), record update (\`updateRecord\`), and search.
- **REST API integrations**: Connecting widgets to external REST endpoints with retry logic and SSRF protection.
- **Error diagnostics**: Fixing SDK mismatches and UI dialog popups.

What feature or component would you like to build?`;
  }

  private extractProposedFiles(
    markdownText: string,
    fallbackPath?: string
  ): Array<{ path: string; content: string; language?: string }> {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const files: Array<{ path: string; content: string; language?: string }> = [];

    let match;
    while ((match = codeBlockRegex.exec(markdownText)) !== null) {
      const language = match[1] || 'javascript';
      const content = match[2];

      // Check if line 1 has a comment with a filename e.g. // js/main.js or <!-- app.html -->
      const lines = content.split('\n');
      let detectedPath = fallbackPath || 'code.js';

      if (lines.length > 0) {
        const firstLine = lines[0].trim();
        const commentMatch = firstLine.match(/^(?:\/\/|<!--|\/\*)\s*([a-zA-Z0-9_\-\.\/]+)\s*(?:-->|\*\/)?$/);
        if (commentMatch && commentMatch[1].includes('.')) {
          detectedPath = commentMatch[1];
        }
      }

      files.push({
        path: detectedPath,
        content: content.trim(),
        language
      });
    }

    return files;
  }
}
