import { useState } from "react";
import Layout from "./components/Layout";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [activeTab, setActiveTab] = useState("myStock");

  return (
    <Layout>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <Dashboard activeTab={activeTab} />
    </Layout>
  );
}