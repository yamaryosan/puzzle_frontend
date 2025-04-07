interface MathJaxObject {
    typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
}

interface Window {
    MathJax?: MathJaxObject;
}
