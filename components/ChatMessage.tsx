
import React, { useRef, useState } from 'react';
import { Message } from '../types';
import { BotIcon, UserIcon, LoadingIcon, DownloadIcon, GoogleIcon, ClipboardDocumentListIcon, CalendarIcon, BeakerIcon, EnvelopeIcon, TableCellsIcon, PrinterIcon, CircuitIcon, ThinkingSpinnerIcon, BrainIcon, ChevronDownIcon, ChevronUpIcon, ClipboardIcon, CheckIcon } from './icons';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
  processingMessage?: string | null;
  onExecutePlan?: () => void;
}

const BlinkingCursor: React.FC = () => (
    <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1"></span>
);

// Utility for basic syntax highlighting without external libraries
const highlightSyntax = (code: string, lang: string): string => {
    // Escape HTML
    let safeCode = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Common Keywords (simplified list)
    const keywords = /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|def|async|await|try|catch|switch|case|break|continue|default|typeof|instanceof|new|this|true|false|null|undefined)\b/g;
    
    // Strings (single or double quotes)
    const strings = /(['"`])(.*?)\1/g;
    
    // Comments (single line // or #)
    const comments = /(\/\/.*$|#.*$)/gm;
    
    // Numbers
    const numbers = /\b(\d+)\b/g;

    // Apply styling
    safeCode = safeCode
        .replace(strings, '<span class="text-green-400">$1$2$1</span>')
        .replace(comments, '<span class="text-gray-500 italic">$1</span>')
        .replace(keywords, '<span class="text-purple-400 font-semibold">$1</span>')
        .replace(numbers, '<span class="text-orange-400">$1</span>');

    return safeCode;
};

const CodeBlock: React.FC<{ language: string, code: string }> = ({ language, code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="rounded-lg overflow-hidden border border-gray-700 my-4 bg-[#1e1e1e] shadow-lg">
            <div className="flex justify-between items-center bg-[#2d2d2d] px-4 py-2 border-b border-gray-700">
                <span className="text-xs font-sans text-gray-400 uppercase tracking-wider font-bold">{language || 'CODE'}</span>
                <button 
                    onClick={handleCopy} 
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors bg-gray-700/50 hover:bg-gray-600 px-2 py-1 rounded"
                >
                    {copied ? <CheckIcon className="w-3.5 h-3.5 text-green-400" /> : <ClipboardIcon className="w-3.5 h-3.5" />}
                    {copied ? 'Copiado' : 'Copiar'}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300 leading-relaxed">
                <code dangerouslySetInnerHTML={{ __html: highlightSyntax(code, language) }} />
            </pre>
        </div>
    );
};

const PlanDisplay: React.FC<{ plan: NonNullable<Message['plan']>, onExecutePlan?: () => void }> = ({ plan, onExecutePlan }) => (
    <div className="mt-3 p-3 bg-gray-800/50 border border-gray-600 rounded-lg">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
            <ClipboardDocumentListIcon className="w-5 h-5" />
            Plan de Investigación
        </h4>
        <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
            {plan.steps.map((step, i) => (
                <li key={i}>{step}</li>
            ))}
        </ol>
        <div className="mt-4 pt-3 border-t border-gray-700 flex justify-end">
            {plan.isExecuted ? (
                <p className="text-xs text-teal-400 font-medium">✓ Plan ejecutado.</p>
            ) : (
                onExecutePlan && (
                    <button
                        onClick={onExecutePlan}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Buscar
                    </button>
                )
            )}
        </div>
    </div>
);

const ToolCallDisplay: React.FC<{ toolCalls: NonNullable<Message['toolCalls']> }> = ({ toolCalls }) => (
    <div className="mt-3 p-3 bg-gray-800/50 border border-teal-500/50 rounded-lg space-y-3">
        {toolCalls.map((call, i) => {
            let icon: React.ReactNode;
            switch (call.name) {
                case 'create_calendar_event':
                    icon = <CalendarIcon className="w-5 h-5 text-red-400" />;
                    break;
                case 'draft_email':
                    icon = <EnvelopeIcon className="w-5 h-5 text-green-400" />;
                    break;
                case 'extract_data':
                    icon = <TableCellsIcon className="w-5 h-5 text-purple-400" />;
                    break;
                default:
                    icon = <BeakerIcon className="w-5 h-5 text-teal-400" />;
            }
            return (
                <div key={i}>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-teal-300 mb-2">
                        {icon}
                        Ejecutando herramienta: {call.name}
                    </h4>
                    <pre className="text-xs bg-black/30 p-2 rounded-md overflow-x-auto text-gray-300">
                        <code>{JSON.stringify(call.args, null, 2)}</code>
                    </pre>
                </div>
            );
        })}
    </div>
);

const getFilenameExtensionFromDataUrl = (dataUrl: string): string => {
  const mimeTypeMatch = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  if (mimeTypeMatch && mimeTypeMatch[1]) {
    const mimeType = mimeTypeMatch[1];
    switch (mimeType) {
      case 'image/png': return 'png';
      case 'image/jpeg': return 'jpeg';
      case 'image/webp': return 'webp';
      // Add other image types as needed
      default: return 'bin'; // Fallback for unknown types
    }
  }
  return 'bin'; // Default if MIME type can't be parsed
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading = false, processingMessage, onExecutePlan }) => {
  const isModel = message.role === 'model';
  const printableContentRef = useRef<HTMLDivElement>(null);
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);

  const handlePrint = () => {
    const printContent = printableContentRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
        <html>
            <head>
                <title>Ficha Imprimible - AI Rick</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    body { font-family: sans-serif; color: #111827; margin: 2rem; }
                    h1, h2, h3, h4 { color: #1f2937; border-bottom: 1px solid #d1d5db; padding-bottom: 0.5rem; margin-top: 1.5rem; }
                    pre, code { background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 0.25rem; padding: 0.5rem; white-space: pre-wrap; word-wrap: break-word; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #d1d5db; padding: 0.5rem; text-align: left; }
                    th { background-color: #f9fafb; }
                    ul, ol { padding-left: 1.5rem; }
                    hr { border-top: 2px dashed #9ca3af; margin: 1.5rem 0; }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const wrapperClasses = isModel
    ? 'flex items-start gap-3'
    : 'flex items-start gap-3 flex-row-reverse';
  
  const bubbleClasses = message.isToolResponse 
    ? 'bg-gray-600 text-gray-400 italic text-sm rounded-lg'
    : isModel
    ? 'bg-gray-700 text-gray-100 rounded-lg rounded-tl-none'
    : 'bg-blue-600 text-white rounded-lg rounded-tr-none';

  const icon = isModel ? (
    <BotIcon className="w-8 h-8 text-gray-400 flex-shrink-0 mt-1" />
  ) : (
    <UserIcon className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
  );
  
  // Don't render empty partial messages unless they are the active loading message
  if (message.isPartial && !message.content && !message.toolCalls && !isLoading && !message.reasoning) {
    return null;
  }

  // Helper to parse message content into text and code blocks
  const renderContentWithCodeBlocks = (content: string) => {
      const parts = [];
      const regex = /```(\w+)?\n([\s\S]*?)```/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(content)) !== null) {
          // Text before code block
          if (match.index > lastIndex) {
              parts.push({ type: 'text', content: content.substring(lastIndex, match.index) });
          }
          // Code block
          parts.push({ type: 'code', language: match[1] || '', content: match[2] });
          lastIndex = regex.lastIndex;
      }
      // Remaining text
      if (lastIndex < content.length) {
          parts.push({ type: 'text', content: content.substring(lastIndex) });
      }

      return parts.map((part, index) => {
          if (part.type === 'code') {
              return <CodeBlock key={index} language={part.language} code={part.content} />;
          }
          return (
              <span key={index} className="whitespace-pre-wrap">
                  {part.content}
              </span>
          );
      });
  };

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 py-2 ${wrapperClasses}`}>
      {icon}
      <div className={`p-4 shadow-md max-w-[90%] sm:max-w-[80%] overflow-hidden ${bubbleClasses}`}>
        {!isModel && !message.isToolResponse && (
            <p className="text-sm font-bold mb-1 text-white">Tú</p>
        )}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-2 space-y-2">
            {message.attachments.filter(att => att && typeof att.data === 'string').map((att, i) => (
              <div key={i} className={`p-2 rounded-lg ${isModel ? 'bg-gray-600' : 'bg-blue-500'}`}>
                {att.type.startsWith('image/') ? (
                  <img src={att.data} alt={att.name} className="rounded-md max-w-full h-auto max-h-60" />
                ) : att.type.startsWith('video/') ? (
                  <video src={att.data} controls className="rounded-md max-w-full h-auto max-h-80" />
                ) : att.type.startsWith('audio/') ? (
                  <div className="p-2">
                    <p className="font-semibold break-all text-sm mb-2">{att.name}</p>
                    <audio src={att.data} controls className="w-full" />
                  </div>
                ) : (
                  <div className="text-sm text-gray-200">
                    <p className="font-semibold break-all">{att.name}</p>
                    <p className="text-xs">{att.type}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* New loading indicator logic for model messages */}
        {isModel && isLoading && (processingMessage || !message.content) && (
          <div className="flex items-center gap-2 mb-2">
            <ThinkingSpinnerIcon className="w-6 h-6 animate-spin text-blue-400" />
            {processingMessage && <span className="text-gray-300">{processingMessage}</span>}
          </div>
        )}

        {/* Reasoning Accordion */}
        {message.reasoning && (
            <div className="mb-3 border-b border-gray-600 pb-3">
                <button 
                    onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
                    className="flex items-center gap-2 text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors focus:outline-none w-full text-left"
                >
                    <BrainIcon className="w-4 h-4" />
                    <span>Ver Razonamiento</span>
                    {isReasoningExpanded ? <ChevronUpIcon className="w-3 h-3 ml-auto" /> : <ChevronDownIcon className="w-3 h-3 ml-auto" />}
                </button>
                {isReasoningExpanded && (
                    <div className="mt-2 p-3 bg-gray-800/80 rounded-md text-xs text-gray-300 whitespace-pre-wrap font-mono border-l-2 border-teal-500">
                        {message.reasoning}
                    </div>
                )}
            </div>
        )}

        {message.content && (
          <div className={message.isPrintable ? 'relative group' : ''}>
              {message.isPrintable && (
                  <button
                      onClick={handlePrint}
                      className="absolute -top-2 -right-2 p-2 bg-gray-600 rounded-full text-white hover:bg-blue-600 transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                      aria-label="Imprimir ficha"
                      title="Imprimir ficha"
                  >
                      <PrinterIcon className="w-5 h-5" />
                  </button>
              )}
              <div ref={printableContentRef} className="prose dark:prose-invert max-w-none">
                  {/* Render logic split: if printable, treat as plain HTML/Text, otherwise parse blocks */}
                  {message.isPrintable ? (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                  ) : (
                      renderContentWithCodeBlocks(message.content)
                  )}
                  {message.isPartial && <BlinkingCursor />}
              </div>
          </div>
        )}
        {message.imageUrl && (
            <div className="mt-2 relative group">
                <img src={message.imageUrl} alt="Generated by AI" className="rounded-lg max-w-full h-auto" />
                <a
                    href={message.imageUrl}
                    download={`ai-rick-image-${Date.now()}.${getFilenameExtensionFromDataUrl(message.imageUrl)}`}
                    className="absolute top-2 right-2 p-2 bg-black bg-opacity-60 rounded-full text-white hover:bg-opacity-80 transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                    aria-label="Descargar imagen"
                >
                    <DownloadIcon className="w-5 h-5" />
                </a>
            </div>
        )}
        {message.plan && <PlanDisplay plan={message.plan} onExecutePlan={onExecutePlan} />}
        {message.toolCalls && <ToolCallDisplay toolCalls={message.toolCalls} />}
        {isModel && message.groundingChunks && message.groundingChunks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-600">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <GoogleIcon className="w-4 h-4" />
                    Fuentes
                </h4>
                <ul className="space-y-1">
                    {message.groundingChunks.map((chunk, index) => (
                        chunk.web && (
                            <li key={chunk.web.uri} className="text-xs">
                                <a 
                                    href={chunk.web.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-blue-400 hover:underline break-all"
                                    title={chunk.web.title}
                                >
                                   {index + 1}. {chunk.web.title || chunk.web.uri}
                                </a>
                            </li>
                        )
                    ))}
                </ul>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
