import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminContent from "@/pages/admin/AdminContent";
import AdminEditor from "@/pages/admin/AdminEditor";
import AdminSettings from "@/pages/admin/AdminSettings";
import Detail from "@/pages/Detail";
import Home from "@/pages/Home";
import List from "@/pages/List";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/list/:categorySlug" element={<List />} />
        <Route path="/detail/:contentSlug" element={<Detail />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/content" replace />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="editor/:type/:id" element={<AdminEditor />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
