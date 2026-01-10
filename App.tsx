/**
 * @file App.tsx
 * This is the root component of the application.
 * It sets up the main layout, including the header and the two-column structure for the form and preview.
 * It also handles the display of global UI elements like the onboarding guide and error alerts
 * by pulling state from the AppContext.
 */

import React, { Suspense } from 'react';
import Header from './components/Header';
import ResumeForm from './components/ResumeForm';
import ResumePreview from './components/ResumePreview';
import ErrorAlert from './components/ErrorAlert';
import SuccessAlert from './components/SuccessAlert';
import LoadingOverlay from './components/LoadingOverlay';
import { useAppContext } from './context/AppContext';

// Lazy load heavy/conditional components
const OnboardingGuide = React.lazy(() => import('./components/OnboardingGuide'));
const MetricMinerModal = React.lazy(() => import('./components/MetricMinerModal'));
const VersionControlModal = React.lazy(() => import('./components/VersionControlModal'));
const SubscriptionModal = React.lazy(() => import('./components/SubscriptionModal'));
const AuthModal = React.lazy(() => import('./components/AuthModal'));

const App: React.FC = () => {
  // Destructure state and handlers from the global application context.
  const {
    showOnboarding,
    handleCloseOnboarding,
    setShowOnboarding,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    metricOpportunities,
    isMetricMinerOpen,
    setIsMetricMinerOpen,
    handleApplyMetric,
    // Version Control props
    isVersionModalOpen,
    setIsVersionModalOpen,
    savedVersions,
    saveVersion,
    loadVersion,
    deleteVersion,
    // Subscription props
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
    upgradeToPro,
    // Auth props
    isAuthModalOpen,
    // Global Loading
    isGlobalLoading,
    loadingTitle,
    loadingMessages
  } = useAppContext();

  return (
    <div className="bg-slate-100 min-h-screen">
      <Suspense fallback={<div className="fixed inset-0 bg-black/20 z-50 pointer-events-none" />}>
        {/* Environment Check for Production Debugging */}
        {!import.meta.env.VITE_SUPABASE_URL && (
          <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-4 text-center z-[9999] font-bold">
            CRITICAL ERROR: VITE_SUPABASE_URL is missing. Please add it to your Vercel Environment Variables.
          </div>
        )}
        {!import.meta.env.VITE_SUPABASE_ANON_KEY && (
          <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-4 text-center z-[9999] font-bold mt-12">
            CRITICAL ERROR: VITE_SUPABASE_ANON_KEY is missing. Please add it to your Vercel Environment Variables.
          </div>
        )}

        {/* Conditionally render the onboarding guide overlay */}
        {showOnboarding && <OnboardingGuide onClose={handleCloseOnboarding} />}

        {/* Global Success Alert */}
        {successMessage && <SuccessAlert message={successMessage} onClose={() => setSuccessMessage(null)} />}

        {/* Auth Modal (Login / Signup) */}
        {isAuthModalOpen && <AuthModal />}

        {/* Metric Miner Modal */}
        {isMetricMinerOpen && (
          <MetricMinerModal
            isOpen={isMetricMinerOpen}
            onClose={() => setIsMetricMinerOpen(false)}
            opportunities={metricOpportunities}
            onApplyMetric={handleApplyMetric}
          />
        )}

        {/* Version Control / Smart Versioning Dashboard */}
        {isVersionModalOpen && (
          <VersionControlModal
            isOpen={isVersionModalOpen}
            onClose={() => setIsVersionModalOpen(false)}
            savedVersions={savedVersions}
            onSave={saveVersion}
            onLoad={loadVersion}
            onDelete={deleteVersion}
          />
        )}

        {/* Subscription / Paywall Modal */}
        {isSubscriptionModalOpen && (
          <SubscriptionModal
            isOpen={isSubscriptionModalOpen}
            onClose={() => setIsSubscriptionModalOpen(false)}
            onUpgrade={upgradeToPro}
          />
        )}
      </Suspense>

      {/* Global Loading Overlay */}
      {isGlobalLoading && <LoadingOverlay title={loadingTitle} messages={loadingMessages} />}

      <Header onShowHelp={() => setShowOnboarding(true)} />

      <main className="container mx-auto p-4 lg:p-8 animate-fade-in-up">
        {/* Conditionally render the global error alert */}
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
          {/* Left column: The resume form */}
          <div className="bg-slate-50 p-6 rounded-lg shadow-lg">
            <ResumeForm />
          </div>
          {/* Right column: The preview panel */}
          <div>
            <ResumePreview />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;