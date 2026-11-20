
"use client";

import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

import "react-quill-new/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link"],
    [{ align: [] }],
    ["clean"],
  ],
};


const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "indent",
  "blockquote",
  "code-block",
  "link",
  "align",
];


export default function ArticleEditor({ value, onChange }) {
  return (
    <div className="inkspire-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="Begin writing your story..."
      />
      <style jsx global>{`
        .inkspire-editor .ql-toolbar {
          border: 1px solid var(--border);
          background: var(--surface);
        }

        .inkspire-editor .ql-container {
          min-height: 360px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
          font-size: 16px;
        }

        .inkspire-editor .ql-editor {
          min-height: 360px;
          line-height: 1.8;
        }

        .inkspire-editor .ql-editor.ql-blank::before {
          color: var(--muted);
          font-style: normal;
        }

        .inkspire-editor .ql-stroke {
          stroke: var(--text);
        }

        .inkspire-editor .ql-fill {
          fill: var(--text);
        }
      `}</style>
    </div>
  );
}