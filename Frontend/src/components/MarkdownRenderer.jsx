import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

import {
  Prism as SyntaxHighlighter
} from "react-syntax-highlighter";

import {
  oneDark
} from "react-syntax-highlighter/dist/esm/styles/prism";

function CodeBlock({ language, value }) {

  const [copied, setCopied] = useState(false);

  const copyCode = async () => {

    await navigator.clipboard.writeText(value);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (

    <div className="code-container">

      <span className="code-language">
        {language}
      </span>

      <button
        className="copy-btn"
        onClick={copyCode}
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>

      <SyntaxHighlighter
        language={language}
        style={oneDark}
      >
        {value}
      </SyntaxHighlighter>

    </div>

  );
}

const MarkdownRenderer = ({ content }) => {

  return (

    <ReactMarkdown
      components={{

        code({
          inline,
          className,
          children
        }) {

          const match =
            /language-(\w+)/.exec(
              className || ""
            );

          return !inline && match ? (

            <CodeBlock
              language={match[1]}
              value={String(children)}
            />

          ) : (

            <code>
              {children}
            </code>

          );
        }

      }}
    >
      {content}
    </ReactMarkdown>

  );
};

export default MarkdownRenderer;