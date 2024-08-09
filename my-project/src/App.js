import { Route, Routes } from "react-router-dom";
import CodeExecutionPage from "./CodeExecutionPage"; // Import your component

function App() {
  return (
    <Routes>
      <Route path="/" element={<CodeExecutionPage />} />
    </Routes>
  );
}

export default App;
