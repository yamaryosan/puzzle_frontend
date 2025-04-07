"use client";

import React, { useEffect, useRef } from "react";

type ViewerProps = {
    html: string;
};

export const Viewer = ({ html }: ViewerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        el.innerHTML = html;

        if (!window.MathJax) {
            const configScript = document.createElement("script");
            configScript.type = "text/javascript";
            configScript.text = `
                window.MathJax = {
                    tex: {
                        inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                        displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
                    },
                    svg: { fontCache: 'global' }
                };
            `;
            document.head.appendChild(configScript);

            const mathjaxScript = document.createElement("script");
            mathjaxScript.src =
                "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
            mathjaxScript.async = true;
            mathjaxScript.onload = () => {
                window.MathJax?.typesetPromise?.([el]);
            };
            document.head.appendChild(mathjaxScript);
        } else {
            window.MathJax?.typesetPromise?.([el]);
        }
    }, [html]);

    return <div className="viewer-content" ref={containerRef} />;
};

export default Viewer;
