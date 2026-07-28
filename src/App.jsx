import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Header from "@/components/header";
import LandingPage from "@/pages/LandingPage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import DashboardPage from "@/pages/DashboardPage";
import AccountPage from "@/pages/AccountPage";
import AddTransactionPage from "@/pages/AddTransactionPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/components/MainLayout";

export default function App() {
  return (
    <div className="font-sans min-h-screen">
      <Header />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AccountPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transaction/create"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AddTransactionPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
