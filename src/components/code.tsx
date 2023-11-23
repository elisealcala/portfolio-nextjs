"use client";

import React from "react";
import { Highlight, themes, Prism } from "prism-react-renderer";
import { copyToClipboard } from "@/lib/utils";

type CodeType = {
  codeString: string;
  lang: string;
};

// @ts-ignore
(typeof global !== "undefined" ? global : window).Prism = Prism;
require("prismjs/components/prism-bash");
require("prismjs/components/prism-typescript");
require("prismjs/components/prism-json");
require("prismjs/components/prism-graphql");

const Code = ({ codeString, lang }: CodeType) => {
  const handleClick = () => {
    copyToClipboard(codeString);
  };

  return (
    <Highlight code={codeString} theme={themes.nightOwl} language={lang}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          style={style}
          className={`relative text-left my-4 p-6 pb-0 pt-7 rounded text-[10pt] font-normal ${className}`}
        >
          <button
            className="absolute right-0 border-none top-0 rounded-sm m-[0.25em] opacity-[0.3] hover:opacity-[1] py-1 px-2 text-[9pt] ease-in duration-150"
            onClick={handleClick}
          >
            Copy
          </button>
          <code className="pb-4 block overflow-x-auto main-code">
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </code>
        </pre>
      )}
    </Highlight>
  );
};

export default Code;
