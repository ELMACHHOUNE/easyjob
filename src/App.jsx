import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { SocketProvider } from '@/context/SocketContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import MainLayoutShell from '@/layouts/MainLayoutShell'

// Pages publiques
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage'

// Pages protégées Candidat
import DashboardPage from '@/pages/dashboard/DashboardPage'
import AnalyticsPage from '@/pages/dashboard/AnalyticsPage'
import NotificationsPage from '@/pages/dashboard/NotificationsPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import CVPage from '@/pages/profile/CVPage'
import PortfolioPage from '@/pages/profile/PortfolioPage'
import SearchPreferencesPage from '@/pages/profile/SearchPreferencesPage'
import JobOffersPage from '@/pages/jobOffers/JobOffersPage'
import JobOfferDetailPage from '@/pages/jobOffers/JobOfferDetailPage'
import ScrapingConfigPage from '@/pages/jobOffers/ScrapingConfigPage'
import SavedJobsPage from '@/pages/jobOffers/SavedJobsPage'
import ApplicationsPage from '@/pages/applications/ApplicationsPage'
import InternalApplicationsPage from '@/pages/applications/InternalApplicationsPage'
import ApplicationDetailPage from '@/pages/applications/ApplicationDetailPage'
import ComposeEmailPage from '@/pages/applications/ComposeEmailPage'
import EmailTemplatesPage from '@/pages/applications/EmailTemplatesPage'
import RecruitersPage from '@/pages/recruiters/RecruitersPage'
import RecruiterDetailPage from '@/pages/recruiters/RecruiterDetailPage'
import NetworkPage from '@/pages/recruiters/NetworkPage'
import MessagesPage from '@/pages/shared/MessagesPage'
import OnboardingPage from '@/pages/OnboardingPage'
import CompanyEmailsPage from '@/pages/companyEmails/CompanyEmailsPage'

// Pages Recruteur
import RecruiterDashboardPage from '@/pages/recruiter/RecruiterDashboardPage'
import RecruiterJobsPage from '@/pages/recruiter/RecruiterJobsPage'
import RecruiterJobCreatePage from '@/pages/recruiter/RecruiterJobCreatePage'
import RecruiterJobDetailPage from '@/pages/recruiter/RecruiterJobDetailPage'
import RecruiterCandidatesPage from '@/pages/recruiter/RecruiterCandidatesPage'
import RecruiterApplicationsPage from '@/pages/recruiter/RecruiterApplicationsPage'
import RecruiterProfilePage from '@/pages/recruiter/RecruiterProfilePage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
        <BrowserRouter>
          <Toaster />
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Routes protégées */}
            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route element={<ProtectedRoute requireOnboarding={false} />}>
              <Route element={<MainLayoutShell />}>
                {/* Candidat routes */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/cv" element={<CVPage />} />
                <Route path="/profile/portfolio" element={<PortfolioPage />} />
                <Route path="/profile/search-preferences" element={<SearchPreferencesPage />} />
                <Route path="/jobs" element={<JobOffersPage />} />
                <Route path="/jobs/:id" element={<JobOfferDetailPage />} />
                <Route path="/jobs/scraping-config" element={<ScrapingConfigPage />} />
                <Route path="/jobs/saved" element={<SavedJobsPage />} />
                <Route path="/applications" element={<ApplicationsPage />} />
                <Route path="/applications/:id" element={<ApplicationDetailPage />} />
                <Route path="/applications/compose/:jobOfferId" element={<ComposeEmailPage />} />
                <Route path="/applications/templates" element={<EmailTemplatesPage />} />
                <Route path="/applications/internal" element={<InternalApplicationsPage />} />
                <Route path="/recruiters" element={<RecruitersPage />} />
                <Route path="/recruiters/:id" element={<RecruiterDetailPage />} />
                <Route path="/network" element={<NetworkPage />} />
                <Route path="/company-emails" element={<CompanyEmailsPage />} />
                <Route path="/messages" element={<MessagesPage />} />

                {/* Recruteur routes */}
                <Route path="/recruiter-space/dashboard" element={<RecruiterDashboardPage />} />
                <Route path="/recruiter-space/jobs" element={<RecruiterJobsPage />} />
                <Route path="/recruiter-space/jobs/new" element={<RecruiterJobCreatePage />} />
                <Route path="/recruiter-space/jobs/:id" element={<RecruiterJobDetailPage />} />
                <Route path="/recruiter-space/candidates" element={<RecruiterCandidatesPage />} />
                <Route path="/recruiter-space/applications" element={<RecruiterApplicationsPage />} />
                <Route path="/recruiter-space/profile" element={<RecruiterProfilePage />} />
              </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
