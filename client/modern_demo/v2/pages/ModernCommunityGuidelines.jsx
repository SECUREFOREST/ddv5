import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FireIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  UserGroupIcon,
  HeartIcon,
  HandRaisedIcon,
  FlagIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  LockClosedIcon,
  ArrowUpIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const ModernCommunityGuidelines = () => {
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
    { id: 'overview', title: 'Overview', icon: <UserGroupIcon className="w-5 h-5" /> },
    { id: 'core-values', title: 'Core Values', icon: <HeartIcon className="w-5 h-5" /> },
    { id: 'respect-consent', title: 'Respect & Consent', icon: <HandRaisedIcon className="w-5 h-5" /> },
    { id: 'communication', title: 'Communication', icon: <ChatBubbleLeftIcon className="w-5 h-5" /> },
    { id: 'content-standards', title: 'Content Standards', icon: <EyeIcon className="w-5 h-5" /> },
    { id: 'safety-first', title: 'Safety First', icon: <ShieldCheckIcon className="w-5 h-5" /> },
    { id: 'reporting', title: 'Reporting & Moderation', icon: <FlagIcon className="w-5 h-5" /> },
    { id: 'consequences', title: 'Consequences', icon: <ExclamationTriangleIcon className="w-5 h-5" /> }
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
                <h1 className="text-2xl font-bold text-white">Community Guidelines</h1>
                <p className="text-neutral-400 text-sm">Building a safe and respectful community</p>
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
                    Welcome to the OneSubmissiveAct (OSA) community! These guidelines are designed to 
                    create a safe, respectful, and inclusive environment for all users. By participating 
                    in our community, you agree to follow these standards.
                  </p>
                  <p className="text-neutral-300 mb-4">
                    Our community is built on the principles of consent, respect, and mutual understanding. 
                    These guidelines help ensure that everyone can enjoy a positive and fulfilling experience 
                    on our platform.
                  </p>
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <HeartIcon className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <h4 className="text-green-300 font-medium mb-1">Our Mission</h4>
                        <p className="text-green-200 text-sm">
                          To foster a supportive community where consenting adults can explore, learn, and 
                          grow together in a safe and respectful environment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Core Values Section */}
              <section id="core-values" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Core Values</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <HeartIcon className="w-6 h-6 text-green-400" />
                      </div>
                      <h3 className="text-white font-semibold">Respect</h3>
                    </div>
                    <p className="text-neutral-300 text-sm">
                      Treat every member with dignity and respect, regardless of their role preferences, 
                      experience level, or background. Value diverse perspectives and experiences.
                    </p>
                  </div>
                  
                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <HandRaisedIcon className="w-6 h-6 text-blue-400" />
                      </div>
                      <h3 className="text-white font-semibold">Consent</h3>
                    </div>
                    <p className="text-neutral-300 text-sm">
                      Always obtain explicit consent before engaging in any activities or interactions. 
                      Respect boundaries and understand that consent can be withdrawn at any time.
                    </p>
                  </div>
                  
                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
                      </div>
                      <h3 className="text-white font-semibold">Safety</h3>
                    </div>
                    <p className="text-neutral-300 text-sm">
                      Prioritize the safety and well-being of all community members. Report any concerns 
                      or violations to help maintain a secure environment.
                    </p>
                  </div>
                  
                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <StarIcon className="w-6 h-6 text-yellow-400" />
                      </div>
                      <h3 className="text-white font-semibold">Growth</h3>
                    </div>
                    <p className="text-neutral-300 text-sm">
                      Support the personal growth and learning of all community members. Share knowledge, 
                      experiences, and constructive feedback in a supportive manner.
                    </p>
                  </div>
                </div>
              </section>

              {/* Respect & Consent Section */}
              <section id="respect-consent" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Respect & Consent</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Consent is Paramount</h3>
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <CheckIcon className="w-5 h-5 text-green-400 mt-0.5" />
                        <div>
                          <h4 className="text-green-300 font-medium mb-1">Consent Guidelines</h4>
                          <ul className="text-green-200 text-sm space-y-1">
                            <li>• Always ask before initiating any interaction</li>
                            <li>• Respect when someone says "no" or "stop"</li>
                            <li>• Understand that consent can be withdrawn at any time</li>
                            <li>• Never pressure or coerce others into activities</li>
                            <li>• Check in regularly during ongoing interactions</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Respectful Behavior</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Do's</h4>
                        <ul className="text-neutral-300 text-sm space-y-1">
                          <li>• Use respectful language and tone</li>
                          <li>• Honor personal boundaries and limits</li>
                          <li>• Be patient and understanding</li>
                          <li>• Support others in their journey</li>
                          <li>• Ask questions respectfully</li>
                        </ul>
                      </div>
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Don'ts</h4>
                        <ul className="text-neutral-300 text-sm space-y-1">
                          <li>• Use derogatory or offensive language</li>
                          <li>• Ignore or dismiss boundaries</li>
                          <li>• Make assumptions about others</li>
                          <li>• Pressure or manipulate others</li>
                          <li>• Share personal information without consent</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Communication Section */}
              <section id="communication" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Communication</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Effective Communication</h3>
                    <p className="text-neutral-300 mb-4">
                      Clear and respectful communication is essential for building positive relationships 
                      and avoiding misunderstandings in our community.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Communication Best Practices</h4>
                        <ul className="text-neutral-300 text-sm space-y-1">
                          <li>• Be clear and specific in your requests</li>
                          <li>• Use "I" statements to express feelings</li>
                          <li>• Listen actively and ask clarifying questions</li>
                          <li>• Respect different communication styles</li>
                          <li>• Give others time to respond</li>
                        </ul>
                      </div>
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Conflict Resolution</h4>
                        <ul className="text-neutral-300 text-sm space-y-1">
                          <li>• Address issues directly and respectfully</li>
                          <li>• Focus on the behavior, not the person</li>
                          <li>• Seek to understand before being understood</li>
                          <li>• Use private messages for personal conflicts</li>
                          <li>• Involve moderators if needed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Content Standards Section */}
              <section id="content-standards" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Content Standards</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Appropriate Content</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                        <h4 className="text-green-300 font-medium mb-2">Allowed Content</h4>
                        <ul className="text-green-200 text-sm space-y-1">
                          <li>• Consensual adult activities and discussions</li>
                          <li>• Educational content about BDSM and relationships</li>
                          <li>• Personal experiences and stories</li>
                          <li>• Support and advice for community members</li>
                          <li>• Respectful role-play and fantasy content</li>
                        </ul>
                      </div>
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                        <h4 className="text-red-300 font-medium mb-2">Prohibited Content</h4>
                        <ul className="text-red-200 text-sm space-y-1">
                          <li>• Non-consensual activities or content</li>
                          <li>• Harmful or dangerous practices</li>
                          <li>• Hate speech or discrimination</li>
                          <li>• Illegal activities or content</li>
                          <li>• Harassment or bullying</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Content Guidelines</h3>
                    <ul className="text-neutral-300 space-y-2 ml-6">
                      <li>• All content must be appropriate for adults (18+)</li>
                      <li>• Respect intellectual property rights</li>
                      <li>• Use appropriate content warnings when needed</li>
                      <li>• Ensure all participants are consenting adults</li>
                      <li>• Avoid graphic content in public spaces</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Safety First Section */}
              <section id="safety-first" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Safety First</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Personal Safety</h3>
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6 mb-4">
                      <div className="flex items-start space-x-3">
                        <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 mt-0.5" />
                        <div>
                          <h4 className="text-yellow-300 font-medium mb-2">Safety Reminders</h4>
                          <ul className="text-yellow-200 text-sm space-y-1">
                            <li>• Never share personal identifying information</li>
                            <li>• Meet in public places for first-time meetings</li>
                            <li>• Trust your instincts and set clear boundaries</li>
                            <li>• Have a safety plan for in-person activities</li>
                            <li>• Know your limits and communicate them clearly</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Community Safety</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Safe Practices</h4>
                        <ul className="text-neutral-300 text-sm space-y-1">
                          <li>• Use safe words and signals</li>
                          <li>• Establish clear boundaries beforehand</li>
                          <li>• Regular check-ins during activities</li>
                          <li>• Aftercare and emotional support</li>
                          <li>• Emergency contact information</li>
                        </ul>
                      </div>
                      <div className="bg-neutral-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Risk Awareness</h4>
                        <ul className="text-neutral-300 text-sm space-y-1">
                          <li>• Understand the risks involved</li>
                          <li>• Educate yourself on safety practices</li>
                          <li>• Start slowly and build gradually</li>
                          <li>• Know when to stop or seek help</li>
                          <li>• Regular health and safety checkups</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Reporting & Moderation Section */}
              <section id="reporting" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Reporting & Moderation</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">When to Report</h3>
                    <p className="text-neutral-300 mb-4">
                      Help us maintain a safe community by reporting any violations of these guidelines 
                      or concerning behavior.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                        <h4 className="text-red-300 font-medium mb-2">Report Immediately</h4>
                        <ul className="text-red-200 text-sm space-y-1">
                          <li>• Harassment or bullying</li>
                          <li>• Non-consensual content</li>
                          <li>• Threats or violence</li>
                          <li>• Underage users</li>
                          <li>• Illegal activities</li>
                        </ul>
                      </div>
                      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                        <h4 className="text-yellow-300 font-medium mb-2">Report for Review</h4>
                        <ul className="text-yellow-200 text-sm space-y-1">
                          <li>• Inappropriate content</li>
                          <li>• Boundary violations</li>
                          <li>• Spam or unwanted contact</li>
                          <li>• Misleading information</li>
                          <li>• Community guideline violations</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">How to Report</h3>
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <FlagIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="text-blue-300 font-medium mb-1">Reporting Process</h4>
                          <ul className="text-blue-200 text-sm space-y-1">
                            <li>• Use the report button on content or profiles</li>
                            <li>• Provide specific details about the violation</li>
                            <li>• Include relevant screenshots or evidence</li>
                            <li>• Contact safety@osa-platform.com for urgent issues</li>
                            <li>• Reports are reviewed within 24 hours</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Consequences Section */}
              <section id="consequences" className="border-t border-neutral-700/50 pt-8">
                <h2 className="text-2xl font-bold text-white mb-6">Consequences</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Enforcement Actions</h3>
                    <p className="text-neutral-300 mb-4">
                      Violations of these guidelines may result in various enforcement actions, depending 
                      on the severity and frequency of the violation.
                    </p>
                    <div className="space-y-4">
                      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                        <h4 className="text-yellow-300 font-medium mb-2">Warning</h4>
                        <p className="text-yellow-200 text-sm">
                          First-time minor violations may result in a warning and educational resources.
                        </p>
                      </div>
                      <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
                        <h4 className="text-orange-300 font-medium mb-2">Temporary Suspension</h4>
                        <p className="text-orange-200 text-sm">
                          Repeated violations or moderate infractions may result in temporary account suspension.
                        </p>
                      </div>
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                        <h4 className="text-red-300 font-medium mb-2">Permanent Ban</h4>
                        <p className="text-red-200 text-sm">
                          Severe violations, repeated offenses, or safety concerns may result in permanent 
                          account termination.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-white mb-3">Appeal Process</h3>
                    <p className="text-neutral-300 mb-4">
                      If you believe an enforcement action was taken in error, you may appeal the decision:
                    </p>
                    <ul className="text-neutral-300 space-y-2 ml-6">
                      <li>• Submit an appeal within 30 days of the action</li>
                      <li>• Provide evidence and explanation for your appeal</li>
                      <li>• Appeals are reviewed by a different moderator</li>
                      <li>• Final decisions are made within 7 business days</li>
                    </ul>
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

export default ModernCommunityGuidelines; 