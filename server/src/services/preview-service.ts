import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ProjectService } from './project-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PreviewService {
  private sdkScriptContent: string;

  constructor(private projectService: ProjectService) {
    let sdkPath = path.resolve(__dirname, '../sdk-simulator/zoho-sdk-simulator.js');
    if (!fs.existsSync(sdkPath)) {
      sdkPath = path.resolve(__dirname, '../../src/sdk-simulator/zoho-sdk-simulator.js');
    }
    this.sdkScriptContent = fs.readFileSync(sdkPath, 'utf-8');
  }

  public getSdkScript(): string {
    return this.sdkScriptContent;
  }

  public getProjectAsset(
    projectId: string,
    assetPath: string
  ): { content: string | Buffer; mimeType: string } | null {
    const pkg = this.projectService.getProject(projectId);
    if (!pkg) return null;

    let cleanPath = assetPath.replace(/^\/+/, '');
    if (!cleanPath) {
      cleanPath = pkg.manifest.entryFile || 'app.html';
    }

    const file = pkg.files.find(
      (f) => f.path.toLowerCase() === cleanPath.toLowerCase() || f.path.toLowerCase() === cleanPath.replace(/\/$/, '').toLowerCase()
    );

    if (!file) {
      return null;
    }

    const ext = path.extname(cleanPath).toLowerCase();
    const mimeType = this.getMimeType(ext);

    let content: string | Buffer = file.content;

    // Inject SDK simulator script into HTML
    if (ext === '.html' || ext === '.htm') {
      content = this.injectSdkScript(file.content);
    }

    return { content, mimeType };
  }

  private injectSdkScript(html: string): string {
    // If the HTML already has script tag referencing Zoho SDK, we can let it load from /sdk/ZohoEmbededAppSDK.js
    // We also directly inject an inline script tag at the top of <head> or <body> for guaranteed simulator availability
    const scriptTag = `
<!-- Zoho CRM Widget Studio SDK Simulator -->
<script src="/sdk/ZohoEmbededAppSDK.js"></script>
`;

    // Replace live zwidgets SDK url with local simulator if present
    let modified = html.replace(
      /https:\/\/live\.zwidgets\.com\/js-sdk\/[0-9.]+\/ZohoEmbededAppSDK\.min\.js/gi,
      '/sdk/ZohoEmbededAppSDK.js'
    );

    if (modified.includes('</head>')) {
      return modified.replace('</head>', `${scriptTag}</head>`);
    } else if (modified.includes('<body>')) {
      return modified.replace('<body>', `<body>${scriptTag}`);
    } else {
      return `${scriptTag}${modified}`;
    }
  }

  private getMimeType(ext: string): string {
    switch (ext) {
      case '.html':
      case '.htm':
        return 'text/html; charset=utf-8';
      case '.js':
      case '.mjs':
        return 'application/javascript; charset=utf-8';
      case '.css':
        return 'text/css; charset=utf-8';
      case '.json':
        return 'application/json; charset=utf-8';
      case '.svg':
        return 'image/svg+xml';
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.gif':
        return 'image/gif';
      case '.ico':
        return 'image/x-icon';
      case '.txt':
      case '.md':
        return 'text/plain; charset=utf-8';
      default:
        return 'application/octet-stream';
    }
  }
}
