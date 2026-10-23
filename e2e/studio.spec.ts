import { test, expect } from '@playwright/test';

test.describe('Zoho CRM Widget Studio E2E Workflow', () => {
  test('A. Application installs and starts successfully on localhost', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Zoho CRM Widget Studio/i);
    await expect(page.locator('text=Zoho CRM Widget Studio').first()).toBeVisible();
  });

  test('B. Toolbar, Activity Bar, Code Editor, Preview and DevTools are mounted', async ({ page }) => {
    await page.goto('/');

    // Verify main toolbar buttons
    await expect(page.locator('button:has-text("Save")')).toBeVisible();
    await expect(page.locator('button:has-text("Test")')).toBeVisible();

    // Verify Monaco editor is rendered
    await expect(page.locator('.monaco-editor').first()).toBeAttached();

    // Verify live preview iframe
    const previewIframe = page.locator('iframe[title="Zoho CRM Widget Live Preview"]');
    await expect(previewIframe).toBeVisible();

    // Verify DevTools panel
    await expect(page.locator('text=DevTools').first()).toBeVisible();
  });

  test('C. Navigation between Activity Bar tabs works', async ({ page }) => {
    await page.goto('/');

    // Switch to Snippets
    await page.locator('button[title="Snippet Library"]').click();
    await expect(page.locator('text=Initialize Zoho SDK').first()).toBeVisible();

    // Switch to Mock CRM Data
    await page.locator('button[title="Mock CRM Data"]').click();
    await expect(page.locator('text=Mock CRM Database')).toBeVisible();
    await expect(page.locator('select').first()).toBeVisible();

    // Switch to API Playground
    await page.locator('button[title="API Playground"]').click();
    await expect(page.locator('button:has-text("Send Request")')).toBeVisible();

    // Switch to SDK Compatibility
    await page.locator('button[title="SDK Compatibility"]').click();
    await expect(page.locator('text=SDK Compatibility Matrix')).toBeVisible();

    // Switch to Integrations
    await page.locator('button[title="Zoho CRM Integration"]').click();
    await expect(page.locator('text=OAuth Connection Status')).toBeVisible();

    // Switch to Test Runner
    await page.locator('button[title="Test Runner"]').click();
    await expect(page.locator('button:has-text("Run All Tests")')).toBeVisible();

    // Switch back to File Explorer
    await page.locator('button[title="File Explorer"]').click();
    await expect(page.locator('button[title="New File"]').first()).toBeVisible();
  });

  test('D. Live Preview executes widget and SDK communication works', async ({ page }) => {
    await page.goto('/');

    // Wait for preview iframe to load
    const iframeElement = page.frameLocator('iframe[title="Zoho CRM Widget Live Preview"]');
    
    // Check that preview content is rendered
    await expect(iframeElement.locator('body')).toBeVisible();

    // Switch to DevTools SDK Call History tab
    await page.locator('button:has-text("SDK Call History")').click();
    await expect(page.locator('text=SDK Call History').first()).toBeVisible();
  });

  test('E. API Playground executes simulated mock endpoint', async ({ page }) => {
    await page.goto('/');

    // Navigate to API Playground
    await page.locator('button[title="API Playground"]').click();

    // Send the default GET /api/v1/weather/forecast request
    await page.locator('button:has-text("Send Request")').click();

    // Verify response status 200 appears
    await expect(page.locator('text=HTTP 200')).toBeVisible();
    await expect(page.locator('text=Simulated Mock')).toBeVisible();
  });

  test('F. Test Runner executes test suite successfully', async ({ page }) => {
    await page.goto('/');

    // Navigate to Test Runner
    await page.locator('button[title="Test Runner"]').click();

    // Click Run All Tests
    await page.locator('button:has-text("Run All Tests")').click();

    // Wait for execution
    await expect(page.locator('text=Passed').first()).toBeVisible();
  });

  test('G. ZIP Import loads project successfully into Studio', async ({ page }) => {
    await page.goto('/');

    // Create a sample zip buffer
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    zip.file('app.html', '<!DOCTYPE html><html><body><h1>Create Meeting Form</h1></body></html>');
    zip.file('js/main.js', 'console.log("Meeting form ready");');
    zip.file('manifest.json', JSON.stringify({ name: 'Create Meeting Form', entryFile: 'app.html' }));

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Set up file input
    const fileChooserPromise = page.waitForEvent('filechooser').catch(() => null);
    
    // Listen for any unexpected window.alert
    let dialogMessage = '';
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });

    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'Create Meeting Form.zip',
      mimeType: 'application/zip',
      buffer: zipBuffer
    });

    // Verify project name appears in the toolbar / active tab
    await expect(page.locator('text=Create Meeting Form').first()).toBeVisible({ timeout: 5000 });
    expect(dialogMessage).not.toContain('Cannot read properties of undefined');
  });

  test('H. Theme toggle button in Activity Bar toggles light and dark mode', async ({ page }) => {
    await page.goto('/');

    const themeButton = page.locator('button[title*="Mode"]').first();
    await expect(themeButton).toBeVisible();

    const html = page.locator('html');
    const isInitiallyDark = await html.evaluate((el) => el.classList.contains('dark'));

    // Click theme toggle
    await themeButton.click();

    // The dark class should be toggled
    const isDarkAfterToggle = await html.evaluate((el) => el.classList.contains('dark'));
    expect(isDarkAfterToggle).toBe(!isInitiallyDark);

    // Toggle back
    await themeButton.click();
    const isDarkAfterSecondToggle = await html.evaluate((el) => el.classList.contains('dark'));
    expect(isDarkAfterSecondToggle).toBe(isInitiallyDark);
  });

  test('I. AI Copilot opens, configures external providers, and assists with Zoho SDK code', async ({ page }) => {
    await page.goto('/');

    // Click AI Copilot shortcut button on toolbar
    await page.locator('button:has-text("AI Copilot")').click();

    // Verify AI Copilot panel is visible
    await expect(page.locator('text=AI Copilot').first()).toBeVisible();
    await expect(page.locator('text=Simulator').first()).toBeVisible();

    // Open AI Settings Modal
    await page.locator('button[title="Configure AI Provider & Models"]').click();
    await expect(page.locator('text=AI System & Model Configuration')).toBeVisible();

    // Verify external providers are selectable (OpenAI / Codex, Claude, Gemini, Ollama)
    await expect(page.locator('button:has-text("OpenAI / Codex")')).toBeVisible();
    await expect(page.locator('button:has-text("Anthropic Claude")')).toBeVisible();
    await expect(page.locator('button:has-text("Ollama")')).toBeVisible();

    // Select OpenAI provider to verify model identifier updates
    await page.locator('button:has-text("OpenAI / Codex")').click();
    const modelInput = page.locator('input[placeholder*="gpt-4o"]').first();
    await expect(modelInput).toHaveValue('gpt-4o-mini');

    // Select Simulator back for local automated execution
    await page.locator('button:has-text("Built-in Zoho Copilot")').click();
    await page.locator('button:has-text("Save Configuration")').click();
    await expect(page.locator('text=AI System & Model Configuration')).not.toBeVisible();

    // Click quick action "Fix Bug"
    await page.locator('button:has-text("Fix Bug")').click();

    // Verify AI Copilot generates code block with ZOHO.embeddedApp.init
    await expect(page.locator('text=ZOHO.embeddedApp.init').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Apply to File")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Insert")').first()).toBeVisible();
  });
});
