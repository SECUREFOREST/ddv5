import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  UserGroupIcon,
  LockClosedIcon,
  EyeIcon,
  FireIcon,
  PlayIcon,
  ClockIcon,
  BoltIcon,
  StarIcon,
  CogIcon,
  BellIcon,
  BookOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const ModernTermsOfService = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState(new Set(['core-principles']));

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const sections = [
    {
      id: 'core-principles',
      title: 'Core Principles',
      icon: HeartIcon,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      content: (
        <div className="space-y-4 text-neutral-300">
          <p className="text-lg leading-relaxed">
            Deviant Dare is a safe, private space for consensual adult interactions. Our community is built on mutual respect, explicit consent, and personal responsibility.
          </p>
          <ul className="space-y-3 ml-6 list-disc">
            <li><strong className="text-white">Consent is mandatory.</strong> All interactions must be between consenting adults.</li>
            <li><strong className="text-white">Respect personal boundaries.</strong> Honor stated limits and preferences.</li>
            <li><strong className="text-white">Privacy is paramount.</strong> Content is private by default and expires automatically.</li>
            <li><strong className="text-white">No harassment or abuse.</strong> Verbal abuse, threats, or encouraging harm is strictly prohibited.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'safety-privacy',
      title: 'Safety & Privacy',
      icon: LockClosedIcon,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      content: (
        <div className="space-y-4 text-neutral-300">
          <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-4">
            <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5" />
              Photo & Content Privacy
            </h4>
            <ul className="space-y-2 text-sm">
              <li>• Photos are <strong>never public by default</strong></li>
              <li>• Content expires automatically after 30 days</li>
              <li>• You can delete content immediately after viewing</li>
              <li>• Block feature hides your content from unwanted users</li>
            </ul>
          </div>
          <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-300 mb-2 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              Important Privacy Warnings
            </h4>
            <ul className="space-y-2 text-sm">
              <li>• <strong>Photos are automatically deleted after viewing</strong> unless you choose otherwise</li>
              <li>• Content expires in 30 days by default</li>
              <li>• Screenshots are not prevented - trust your recipients</li>
              <li>• Once shared, you lose control over content distribution</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'community-guidelines',
      title: 'Community Guidelines',
      icon: UserGroupIcon,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      content: (
        <div className="space-y-6 text-neutral-300">
          <div>
            <h4 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              What's Allowed
            </h4>
            <ul className="space-y-2 ml-6 list-disc">
              <li>Consensual adult interactions between 18+ users</li>
              <li>Respectful exploration of kinks and fantasies</li>
              <li>Honoring stated limits and hard boundaries</li>
              <li>Personal beliefs and preferences (so long as acts are consensual)</li>
              <li>Constructive feedback and community support</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <XCircleIcon className="w-5 h-5 text-red-400" />
              What's Prohibited
            </h4>
            <ul className="space-y-2 ml-6 list-disc">
              <li>Harassment, threats, or encouraging self-harm</li>
              <li>Non-consensual content sharing or distribution</li>
              <li>Underage content or interactions</li>
              <li>Hate speech or discrimination</li>
              <li>Impersonation or fake accounts</li>
              <li>Spam or commercial solicitation</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'enforcement',
      title: 'Enforcement & Reporting',
      icon: ExclamationTriangleIcon,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      content: (
        <div className="space-y-4 text-neutral-300">
          <p className="text-lg leading-relaxed">
            Violations of these guidelines can result in temporary suspension or permanent account termination.
          </p>
          <div className="bg-red-600/20 border border-red-500/30 rounded-xl p-4">
            <h4 className="font-semibold text-red-300 mb-2 flex items-center gap-2">
              <InformationCircleIcon className="w-5 h-5" />
              How to Report Issues
            </h4>
            <ul className="space-y-2 text-sm">
              <li>• Use the <Link to="/modern/safety/report" className="text-red-300 underline hover:text-red-200">Safety Report</Link> form for violations</li>
              <li>• Block users who make you uncomfortable</li>
              <li>• Contact support for technical issues</li>
              <li>• All reports are reviewed by our safety team</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'account-management',
      title: 'Account Management',
      icon: EyeIcon,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      content: (
        <div className="space-y-4 text-neutral-300">
          <p className="text-lg leading-relaxed">
            You have full control over your account and content.
          </p>
          <ul className="space-y-2 ml-6 list-disc">
            <li>Edit your profile and preferences at any time</li>
            <li>Delete your account and all associated content</li>
            <li>Control content expiration and privacy settings</li>
            <li>Manage blocked users and privacy preferences</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border-b border-neutral-700/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
                <p className="text-neutral-400 text-sm">Community guidelines and rules</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Legal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center">
              <ShieldCheckIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Terms of Service & Community Guidelines</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                Built by kinky folks, for kinky folks
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Our platform is built on the foundation of consent, respect, and safety. 
            These guidelines ensure a positive experience for all community members.
          </p>
        </div>

        {/* Interactive Sections */}
        <div className="space-y-6">
          {sections.map((section) => {
            const SectionIcon = section.icon;
            const isExpanded = expandedSections.has(section.id);
            
            return (
              <div key={section.id} className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 shadow-xl overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-6 text-left hover:bg-neutral-700/50 transition-all duration-200"
                  aria-expanded={isExpanded}
                  aria-controls={`${section.id}-content`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 bg-gradient-to-r ${section.color} rounded-xl`}>
                        <SectionIcon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">{section.title}</h3>
                    </div>
                    <div className={`p-2 bg-neutral-700/50 rounded-lg transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}>
                      {isExpanded ? (
                        <ChevronUpIcon className="w-5 h-5 text-neutral-400" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                  </div>
                </button>
                
                {isExpanded && (
                  <div 
                    id={`${section.id}-content`}
                    className="px-6 pb-6 border-t border-neutral-700/50"
                  >
                    {section.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-gradient-to-r from-primary/20 to-primary-dark/20 backdrop-blur-sm rounded-2xl border border-primary/30 p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Need Help or Want to Report Something?</h3>
          <p className="text-neutral-300 mb-6">
            Our safety team is here to help maintain a positive community environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/modern/safety/report">
              <button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2 justify-center">
                <ExclamationTriangleIcon className="w-5 h-5" />
                Report Issue
              </button>
            </Link>
            <Link to="/modern/news">
              <button className="w-full sm:w-auto bg-neutral-700/50 text-neutral-300 border border-neutral-600/50 rounded-xl px-6 py-3 font-bold transition-all duration-200 hover:bg-neutral-600/50 flex items-center gap-2 justify-center">
                <BookOpenIcon className="w-5 h-5" />
                Community News
              </button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center py-8 border-t border-neutral-700/50">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6">
            <p className="text-neutral-400 text-sm mb-2">
              Built by kinky folks, for kinky folks
            </p>
            <p className="text-neutral-500 text-xs">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <div className="mt-4 flex justify-center gap-4 text-xs text-neutral-500">
              <span>Version 2.0</span>
              <span>•</span>
              <span>Community Driven</span>
              <span>•</span>
              <span>Safety First</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernTermsOfService; 