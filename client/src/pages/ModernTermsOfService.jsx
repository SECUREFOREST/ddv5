import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FireIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';

const ModernTermsOfService = () => {
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
    { id: 'definitions', title: 'Definitions', icon: <UserIcon className="w-5 h-5" /> },
    { id: 'user-conduct', title: 'User Conduct', icon: <ShieldCheckIcon className="w-5 h-5" /> },
    { id: 'content-guidelines', title: 'Content Guidelines', icon: <LockClosedIcon className="w-5 h-5" /> },
    { id: 'privacy-data', title: 'Privacy & Data', icon: <EyeIcon className="w-5 h-5" /> },
    { id: 'intellectual-property', title: 'Intellectual Property', icon: <DocumentTextIcon className="w-5 h-5" /> },
    { id: 'disclaimers', title: 'Disclaimers', icon: <ExclamationTriangleIcon className="w-5 h-5" /> },
    { id: 'termination', title: 'Termination', icon: <XMarkIcon className="w-5 h-5" /> },
    { id: 'governing-law', title: 'Governing Law', icon: <DocumentTextIcon className="w-5 h-5" /> }
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
                <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
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
                    Welcome to OneSubmissiveAct (OSA), a platform designed for consenting adults to engage in 
                    BDSM task management and performance tracking. These Terms of Service govern your use of our 
                    platform and services.
                  </p>
                  <p className="text-neutral-300 mb-4">
                    By accessing or using OSA, you agree to be bound by these terms. If you disagree with any 
                    part of these terms, you may not access our service.
                  </p>
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-blue-300 font-medium mb-1">Important Notice</h4>
                        <p className="text-blue-200 text-sm">
                          This platform is intended for consenting adults only. All users must be 18 years or older 
                          and must provide valid identification during registration.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Definitions Section */}
              <section id="definitions" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Definitions</h2>
                <div className="space-y-4">
                  <div className="bg-neutral-700/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">"Service" or "Platform"</h4>
                    <p className="text-neutral-300 text-sm">
                      Refers to the OneSubmissiveAct website, mobile applications, and related services.
                    </p>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">"User" or "You"</h4>
                    <p className="text-neutral-300 text-sm">
                      Refers to any individual who accesses or uses our Service.
                    </p>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">"Content"</h4>
                    <p className="text-neutral-300 text-sm">
                      Refers to any information, text, graphics, photos, or other materials uploaded, 
                      posted, or shared on the platform.
                    </p>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">"Task" or "Demand"</h4>
                    <p className="text-neutral-300 text-sm">
                      Refers to activities, challenges, or requests created by users for others to perform.
                    </p>
                  </div>
                </div>
              </section>

              {/* User Conduct Section */}
              <section id="user-conduct" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">User Conduct</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Acceptable Use</h3>
                    <p className="text-neutral-300 mb-4">
                      You agree to use the Service only for lawful purposes and in accordance with these Terms.
                    </p>
                    <ul className="text-neutral-300 space-y-2 ml-6">
                      <li>• Respect the rights and dignity of other users</li>
                      <li>• Provide accurate and truthful information</li>
                      <li>• Maintain appropriate boundaries and consent</li>
                      <li>• Report inappropriate behavior or content</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Prohibited Activities</h3>
                    <p className="text-neutral-300 mb-4">
                      The following activities are strictly prohibited:
                    </p>
                    <ul className="text-neutral-300 space-y-2 ml-6">
                      <li>• Harassment, bullying, or abusive behavior</li>
                      <li>• Sharing non-consensual content or images</li>
                      <li>• Impersonating others or creating fake profiles</li>
                      <li>• Attempting to harm or exploit minors</li>
                      <li>• Violating any applicable laws or regulations</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Content Guidelines Section */}
              <section id="content-guidelines" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Content Guidelines</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Content Standards</h3>
                    <p className="text-neutral-300 mb-4">
                      All content shared on the platform must meet our community standards:
                    </p>
                    <ul className="text-neutral-300 space-y-2 ml-6">
                      <li>• Must be consensual and appropriate for adults</li>
                      <li>• Cannot promote illegal activities or harm</li>
                      <li>• Must respect intellectual property rights</li>
                      <li>• Cannot contain hate speech or discrimination</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Content Moderation</h3>
                    <p className="text-neutral-300 mb-4">
                      We reserve the right to review, modify, or remove any content that violates these guidelines.
                    </p>
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <div>
                          <h4 className="text-yellow-300 font-medium mb-1">Content Review</h4>
                          <p className="text-yellow-200 text-sm">
                            All content is subject to review by our moderation team. Violations may result in 
                            content removal, account suspension, or permanent termination.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Privacy & Data Section */}
              <section id="privacy-data" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Privacy & Data</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Data Collection</h3>
                    <p className="text-neutral-300 mb-4">
                      We collect and process personal data in accordance with our Privacy Policy and applicable 
                      data protection laws.
                    </p>
                    <ul className="text-neutral-300 space-y-2 ml-6">
                      <li>• Account information and profile data</li>
                      <li>• Usage data and platform interactions</li>
                      <li>• Communication and content shared</li>
                      <li>• Technical data and device information</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Data Protection</h3>
                    <p className="text-neutral-300 mb-4">
                      Your privacy and data security are our top priorities:
                    </p>
                    <ul className="text-neutral-300 space-y-2 ml-6">
                      <li>• Encryption of sensitive data</li>
                      <li>• Secure data storage and transmission</li>
                      <li>• Limited access to personal information</li>
                      <li>• Regular security audits and updates</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Intellectual Property Section */}
              <section id="intellectual-property" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Intellectual Property</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Platform Rights</h3>
                    <p className="text-neutral-300 mb-4">
                      The Service and its original content, features, and functionality are owned by OSA and 
                      are protected by international copyright, trademark, and other intellectual property laws.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">User Content</h3>
                    <p className="text-neutral-300 mb-4">
                      You retain ownership of content you create and share on the platform. By posting content, 
                      you grant us a limited license to use, display, and distribute your content as necessary 
                      to provide the Service.
                    </p>
                  </div>
                </div>
              </section>

              {/* Disclaimers Section */}
              <section id="disclaimers" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Disclaimers</h2>
                <div className="space-y-6">
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-red-300 mb-3">Important Disclaimers</h3>
                    <ul className="text-red-200 space-y-2 ml-6">
                      <li>• The Service is provided "as is" without warranties of any kind</li>
                      <li>• We are not responsible for user-generated content or interactions</li>
                      <li>• Users are responsible for their own safety and well-being</li>
                      <li>• We do not endorse or verify the accuracy of user content</li>
                      <li>• The platform is not a substitute for professional advice or therapy</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Limitation of Liability</h3>
                    <p className="text-neutral-300">
                      OSA shall not be liable for any indirect, incidental, special, consequential, or punitive 
                      damages resulting from your use of the Service.
                    </p>
                  </div>
                </div>
              </section>

              {/* Termination Section */}
              <section id="termination" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Termination</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Account Termination</h3>
                    <p className="text-neutral-300 mb-4">
                      We may terminate or suspend your account immediately, without prior notice, for any reason, 
                      including violation of these Terms.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Effect of Termination</h3>
                    <p className="text-neutral-300 mb-4">
                      Upon termination, your right to use the Service will cease immediately. We may delete 
                      your account and all associated data.
                    </p>
                  </div>
                </div>
              </section>

              {/* Governing Law Section */}
              <section id="governing-law" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Governing Law</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Legal Jurisdiction</h3>
                    <p className="text-neutral-300 mb-4">
                      These Terms shall be governed by and construed in accordance with the laws of the 
                      jurisdiction in which OSA operates, without regard to conflict of law provisions.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Dispute Resolution</h3>
                    <p className="text-neutral-300 mb-4">
                      Any disputes arising from these Terms or your use of the Service shall be resolved 
                      through binding arbitration in accordance with our dispute resolution procedures.
                    </p>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section className="border-t border-neutral-700/50 pt-8">
                <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
                <div className="bg-neutral-700/30 rounded-lg p-6">
                  <p className="text-neutral-300 mb-4">
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="space-y-2 text-neutral-300">
                    <p>• Email: legal@osa-platform.com</p>
                    <p>• Support: support@osa-platform.com</p>
                    <p>• Safety: safety@osa-platform.com</p>
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

export default ModernTermsOfService; 