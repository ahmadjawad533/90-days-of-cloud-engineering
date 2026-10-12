import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '../..');
const daysDir = path.join(rootDir, 'days');
const resourcesDir = path.join(rootDir, 'resources');
const cheatsheetsDir = path.join(resourcesDir, 'cheatsheets');
const projectsDir = path.join(rootDir, 'projects');
const outputDir = path.resolve(__dirname, '../src/data');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Module groupings definition
const MODULES = [
  { id: 1, title: 'Cloud & Networking Fundamentals', days: [1, 7], icon: 'Network', color: 'blue' },
  { id: 2, title: 'Linux & Shell Scripting', days: [8, 18], icon: 'Terminal', color: 'indigo' },
  { id: 3, title: 'Git & GitHub Workflow', days: [19, 24], icon: 'GitBranch', color: 'amber' },
  { id: 4, title: 'Python for Cloud Automation', days: [25, 31], icon: 'FileCode', color: 'emerald' },
  { id: 5, title: 'Core AWS Services', days: [32, 40], icon: 'Cloud', color: 'orange' },
  { id: 6, title: 'Containers & Docker', days: [41, 47], icon: 'Box', color: 'cyan' },
  { id: 7, title: 'Kubernetes & Managed Clusters', days: [48, 56], icon: 'Layers', color: 'sky' },
  { id: 8, title: 'Infrastructure as Code (Terraform)', days: [57, 64], icon: 'Cpu', color: 'purple' },
  { id: 9, title: 'CI/CD with GitHub Actions', days: [65, 71], icon: 'GitPullRequest', color: 'rose' },
  { id: 10, title: 'Monitoring & Observability', days: [72, 77], icon: 'Activity', color: 'red' },
  { id: 11, title: 'Cloud Security & Cost Control', days: [78, 83], icon: 'ShieldCheck', color: 'green' },
  { id: 12, title: 'Capstone Project', days: [84, 90], icon: 'Award', color: 'yellow' },
  { id: 13, title: 'Bonus: Certifications & Careers', days: [91, 95], icon: 'Compass', color: 'teal' },
];

function getModuleForDay(dayNum) {
  for (const mod of MODULES) {
    if (dayNum >= mod.days[0] && dayNum <= mod.days[1]) {
      return mod;
    }
  }
  return MODULES[0];
}

console.log('📦 Parsing 95 day guides...');
const dayFolders = fs.readdirSync(daysDir)
  .filter(f => f.startsWith('day-') && fs.statSync(path.join(daysDir, f)).isDirectory())
  .sort((a, b) => {
    const numA = parseInt(a.match(/day-(\d+)/)[1], 10);
    const numB = parseInt(b.match(/day-(\d+)/)[1], 10);
    return numA - numB;
  });

const days = [];

for (const folder of dayFolders) {
  const dayNum = parseInt(folder.match(/day-(\d+)/)[1], 10);
  const readmePath = path.join(daysDir, folder, 'README.md');
  if (!fs.existsSync(readmePath)) continue;

  const content = fs.readFileSync(readmePath, 'utf-8');

  // Title
  const titleMatch = content.match(/^#\s+(?:Day\s+\d+:\s*)([^\r\n]+)/m);
  const title = titleMatch ? titleMatch[1].trim() : folder;

  // Goal
  const goalMatch = content.match(/## Goal\s+([^\r\n]+(?:\r?\n[^\r\n#]+)*)/i);
  const goal = goalMatch ? goalMatch[1].trim() : '';

  // Time
  const timeMatch = content.match(/## Time\s+(?:⏱️\s*)?([^\r\n]+)/i);
  const time = timeMatch ? timeMatch[1].trim() : '60-90 minutes';

  // Done When checklist
  const doneWhenSection = content.split(/## Done When/i)[1]?.split(/##/)[0] || '';
  const checklist = [];
  const checkMatches = doneWhenSection.matchAll(/-\s*\[\s*\]\s*([^\r\n]+)/g);
  for (const m of checkMatches) {
    checklist.push(m[1].trim());
  }

  // Cost and Cleanup
  const costSection = content.split(/## Cost and Cleanup/i)[1]?.split(/##/)[0] || '';
  const isPaid = content.includes('💳');

  const mod = getModuleForDay(dayNum);

  days.push({
    day: dayNum,
    slug: folder,
    title,
    module: {
      id: mod.id,
      title: mod.title,
      color: mod.color,
      icon: mod.icon,
    },
    goal,
    time,
    isPaid,
    checklist,
    rawContent: content,
  });
}

console.log(`✅ Loaded ${days.length} days.`);

// Parse Cheatsheets
console.log('📦 Parsing cheatsheets...');
const cheatsheets = [];
if (fs.existsSync(cheatsheetsDir)) {
  const files = fs.readdirSync(cheatsheetsDir).filter(f => f.endsWith('.md'));
  for (const f of files) {
    const name = f.replace('.md', '');
    const content = fs.readFileSync(path.join(cheatsheetsDir, f), 'utf-8');
    cheatsheets.push({
      id: name,
      title: name.toUpperCase() + ' Cheatsheet',
      content,
    });
  }
}

// Parse Glossary
let glossaryContent = '';
const glossaryPath = path.join(resourcesDir, 'glossary.md');
if (fs.existsSync(glossaryPath)) {
  glossaryContent = fs.readFileSync(glossaryPath, 'utf-8');
}

// Parse Interview Questions
let interviewContent = '';
const interviewPath = path.join(resourcesDir, 'interview-questions.md');
if (fs.existsSync(interviewPath)) {
  interviewContent = fs.readFileSync(interviewPath, 'utf-8');
}

// Parse Certifications
let certsContent = '';
const certsPath = path.join(resourcesDir, 'certifications.md');
if (fs.existsSync(certsPath)) {
  certsContent = fs.readFileSync(certsPath, 'utf-8');
}

// Parse Capstone
let capstoneContent = '';
const capstonePath = path.join(projectsDir, 'capstone', 'README.md');
if (fs.existsSync(capstonePath)) {
  capstoneContent = fs.readFileSync(capstonePath, 'utf-8');
}

const payload = {
  modules: MODULES,
  days,
  cheatsheets,
  glossary: glossaryContent,
  interview: interviewContent,
  certifications: certsContent,
  capstone: capstoneContent,
};

fs.writeFileSync(path.join(outputDir, 'curriculum.json'), JSON.stringify(payload, null, 2));
console.log('🎉 Successfully generated frontend/src/data/curriculum.json!');
