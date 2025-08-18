import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FireIcon, 
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  ArrowUpIcon,
  CogIcon,
  TrashIcon,
  DownloadIcon
} from '@heroicons/react/24/outline';

const ModernPrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [showBackToTop, setShowBackToTop] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sections = [
    { id: 'overview', title: 'Overview', icon: <DocumentTextIcon className="w-5 h-5" /> },
    { id: 'data-collection', title: 'Data Collection', icon: <UserIcon className="w-5 h-5" /> },
    { id: 'data-usage', title: 'Data Usage', icon: <CogIcon className="w-5 h-5" /> },
    { id: 'data-sharing', title: 'Data Sharing', icon: <EyeIcon className="w-5 h-5" /> },
    { id: 'data-security', title: 'Data Security', icon: <LockClosedIcon className="w-5 h-5" /> },
    { id: 'user-rights', title: 'User Rights', icon: <ShieldCheckIcon className="w-5 h-5" /> },
    { id: 'gdpr-compliance', title: 'GDPR Compliance', icon: <CheckIcon className="w-5 h-5" /> },
    { id: 'cookies', title: 'Cookies', icon: <DocumentTextIcon className="w-5 h-5" /> },
    { id: 'contact', title: 'Contact', icon: <UserIcon className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border-b border-neutral-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-xl flex items-center justify-center">
                <FireIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
                <p className="text-neutral-400 text-sm">Last updated: January 15, 2024</p>
              </div>
            </div>
            <Link
              to="/"
              className="px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6 sticky top-32">
              <h3 className="text-white font-semibold mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                      setActiveSection(section.id);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                      activeSection === section.id
                        ? 'bg-primary text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50'
                    }`}
                  >
                    {section.icon}
                    <span className="text-sm">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-8">
              {/* Overview Section */}
              <section id="overview" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Overview</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-neutral-300 mb-4">
                    At OneSubmissiveAct (OSA), we are committed to protecting your privacy and ensuring 
                    the security of your personal information. This Privacy Policy explains how we collect, 
                    use, and protect your data when you use our platform.
                  </p>
                  <p className="text-neutral-300 mb-4">
                    By using our Service, you agree to the collection and use of information in accordance 
                    with this policy. We will not use or share your information with anyone except as 
                    described in this Privacy Policy.
                  </p>
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <ShieldCheckIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-blue-300 font-medium mb-1">Your Privacy Matters</h4>
                        <p className="text-blue-200 text-sm">
                          We are committed to transparency and giving you control over your personal data. 
                          This policy explains your rights and how we protect your information.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Collection Section */}
              <section id="data-collection" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Data Collection</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Information You Provide</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Account Information</h4>
                        <ul className="text-neutral-300 text-sm space-y-1">
                          <li>• Username and email address</li>
                          <li>• Profile information and preferences</li>
                          <li>• Role preferences and interests</li>
                          <li>• Avatar and profile images</li>
                        </ul>
                      </div>
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Platform Activity</h4>
                        <ul className="text-neutral-300 text-sm space-y-1">
                          <li>• Task creation and participation</li>
                          <li>• Content submissions and interactions</li>
                          <li>• Communication with other users</li>
                          <li>• Platform usage patterns</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Automatically Collected Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Technical Data</h4>
                        <ul className="text-neutral-300 text-sm space-y-1">
                          <li>• IP address and device information</li>
                          <li>• Browser type and version</li>
                          <li>• Operating system details</li>
                          <li>• Access timestamps</li>
                        </ul>
                      </div>
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Usage Analytics</h4>
                        <ul className="text-neutral-300 text-sm space-y-1">
                          <li>• Page views and navigation</li>
                          <li>• Feature usage statistics</li>
                          <li>• Performance metrics</li>
                          <li>• Error logs and diagnostics</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Usage Section */}
              <section id="data-usage" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Data Usage</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">How We Use Your Information</h3>
                    <div className="space-y-4">
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Service Provision</h4>
                        <p className="text-neutral-300 text-sm">
                          To provide, maintain, and improve our platform services, including user authentication, 
                          content management, and community features.
                        </p>
                      </div>
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Communication</h4>
                        <p className="text-neutral-300 text-sm">
                          To send you important updates, security notifications, and respond to your inquiries 
                          and support requests.
                        </p>
                      </div>
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Safety & Moderation</h4>
                        <p className="text-neutral-300 text-sm">
                          To ensure platform safety, detect and prevent abuse, and enforce our community 
                          guidelines and terms of service.
                        </p>
                      </div>
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Analytics & Improvement</h4>
                        <p className="text-neutral-300 text-sm">
                          To analyze platform usage, identify trends, and make improvements to enhance 
                          user experience and platform performance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Sharing Section */}
              <section id="data-sharing" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Data Sharing</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">When We Share Your Information</h3>
                    <div className="space-y-4">
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">With Your Consent</h4>
                        <p className="text-neutral-300 text-sm">
                          We may share your information with third parties when you explicitly consent to 
                          such sharing, such as connecting external services or applications.
                        </p>
                      </div>
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Service Providers</h4>
                        <p className="text-neutral-300 text-sm">
                          We may share data with trusted third-party service providers who assist us in 
                          operating our platform, such as hosting, analytics, and customer support services.
                        </p>
                      </div>
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Legal Requirements</h4>
                        <p className="text-neutral-300 text-sm">
                          We may disclose your information if required by law, court order, or government 
                          request, or to protect our rights, property, or safety.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="text-yellow-300 font-medium mb-1">We Never Sell Your Data</h4>
                        <p className="text-yellow-200 text-sm">
                          OSA does not sell, rent, or trade your personal information to third parties 
                          for marketing purposes. Your privacy is our priority.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Security Section */}
              <section id="data-security" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Data Security</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">How We Protect Your Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Encryption</h4>
                        <ul className="text-neutral-300 text-sm space-y-1">
                          <li>• End-to-end encryption for sensitive data</li>
                          <li>• Secure HTTPS connections</li>
                          <li>• Encrypted data storage</li>
                          <li>• Secure API communications</li>
                        </ul>
                      </div>
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Access Control</h4>
                        <ul className="text-neutral-300 text-sm space-y-1">
                          <li>• Limited staff access to user data</li>
                          <li>• Multi-factor authentication</li>
                          <li>• Regular access audits</li>
                          <li>• Secure data centers</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Security Measures</h3>
                    <ul className="text-neutral-300 space-y-2 ml-6">
                      <li>• Regular security assessments and penetration testing</li>
                      <li>• Automated threat detection and monitoring</li>
                      <li>• Incident response procedures and protocols</li>
                      <li>• Regular security updates and patches</li>
                      <li>• Employee security training and awareness</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* User Rights Section */}
              <section id="user-rights" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">User Rights</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Your Data Rights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Access & Control</h4>
                        <ul className="text-neutral-300 text-sm space-y-1">
                          <li>• View your personal data</li>
                          <li>• Update and correct information</li>
                          <li>• Control privacy settings</li>
                          <li>• Manage notification preferences</li>
                        </ul>
                      </div>
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Data Management</h4>
                        <ul className="text-neutral-300 text-sm space-y-1">
                          <li>• Export your data</li>
                          <li>• Delete your account</li>
                          <li>• Restrict data processing</li>
                          <li>• Object to data usage</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-green-300 mb-3">How to Exercise Your Rights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <CogIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <p className="text-green-200 text-sm">Account Settings</p>
                      </div>
                      <div className="text-center">
                        <DownloadIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <p className="text-green-200 text-sm">Data Export</p>
                      </div>
                      <div className="text-center">
                        <TrashIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <p className="text-green-200 text-sm">Account Deletion</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* GDPR Compliance Section */}
              <section id="gdpr-compliance" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">GDPR Compliance</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">European Data Protection Rights</h3>
                    <p className="text-neutral-300 mb-4">
                      If you are a resident of the European Economic Area (EEA), you have additional rights 
                      under the General Data Protection Regulation (GDPR):
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Right to Erasure</h4>
                        <p className="text-neutral-300 text-sm">
                          Request deletion of your personal data when it's no longer necessary for the 
                          purposes for which it was collected.
                        </p>
                      </div>
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Right to Portability</h4>
                        <p className="text-neutral-300 text-sm">
                          Receive your personal data in a structured, machine-readable format and 
                          transmit it to another controller.
                        </p>
                      </div>
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Right to Object</h4>
                        <p className="text-neutral-300 text-sm">
                          Object to processing of your personal data based on legitimate interests 
                          or for direct marketing purposes.
                        </p>
                      </div>
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Right to Restriction</h4>
                        <p className="text-neutral-300 text-sm">
                          Request restriction of processing when you contest the accuracy of your data 
                          or object to processing.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cookies Section */}
              <section id="cookies" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Cookies</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">How We Use Cookies</h3>
                    <p className="text-neutral-300 mb-4">
                      We use cookies and similar technologies to enhance your experience, analyze platform 
                      usage, and provide personalized content.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Essential Cookies</h4>
                        <p className="text-neutral-300 text-sm">
                          Required for basic platform functionality, authentication, and security.
                        </p>
                      </div>
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Analytics Cookies</h4>
                        <p className="text-neutral-300 text-sm">
                          Help us understand how users interact with our platform and improve performance.
                        </p>
                      </div>
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Preference Cookies</h4>
                        <p className="text-neutral-300 text-sm">
                          Remember your settings and preferences for a personalized experience.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <CogIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-blue-300 font-medium mb-1">Cookie Management</h4>
                        <p className="text-blue-200 text-sm">
                          You can control cookie settings through your browser preferences. Note that 
                          disabling certain cookies may affect platform functionality.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Section */}
              <section id="contact" className="border-t border-neutral-700/50 pt-8">
                <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
                <div className="bg-neutral-700/30 rounded-lg p-6">
                  <p className="text-neutral-300 mb-4">
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-medium mb-2">Data Protection Officer</h4>
                      <div className="space-y-1 text-neutral-300 text-sm">
                        <p>Email: dpo@osa-platform.com</p>
                        <p>Phone: +1 (555) 123-4567</p>
                        <p>Address: Privacy Team, OSA Platform</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-2">General Inquiries</h4>
                      <div className="space-y-1 text-neutral-300 text-sm">
                        <p>Email: privacy@osa-platform.com</p>
                        <p>Support: support@osa-platform.com</p>
                        <p>Safety: safety@osa-platform.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center z-50"
        >
          <ArrowUpIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default ModernPrivacyPolicy; 