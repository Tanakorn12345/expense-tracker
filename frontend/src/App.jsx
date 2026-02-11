import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Expense from "./pages/Expense";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/expenses" element={<Expense />} />
      </Routes>
    </Layout>
  );
}

export default App;
