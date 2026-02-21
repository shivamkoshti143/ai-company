import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CompanyProfilePage from "./pages/Company/CompanyProfilePage";
import CompanyStaffPage from "./pages/Company/CompanyStaffPage";
import CompanyVacanciesPage from "./pages/Company/CompanyVacanciesPage";
import CompanyApplicationsPage from "./pages/Company/CompanyApplicationsPage";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/company-profile" replace />} />
          <Route path="/company-profile" element={<CompanyProfilePage />} />
          <Route path="/company-staff" element={<CompanyStaffPage />} />
          <Route path="/company-vacancies" element={<CompanyVacanciesPage />} />
          <Route path="/company-applications" element={<CompanyApplicationsPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
