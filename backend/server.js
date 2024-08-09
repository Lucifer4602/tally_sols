const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { exec, spawn } = require("child_process");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Endpoint to compile and execute C++ code
app.post("/api/execute", (req, res) => {
  const { code, input } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  // File paths
  const codeFilePath = path.join(__dirname, "temp1.cpp");
  const compiledExecutable = path.join(__dirname, "temp1.exe");

  // Save C++ code to a file
  fs.writeFileSync(codeFilePath, code);

  // Delete existing executable if it exists
  if (fs.existsSync(compiledExecutable)) {
    fs.unlinkSync(compiledExecutable);
  }

  console.time("Compile Time");

  // Compile the C++ code
  exec(
    `g++ "${codeFilePath}" -o "${compiledExecutable}"`,
    (compileErr, stdout, stderr) => {
      console.timeEnd("Compile Time");

      if (compileErr) {
        console.error("Compilation Error:", compileErr);
        console.error("Compilation stderr:", stderr);

        // Clean up temporary files
        cleanUpFiles();

        return res
          .status(500)
          .json({ error: "Compilation failed", details: compileErr.message });
      }

      console.time("Execution Time");

      // Execute the compiled code using spawn
      const child = spawn(compiledExecutable);

      let output = "";
      let errorOutput = "";

      child.stdout.on("data", (data) => {
        output += data.toString();
      });

      child.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      child.on("close", (code) => {
        console.timeEnd("Execution Time");

        // Clean up temporary files
        cleanUpFiles();

        if (code !== 0) {
          return res
            .status(500)
            .json({ error: "Execution failed", details: errorOutput });
        }

        res.json({ output });
      });

      // Write input to the process
      if (input) {
        child.stdin.write(input);
      }
      child.stdin.end();
    }
  );

  // Function to delete temporary files
  function cleanUpFiles() {
    try {
      if (fs.existsSync(codeFilePath)) fs.unlinkSync(codeFilePath);
      if (fs.existsSync(compiledExecutable)) fs.unlinkSync(compiledExecutable);
    } catch (error) {
      console.error("Error cleaning up files:", error);
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
