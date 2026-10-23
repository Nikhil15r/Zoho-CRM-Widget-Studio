import { Database as DatabaseType } from 'better-sqlite3';
import JSZip from 'jszip';
import {
  ProjectFile,
  ProjectManifest,
  ProjectPackage,
  ProjectSummary
} from '@zoho-studio/shared';

export class ProjectService {
  constructor(private db: DatabaseType) {}

  public getProjects(): ProjectSummary[] {
    const projects = this.db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all() as any[];
    const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM project_files WHERE project_id = ?');

    return projects.map((p) => {
      const fileCount = (countStmt.get(p.id) as { count: number }).count;
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        version: p.version,
        entryFile: p.entry_file,
        runtimeMode: p.runtime_mode as 'html' | 'react',
        fileCount,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      };
    });
  }

  public getProject(id: string): ProjectPackage | null {
    const row = this.db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
    if (!row) return null;

    const filesRows = this.db.prepare('SELECT * FROM project_files WHERE project_id = ? ORDER BY path ASC').all(id) as any[];

    const manifest: ProjectManifest = {
      id: row.id,
      name: row.name,
      description: row.description,
      version: row.version,
      entryFile: row.entry_file,
      runtimeMode: row.runtime_mode,
      framework: row.framework,
      zohoConfig: JSON.parse(row.zoho_config_json || '{}'),
      envVariables: JSON.parse(row.env_vars_json || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    const files: ProjectFile[] = filesRows.map((f) => ({
      path: f.path,
      name: f.name,
      content: f.content,
      isDirectory: Boolean(f.is_directory),
      updatedAt: f.updated_at,
      size: Buffer.byteLength(f.content || '', 'utf-8')
    }));

    return { manifest, files };
  }

  public createProject(
    data: {
      name: string;
      description?: string;
      version?: string;
      entryFile?: string;
      runtimeMode?: 'html' | 'react';
      framework?: 'vanilla' | 'react';
      zohoConfig?: any;
      files?: ProjectFile[];
    }
  ): ProjectPackage {
    const id = 'proj_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    const manifest: ProjectManifest = {
      id,
      name: data.name,
      description: data.description || '',
      version: data.version || '1.0.0',
      entryFile: data.entryFile || 'app.html',
      runtimeMode: data.runtimeMode || 'html',
      framework: data.framework || 'vanilla',
      zohoConfig: data.zohoConfig || {
        targetEntity: 'Deals',
        defaultRecordId: '548291000001234001',
        simulatedLatencyMs: 50,
        simulateErrors: false
      },
      envVariables: {},
      createdAt: now,
      updatedAt: now
    };

    const defaultFiles: ProjectFile[] = data.files && data.files.length > 0
      ? data.files
      : [
          {
            path: 'app.html',
            name: 'app.html',
            isDirectory: false,
            content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${data.name}</title>
  <link rel="stylesheet" href="css/style.css">
  <script src="https://live.zwidgets.com/js-sdk/1.2/ZohoEmbededAppSDK.min.js"></script>
</head>
<body>
  <div class="container">
    <h2>${data.name}</h2>
    <div id="status">Initializing Zoho SDK...</div>
    <div id="content"></div>
  </div>
  <script src="js/main.js"></script>
</body>
</html>`,
            updatedAt: now
          },
          {
            path: 'js/main.js',
            name: 'main.js',
            isDirectory: false,
            content: `// Zoho CRM Widget Entry Script
console.log("Widget starting...");

ZOHO.embeddedApp.on("PageLoad", function(data) {
  console.log("PageLoad event received:", data);
  document.getElementById("status").textContent = "Loaded for: " + (data.Entity || "Unknown Entity");
  
  if (data.EntityId) {
    ZOHO.CRM.API.getRecord({ Entity: data.Entity, RecordID: data.EntityId })
      .then(function(response) {
        console.log("Record data:", response);
        var rec = response.data[0];
        document.getElementById("content").innerHTML = 
          "<pre>" + JSON.stringify(rec, null, 2) + "</pre>";
      })
      .catch(function(err) {
        console.error("Error fetching record:", err);
      });
  }
});

ZOHO.embeddedApp.init();
`,
            updatedAt: now
          },
          {
            path: 'css/style.css',
            name: 'style.css',
            isDirectory: false,
            content: `body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 16px;
  background: #f8fafc;
  color: #1e293b;
}

.container {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

h2 {
  margin-top: 0;
  color: #0f172a;
}

#status {
  padding: 8px 12px;
  background: #e2e8f0;
  border-radius: 4px;
  font-size: 13px;
  margin-bottom: 16px;
}

pre {
  background: #f1f5f9;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  overflow: auto;
}
`,
            updatedAt: now
          },
          {
            path: 'README.md',
            name: 'README.md',
            isDirectory: false,
            content: `# ${data.name}

A custom Zoho CRM widget built with Zoho CRM Widget Studio.

## Structure
- \`app.html\`: Widget entry point
- \`js/main.js\`: Core logic using \`ZOHO.embeddedApp\`
- \`css/style.css\`: Widget styles
`,
            updatedAt: now
          }
        ];

    const insertProject = this.db.prepare(
      `INSERT INTO projects (id, name, description, version, entry_file, runtime_mode, framework, zoho_config_json, env_vars_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const insertFile = this.db.prepare(
      `INSERT INTO project_files (project_id, path, name, content, is_directory, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    const tx = this.db.transaction(() => {
      insertProject.run(
        manifest.id,
        manifest.name,
        manifest.description,
        manifest.version,
        manifest.entryFile,
        manifest.runtimeMode,
        manifest.framework,
        JSON.stringify(manifest.zohoConfig),
        JSON.stringify(manifest.envVariables || {}),
        now,
        now
      );

      for (const f of defaultFiles) {
        insertFile.run(
          manifest.id,
          f.path,
          f.name || f.path.split('/').pop() || f.path,
          f.content || '',
          f.isDirectory ? 1 : 0,
          f.updatedAt || now
        );
      }
    });

    tx();
    return { manifest, files: defaultFiles };
  }

  public duplicateProject(sourceId: string, newName?: string): ProjectPackage {
    const source = this.getProject(sourceId);
    if (!source) {
      throw new Error(`Source project with ID "${sourceId}" not found.`);
    }

    const name = newName || `${source.manifest.name} (Copy)`;
    return this.createProject({
      name,
      description: source.manifest.description,
      version: source.manifest.version,
      entryFile: source.manifest.entryFile,
      runtimeMode: source.manifest.runtimeMode,
      framework: source.manifest.framework,
      zohoConfig: source.manifest.zohoConfig,
      files: source.files.map((f) => ({ ...f }))
    });
  }

  public updateProjectManifest(id: string, updates: Partial<ProjectManifest>): ProjectManifest {
    const existing = this.getProject(id);
    if (!existing) {
      throw new Error(`Project "${id}" not found.`);
    }

    const updatedManifest: ProjectManifest = {
      ...existing.manifest,
      ...updates,
      id: existing.manifest.id,
      createdAt: existing.manifest.createdAt,
      updatedAt: new Date().toISOString()
    };

    this.db.prepare(
      `UPDATE projects SET 
         name = ?, 
         description = ?, 
         version = ?, 
         entry_file = ?, 
         runtime_mode = ?, 
         framework = ?, 
         zoho_config_json = ?, 
         env_vars_json = ?, 
         updated_at = ?
       WHERE id = ?`
    ).run(
      updatedManifest.name,
      updatedManifest.description,
      updatedManifest.version,
      updatedManifest.entryFile,
      updatedManifest.runtimeMode,
      updatedManifest.framework,
      JSON.stringify(updatedManifest.zohoConfig),
      JSON.stringify(updatedManifest.envVariables || {}),
      updatedManifest.updatedAt,
      id
    );

    return updatedManifest;
  }

  public deleteProject(id: string): void {
    const res = this.db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    if (res.changes === 0) {
      throw new Error(`Project "${id}" not found.`);
    }
  }

  public saveFile(projectId: string, file: ProjectFile): ProjectFile {
    const existing = this.getProject(projectId);
    if (!existing) {
      throw new Error(`Project "${projectId}" not found.`);
    }

    // Clean relative path (prevent leading slashes or ../)
    const cleanPath = this.sanitizeRelativePath(file.path);
    const now = new Date().toISOString();
    const name = file.name || cleanPath.split('/').pop() || cleanPath;

    this.db.prepare(
      `INSERT INTO project_files (project_id, path, name, content, is_directory, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(project_id, path) DO UPDATE SET 
         content = excluded.content,
         name = excluded.name,
         is_directory = excluded.is_directory,
         updated_at = excluded.updated_at`
    ).run(
      projectId,
      cleanPath,
      name,
      file.content,
      file.isDirectory ? 1 : 0,
      now
    );

    // Update project updated_at
    this.db.prepare('UPDATE projects SET updated_at = ? WHERE id = ?').run(now, projectId);

    return {
      path: cleanPath,
      name,
      content: file.content,
      isDirectory: file.isDirectory,
      updatedAt: now,
      size: Buffer.byteLength(file.content || '', 'utf-8')
    };
  }

  public deleteFile(projectId: string, filePath: string): void {
    const cleanPath = this.sanitizeRelativePath(filePath);
    this.db.prepare('DELETE FROM project_files WHERE project_id = ? AND path = ?').run(projectId, cleanPath);
    this.db.prepare('UPDATE projects SET updated_at = ? WHERE id = ?').run(new Date().toISOString(), projectId);
  }

  public async exportZip(projectId: string): Promise<Buffer> {
    const pkg = this.getProject(projectId);
    if (!pkg) {
      throw new Error(`Project "${projectId}" not found.`);
    }

    const zip = new JSZip();

    // Add manifest.json
    zip.file('manifest.json', JSON.stringify(pkg.manifest, null, 2));

    // Add all files
    for (const file of pkg.files) {
      if (!file.isDirectory) {
        zip.file(file.path, file.content);
      }
    }

    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    return buffer;
  }

  public async importZip(zipBuffer: Buffer, overrideName?: string): Promise<ProjectPackage> {
    const zip = new JSZip();
    await zip.loadAsync(zipBuffer);

    let manifest: Partial<ProjectManifest> | null = null;
    const files: ProjectFile[] = [];
    const now = new Date().toISOString();

    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue;

      // Security check: Zip Slip / Path Traversal protection
      const safePath = this.sanitizeRelativePath(relativePath);
      if (!safePath) continue;

      if (safePath === 'manifest.json') {
        try {
          const content = await zipEntry.async('string');
          manifest = JSON.parse(content);
        } catch (e) {
          console.warn('Failed to parse manifest.json from zip:', e);
        }
      } else {
        const content = await zipEntry.async('string');
        const name = safePath.split('/').pop() || safePath;
        files.push({
          path: safePath,
          name,
          content,
          isDirectory: false,
          updatedAt: now,
          size: Buffer.byteLength(content, 'utf-8')
        });
      }
    }

    if (files.length === 0) {
      throw new Error('Import failed: ZIP file contains no valid project files.');
    }

    // If all files are nested inside a single top-level folder (e.g. "Create Meeting Form/app.html"), unwrap it
    const allPaths = files.map((f) => f.path);
    if (allPaths.length > 0 && allPaths.every((p) => p.includes('/'))) {
      const firstDir = allPaths[0].split('/')[0] + '/';
      if (allPaths.every((p) => p.startsWith(firstDir))) {
        for (const file of files) {
          file.path = file.path.substring(firstDir.length);
          file.name = file.path.split('/').pop() || file.path;
        }
      }
    }

    // Determine entry file intelligently
    let entryFile = manifest?.entryFile;
    if (!entryFile || !files.some((f) => f.path === entryFile)) {
      if (files.some((f) => f.path === 'app.html')) {
        entryFile = 'app.html';
      } else if (files.some((f) => f.path === 'index.html')) {
        entryFile = 'index.html';
      } else if (files.some((f) => f.path === 'app/index.html')) {
        entryFile = 'app/index.html';
      } else if (files.some((f) => f.path.endsWith('.html'))) {
        entryFile = files.find((f) => f.path.endsWith('.html'))!.path;
      } else if (files.length > 0) {
        entryFile = files[0].path;
      }
    }

    const projectName = overrideName || manifest?.name || 'Imported Widget Project';

    return this.createProject({
      name: projectName,
      description: manifest?.description || 'Imported from ZIP archive',
      version: manifest?.version || '1.0.0',
      entryFile,
      runtimeMode: manifest?.runtimeMode || 'html',
      framework: manifest?.framework || 'vanilla',
      zohoConfig: manifest?.zohoConfig || {
        targetEntity: 'Deals',
        defaultRecordId: '548291000001234001',
        simulatedLatencyMs: 50,
        simulateErrors: false
      },
      files
    });
  }

  public sanitizeRelativePath(filePath: string): string {
    // Strip leading slashes, convert backslashes to forward slashes
    let normalized = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
    
    // Check for directory traversal
    const segments = normalized.split('/');
    const safeSegments: string[] = [];

    for (const segment of segments) {
      if (!segment || segment === '.') continue;
      if (segment === '..') {
        throw new Error(`Security Violation: Path traversal attempted in path: "${filePath}"`);
      }
      safeSegments.push(segment);
    }

    return safeSegments.join('/');
  }
}
