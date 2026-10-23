import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { ProjectService } from '../src/services/project-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ProjectService (Files, Packaging & Security)', () => {
  let db: any;
  let service: ProjectService;

  beforeEach(() => {
    db = new Database(':memory:');
    const schemaSql = fs.readFileSync(path.resolve(__dirname, '../src/db/schema.sql'), 'utf-8');
    db.exec(schemaSql);
    service = new ProjectService(db);
  });

  it('should create project with default template files', () => {
    const pkg = service.createProject({ name: 'Test Widget' });
    expect(pkg.manifest.name).toBe('Test Widget');
    expect(pkg.files.length).toBeGreaterThanOrEqual(3);
    expect(pkg.files.some((f) => f.path === 'app.html')).toBe(true);
    expect(pkg.files.some((f) => f.path === 'js/main.js')).toBe(true);
  });

  it('should save and update files within a project', () => {
    const pkg = service.createProject({ name: 'Editable Widget' });
    const saved = service.saveFile(pkg.manifest.id, {
      path: 'js/utils.js',
      name: 'utils.js',
      content: 'export function helper() { return 42; }',
      isDirectory: false
    });

    expect(saved.path).toBe('js/utils.js');
    const updatedPkg = service.getProject(pkg.manifest.id);
    expect(updatedPkg?.files.some((f) => f.path === 'js/utils.js')).toBe(true);
  });

  it('should export project as valid ZIP archive', async () => {
    const pkg = service.createProject({ name: 'Exportable Widget' });
    const zipBuffer = await service.exportZip(pkg.manifest.id);
    expect(zipBuffer.length).toBeGreaterThan(0);

    const zip = new JSZip();
    const loaded = await zip.loadAsync(zipBuffer);
    expect(loaded.file('manifest.json')).toBeDefined();
    expect(loaded.file('app.html')).toBeDefined();
  });

  it('should import ZIP archive safely', async () => {
    const zip = new JSZip();
    zip.file('app.html', '<h1>Imported HTML</h1>');
    zip.file('js/app.js', 'console.log("imported");');
    zip.file('manifest.json', JSON.stringify({ name: 'Imported Widget Name', entryFile: 'app.html' }));

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    const imported = await service.importZip(zipBuffer);

    expect(imported.manifest.name).toBe('Imported Widget Name');
    expect(imported.files.some((f) => f.path === 'app.html')).toBe(true);
  });

  it('should prevent path traversal attacks in sanitizeRelativePath and saveFile', () => {
    expect(() => {
      service.sanitizeRelativePath('../../../evil.txt');
    }).toThrow(/Security Violation|Path traversal/);

    expect(() => {
      service.sanitizeRelativePath('js/../../secret.env');
    }).toThrow(/Security Violation|Path traversal/);

    const pkg = service.createProject({ name: 'Safe Widget' });
    expect(() => {
      service.saveFile(pkg.manifest.id, {
        path: '../../etc/passwd',
        name: 'passwd',
        content: 'malicious',
        isDirectory: false
      });
    }).toThrow(/Security Violation|Path traversal/);
  });
});
