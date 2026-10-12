import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Award, CheckSquare, Sparkles } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface CapstoneViewerProps {
  content: string;
}

const RUBRIC_CRITERIA = [
  { id: 'iac', name: 'Infrastructure as Code (Terraform)', max: 20, desc: 'Modular Terraform for VPC, subnets, ECS, RDS with zero hardcoded values.' },
  { id: 'container', name: 'Containerization (Docker)', max: 15, desc: 'Multi-stage Dockerfile, non-root user, minimal base image, local docker-compose.' },
  { id: 'cicd', name: 'CI/CD Automation (GitHub Actions)', max: 15, desc: 'Automated test suite, Trivy container security scanning, automated build & push.' },
  { id: 'app', name: 'Cloud Application (Flask REST API)', max: 15, desc: 'Functional CRUD endpoints, /health endpoint, PostgreSQL persistence.' },
  { id: 'monitoring', name: 'Monitoring & Observability', max: 10, desc: 'Structured JSON logs, CloudWatch metrics, working automated alarm.' },
  { id: 'security', name: 'Security Hardening', max: 10, desc: 'Private subnets, least privilege IAM policies, secrets in Secrets Manager.' },
  { id: 'docs', name: 'Documentation & Architecture', max: 10, desc: 'Polished README, architecture diagram, reproduction steps, recorded walkthrough.' },
  { id: 'cost', name: 'FinOps & Teardown', max: 5, desc: 'Right-sized resources, cost estimate, and verified 100% clean teardown.' },
];

export const CapstoneViewer: React.FC<CapstoneViewerProps> = ({ content }) => {
  const [scores, setScores] = useState<Record<string, number>>({});

  const handleScoreChange = (id: string, val: number) => {
    setScores((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-xs font-bold text-amber-600 dark:text-amber-400">
          <Award className="w-3.5 h-3.5" />
          <span>Final Milestone • Days 84–90</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Cloud-Native Task Manager Capstone Project
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Architect, automate, containerize, secure, monitor, and deploy an end-to-end production-grade three-tier application on AWS.
        </p>
      </div>

      {/* Interactive Rubric Calculator Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Interactive 100-Point Grading Rubric
            </h2>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 text-sm font-extrabold text-blue-700 dark:text-blue-300">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Score: {totalScore} / 100</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RUBRIC_CRITERIA.map((crit) => {
            const current = scores[crit.id] || 0;

            return (
              <div
                key={crit.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">{crit.name}</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {current}/{crit.max} pts
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {crit.desc}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="range"
                    min={0}
                    max={crit.max}
                    value={current}
                    onChange={(e) => handleScoreChange(crit.id, parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Capstone Markdown Specification Content */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:border-b prose-h2:border-slate-200 dark:prose-h2:border-slate-800 prose-h2:pb-2 prose-h2:mt-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !match && !String(children).includes('\n');
              if (isInline) {
                return (
                  <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono text-xs font-semibold" {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <CodeBlock
                  language={match ? match[1] : 'bash'}
                  value={String(children).replace(/\n$/, '')}
                />
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

    </div>
  );
};
