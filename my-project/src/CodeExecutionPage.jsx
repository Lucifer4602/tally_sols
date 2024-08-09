import React, { useState } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-monokai";
import axios from "axios";

const CodeExecutionPage = () => {
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);

  const executeCode = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/execute", {
        code,
        input,
      });
      setOutput(response.data.output);
      setError(null);
    } catch (err) {
      setError(err.response ? err.response.data.error : err.message);
      setOutput(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">C++ Code Execution</h1>

      <div className="mb-4">
        <AceEditor
          mode="c_cpp"
          theme="monokai"
          value={code}
          onChange={(newValue) => setCode(newValue)}
          name="editor"
          editorProps={{ $blockScrolling: true }}
          width="100%"
          height="400px"
          fontSize={14}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            showLineNumbers: true,
            tabSize: 2,
          }}
        />
      </div>

      <textarea
        className="border border-gray-300 rounded-lg p-2 w-full mb-4"
        placeholder="Custom Input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={executeCode}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Run Code
      </button>

      {output && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <h2 className="font-semibold">Output:</h2>
          <pre>{output}</pre>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 rounded">
          <h2 className="font-semibold text-red-600">Error:</h2>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeExecutionPage;
