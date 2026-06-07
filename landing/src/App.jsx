import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { PaymentProvider, usePayment } from './context/PaymentContext';
import Navbar from './components/Navbar/Navbar';
import Hero from './sections/Hero/Hero';
import TrustStrip from './sections/TrustStrip/TrustStrip';

import EnrollFormPage from './pages/EnrollFormPage/EnrollFormPage';
import CourseSuccess from './pages/Success/CourseSuccess';
import OneOnOneSuccess from './pages/Success/OneOnOneSuccess';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

// Below-fold sections are lazy loaded to optimize initial paint and bundle sizes
const Courses = React.lazy(() => import('./sections/Courses/Courses'));
const About = React.lazy(() => import('./sections/About/About'));
const PnlProof = React.lazy(() => import('./sections/PnlProof/PnlProof'));
const StudentResults = React.lazy(() => import('./sections/StudentResults/StudentResults'));
const Testimonials = React.lazy(() => import('./sections/Testimonials/Testimonials'));
const Pricing = React.lazy(() => import('./sections/Pricing/Pricing'));
const FAQ = React.lazy(() => import('./sections/FAQ/FAQ'));
const CTA = React.lazy(() => import('./sections/CTA/CTA'));
const Footer = React.lazy(() => import('./sections/Footer/Footer'));

// Lazy load OneOnOne page
const OneOnOne = React.lazy(() => import('./pages/OneOnOne/OneOnOne'));

function HomePage() {
  return (
    <>
      {/* Above-fold sections rendered immediately for instant FCP */}
      <Hero />
      <TrustStrip />
      
      {/* Below-fold sections wrapped in Suspense for fluid lazy-loading */}
      <Suspense fallback={<div className="sectionLoading"></div>}>
        <Courses />
      </Suspense>

      <Suspense fallback={<div className="sectionLoading"></div>}>
        <About />
      </Suspense>
      
      <Suspense fallback={<div className="sectionLoading"></div>}>
        <PnlProof />
      </Suspense>
      
      <Suspense fallback={<div className="sectionLoading"></div>}>
        <StudentResults />
      </Suspense>
      
      <Suspense fallback={<div className="sectionLoading"></div>}>
        <Testimonials />
      </Suspense>
      
      <Suspense fallback={<div className="sectionLoading"></div>}>
        <Pricing />
      </Suspense>
      
      <Suspense fallback={<div className="sectionLoading"></div>}>
        <FAQ />
      </Suspense>
      
      <Suspense fallback={<div className="sectionLoading"></div>}>
        <CTA />
      </Suspense>
    </>
  );
}

function Layout() {
  const location = useLocation();
  
  // Pages jahan Navbar + Footer nahi chahiye
  const hideLayout = [
    '/enroll',
    '/enroll/1on1', 
    '/success/course',
    '/success/1on1',
  ];
  
  const shouldHide = hideLayout.includes(location.pathname);

  return (
    <>
      <ScrollToTop />
      {!shouldHide && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/1on1" element={
          <Suspense fallback={<div className="sectionLoading"></div>}>
            <OneOnOne />
          </Suspense>
        } />
        <Route path="/enroll" element={<EnrollFormPage type="course" />} />
        <Route path="/enroll/1on1" element={<EnrollFormPage type="1on1" />} />
        <Route path="/success/course" element={
          <SuccessRoute>
            <CourseSuccess />
          </SuccessRoute>
        } />
        <Route path="/success/1on1" element={
          <SuccessRoute>
            <OneOnOneSuccess />
          </SuccessRoute>
        } />
      </Routes>
      {!shouldHide && (
        <Suspense fallback={<div className="sectionLoading"></div>}>
          <Footer />
        </Suspense>
      )}
    </>
  );
}

function SuccessRoute({ children }) {
  const { paymentSuccess } = usePayment();
  
  if (!paymentSuccess) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export function App() {
  return (
    <PaymentProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </PaymentProvider>
  );
}

export default App;


