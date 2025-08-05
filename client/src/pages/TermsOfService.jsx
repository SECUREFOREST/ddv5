import React from 'react';
import { Helmet } from 'react-helmet';
import { ShieldCheckIcon, ExclamationTriangleIcon, HeartIcon, UserGroupIcon, LockClosedIcon, EyeIcon } from '@heroicons/react/24/solid';
import { MainContent, ContentContainer } from '../components/Layout';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <MainContent className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-2xl shadow-2xl shadow-red-500/25">
                <ShieldCheckIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Terms of Service & Community Guidelines</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Built by kinky folks, for kinky folks
            </p>
          </div>

          <div className="space-y-8">
            {/* Core Principles */}
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <HeartIcon className="w-8 h-8 text-red-500" />
                Core Principles
              </h2>
              <div className="space-y-4 text-neutral-300">
                <p className="text-lg">
                  Deviant Dare is a safe, private space for consensual adult interactions. Our community is built on mutual respect, explicit consent, and personal responsibility.
                </p>
                <ul className="space-y-2 ml-6 list-disc">
                  <li><strong>Consent is mandatory.</strong> All interactions must be between consenting adults.</li>
                  <li><strong>Respect personal boundaries.</strong> Honor stated limits and preferences.</li>
                  <li><strong>Privacy is paramount.</strong> Content is private by default and expires automatically.</li>
                  <li><strong>No harassment or abuse.</strong> Verbal abuse, threats, or encouraging harm is strictly prohibited.</li>
                </ul>
              </div>
            </div>

            {/* Safety & Privacy */}
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <LockClosedIcon className="w-8 h-8 text-blue-500" />
                Safety & Privacy
              </h2>
              <div className="space-y-4 text-neutral-300">
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-300 mb-2">Photo & Content Privacy</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Photos are <strong>never public by default</strong></li>
                    <li>• Content expires automatically after 30 days</li>
                    <li>• You can delete content immediately after viewing</li>
                    <li>• Block feature hides your content from unwanted users</li>
                  </ul>
                </div>
                <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-4">
                  <h3 className="font-semibold text-yellow-300 mb-2">⚠️ Important Privacy Warnings</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• <strong>Photos are automatically deleted after viewing</strong> unless you choose otherwise</li>
                    <li>• Content expires in 30 days by default</li>
                    <li>• Screenshots are not prevented - trust your recipients</li>
                    <li>• Once shared, you lose control over content distribution</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <UserGroupIcon className="w-8 h-8 text-green-500" />
                Community Guidelines
              </h2>
              <div className="space-y-6 text-neutral-300">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">✅ What's Allowed</h3>
                  <ul className="space-y-2 ml-6 list-disc">
                    <li>Consensual adult interactions between 18+ users</li>
                    <li>Respectful exploration of kinks and fantasies</li>
                    <li>Honoring stated limits and hard boundaries</li>
                    <li>Personal beliefs and preferences (so long as acts are consensual)</li>
                    <li>Constructive feedback and community support</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">❌ What's Prohibited</h3>
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
            </div>

            {/* Enforcement */}
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                Enforcement & Reporting
              </h2>
              <div className="space-y-4 text-neutral-300">
                <p className="text-lg">
                  Violations of these guidelines can result in temporary suspension or permanent account termination.
                </p>
                <div className="bg-red-600/20 border border-red-500/30 rounded-xl p-4">
                  <h3 className="font-semibold text-red-300 mb-2">How to Report Issues</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Use the <Link to="/safety/report" className="text-red-300 underline hover:text-red-200">Safety Report</Link> form for violations</li>
                    <li>• Block users who make you uncomfortable</li>
                    <li>• Contact support for technical issues</li>
                    <li>• All reports are reviewed by our safety team</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Account Management */}
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <EyeIcon className="w-8 h-8 text-purple-500" />
                Account Management
              </h2>
              <div className="space-y-4 text-neutral-300">
                <p className="text-lg">
                  You have full control over your account and content.
                </p>
                <ul className="space-y-2 ml-6 list-disc">
                  <li>Edit your profile and preferences at any time</li>
                  <li>Delete your account and all associated content</li>
                  <li>Control content expiration and privacy settings</li>
                  <li>Manage blocked users and privacy preferences</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center py-8 border-t border-neutral-700">
              <p className="text-neutral-400 text-sm">
                Built by kinky folks, for kinky folks
              </p>
              <p className="text-neutral-500 text-xs mt-2">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </MainContent>
      </ContentContainer>
    </div>
  );
} 