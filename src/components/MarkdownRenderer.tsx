
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({children}) => <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>,
          h2: ({children}) => <h2 className="text-xl font-semibold text-white mb-3">{children}</h2>,
          h3: ({children}) => <h3 className="text-lg font-medium text-white mb-2">{children}</h3>,
          p: ({children}) => <p className="text-gray-300 mb-3 leading-relaxed">{children}</p>,
          ul: ({children}) => <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1">{children}</ul>,
          ol: ({children}) => <ol className="list-decimal list-inside text-gray-300 mb-3 space-y-1">{children}</ol>,
          li: ({children}) => <li className="text-gray-300">{children}</li>,
          code: ({children, className}) => {
            const isBlock = className?.includes('language-');
            if (isBlock) {
              return (
                <pre className="bg-gray-900 border border-gray-700 rounded p-4 overflow-x-auto mb-3">
                  <code className="text-cyan-400 text-sm">{children}</code>
                </pre>
              );
            }
            return <code className="bg-gray-800 text-cyan-400 px-1 py-0.5 rounded text-sm">{children}</code>;
          },
          blockquote: ({children}) => (
            <blockquote className="border-l-4 border-cyan-500 pl-4 text-gray-300 italic mb-3">
              {children}
            </blockquote>
          ),
          a: ({children, href}) => (
            <a href={href} className="text-cyan-400 hover:text-cyan-300 underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          table: ({children}) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full border border-gray-600 rounded">
                {children}
              </table>
            </div>
          ),
          th: ({children}) => (
            <th className="border border-gray-600 bg-gray-800 px-3 py-2 text-left text-white font-medium">
              {children}
            </th>
          ),
          td: ({children}) => (
            <td className="border border-gray-600 px-3 py-2 text-gray-300">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
