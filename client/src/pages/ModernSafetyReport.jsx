import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  FlagIcon,
  EnvelopeIcon,
  FireIcon,
  PlayIcon,
  ClockIcon,
  EyeIcon,
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
  ChevronUpIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { retryApiCall } from '../utils/retry';
import { validateFormData, VALIDATION_SCHEMAS } from '../utils/validation';

const REPORT_TYPES = [
  { 
    value: 'harassment', 
    label: 'Harassment or Abuse', 
    description: 'Verbal abuse, threats, or unwanted contact',
    icon: ExclamationTriangleIcon,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30'
  },
  { 
    value: 'non_consensual', 
    label: 'Non-Consensual Content', 
    description: 'Sharing content without consent',
    icon: ShieldCheckIcon,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30'
  },
  { 
    value: 'underage', 
    label: 'Underage Content', 
    description: 'Content involving minors',
    icon: XCircleIcon,
    color: 'from-red-600 to-red-700',
    bgColor: 'bg-red-600/20',
    borderColor: 'border-red-600/30'
  },
  { 
    value: 'hate_speech', 
    label: 'Hate Speech', 
    description: 'Discrimination or hate speech',
    icon: XMarkIcon,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30'
  },
  { 
    value: 'impersonation', 
    label: 'Impersonation', 
    description: 'Fake accounts or impersonation',
    icon: UserIcon,
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30'
  },
  { 
    value: 'spam', 
    label: 'Spam or Commercial', 
    description: 'Unwanted commercial content',
    icon: ChatBubbleLeftRightIcon,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30'
  },
  { 
    value: 'technical', 
    label: 'Technical Issue', 
    description: 'Bug or technical problem',
    icon: CogIcon,
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/30'
  },
  { 
    value: 'other', 
    label: 'Other', 
    description: 'Other safety concern',
    icon: InformationCircleIcon,
    color: 'from-neutral-500 to-neutral-600',
    bgColor: 'bg-neutral-500/20',
    borderColor: 'border-neutral-500/30'
  }
];

const URGENCY_LEVELS = [
  { 
    value: 'low', 
    label: 'Low', 
    description: 'Minor issue, not urgent',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30'
  },
  { 
    value: 'medium', 
    label: 'Medium', 
    description: 'Moderate concern',
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30'
  },
  { 
    value: 'high', 
    label: 'High', 
    description: 'Serious violation',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30'
  },
  { 
    value: 'critical', 
    label: 'Critical', 
    description: 'Immediate safety concern',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30'
  }
];

const ModernSafetyReport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [reportType, setReportType] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [reportedUser, setReportedUser] = useState('');
  const [evidence, setEvidence] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [allowContact, setAllowContact] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    // Validate form data
    const validation = validateFormData(
      { reportType, urgency, subject, description, contactEmail },
      VALIDATION_SCHEMAS.safetyReport
    );

    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors)[0];
      showError(errorMessage);
      return;
    }

    setSubmitting(true);
    try {
      const reportData = {
        type: reportType,
        urgency,
        subject,
        description,
        reportedUser: reportedUser.trim() || null,
        evidence: evidence.trim() || null,
        contactEmail: allowContact ? contactEmail : null,
        allowContact,
        reporterId: user?.id || user?._id,
        timestamp: new Date().toISOString()
      };

      await retryApiCall(() => api.post('/safety/report', reportData));
      
      setSubmitSuccess(true);
      showSuccess('Safety report submitted successfully. Our team will review it promptly.');
      
      // Reset form
      setReportType('');
      setUrgency('medium');
      setSubject('');
      setDescription('');
      setReportedUser('');
      setEvidence('');
      setAllowContact(true);
      
    } catch (err) {
      console.error('Safety report submission error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to submit safety report.';
      setSubmitError(errorMessage);
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getReportTypeInfo = (type) => {
    return REPORT_TYPES.find(t => t.value === type) || REPORT_TYPES[REPORT_TYPES.length - 1];
  };

  const getUrgencyInfo = (level) => {
    return URGENCY_LEVELS.find(u => u.value === level) || URGENCY_LEVELS[1];
  };

  if (submitSuccess) {
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
                  <h1 className="text-2xl font-bold text-white">Safety Report</h1>
                  <p className="text-neutral-400 text-sm">Report submitted successfully</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm font-medium">
                  <div className="flex items-center space-x-1">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Success</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-green-400 mb-4">Report Submitted Successfully</h2>
              <p className="text-neutral-300 mb-6 text-lg">
                Thank you for helping keep our community safe. Our safety team will review your report and take appropriate action.
              </p>
              <div className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-6 mb-8 max-w-2xl mx-auto">
                <div className="space-y-3 text-sm text-neutral-400">
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-400" />
                    <span>You will receive a confirmation email if you provided contact information</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-blue-400" />
                    <span>Critical reports are reviewed within 24 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4 text-purple-400" />
                    <span>All reports are handled confidentially</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSubmitSuccess(false)}
                className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-8 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Submit Another Report
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-white">Safety Report</h1>
                <p className="text-neutral-400 text-sm">Help maintain a safe community</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Safety</span>
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
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Safety Report</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                Help us maintain a safe community
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Your safety and privacy are our top priorities. Report any concerns and help us keep our community safe.
          </p>
        </div>

        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
          {/* Important Notice */}
          <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-300 mb-3 text-lg">Important Safety Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-neutral-300">
                  <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                    <span><strong>For immediate danger:</strong> Contact local authorities first</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4 text-blue-400" />
                    <span><strong>For harassment:</strong> Use the block feature immediately</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CogIcon className="w-4 h-4 text-purple-400" />
                    <span><strong>For technical issues:</strong> Include screenshots if possible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <EyeIcon className="w-4 h-4 text-green-400" />
                    <span><strong>All reports are confidential</strong> and reviewed by our safety team</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <XCircleIcon className="w-6 h-6 text-red-400" />
                <div>
                  <div className="font-semibold text-red-300 text-lg mb-1">Submission Error</div>
                  <div className="text-red-200">{submitError}</div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Report Type Selection */}
            <div>
              <label className="block text-white font-semibold mb-4 text-lg">
                Report Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REPORT_TYPES.map(type => {
                  const TypeIcon = type.icon;
                  const isSelected = reportType === type.value;
                  
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setReportType(type.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        isSelected
                          ? `border-primary bg-primary/20 shadow-lg`
                          : `border-neutral-600/50 bg-neutral-700/50 hover:border-neutral-500/50 hover:bg-neutral-600/50`
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${type.bgColor} border ${type.borderColor}`}>
                          <TypeIcon className={`w-5 h-5 bg-gradient-to-r ${type.color} bg-clip-text text-transparent`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white mb-1">{type.label}</div>
                          <div className="text-sm text-neutral-400">{type.description}</div>
                        </div>
                        {isSelected && (
                          <CheckIcon className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Urgency Level Selection */}
            <div>
              <label className="block text-white font-semibold mb-4 text-lg">
                Urgency Level *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {URGENCY_LEVELS.map(level => {
                  const isSelected = urgency === level.value;
                  
                  return (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setUrgency(level.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                        isSelected
                          ? `border-primary bg-primary/20 shadow-lg`
                          : `border-neutral-600/50 bg-neutral-700/50 hover:border-neutral-500/50 hover:bg-neutral-600/50`
                      }`}
                    >
                      <div className={`text-2xl font-bold bg-gradient-to-r ${level.color} bg-clip-text text-transparent mb-2`}>
                        {level.label}
                      </div>
                      <div className="text-sm text-neutral-400">{level.description}</div>
                      {isSelected && (
                        <CheckIcon className="w-5 h-5 text-primary mx-auto mt-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-white font-semibold mb-3 text-lg">
                Brief Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of the issue"
                required
                maxLength={100}
                className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
              />
            </div>

            {/* Reported User (Optional) */}
            <div>
              <label className="block text-white font-semibold mb-3 text-lg">
                Username of Reported User (Optional)
              </label>
              <input
                type="text"
                value={reportedUser}
                onChange={(e) => setReportedUser(e.target.value)}
                placeholder="Enter username if reporting a specific user"
                className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-semibold mb-3 text-lg">
                Detailed Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide detailed information about the issue, including dates, times, and specific details..."
                required
                rows={6}
                maxLength={2000}
                className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-neutral-400 text-sm">
                  {description.length}/2000 characters
                </p>
                {description.length > 1800 && (
                  <p className="text-yellow-400 text-sm">
                    {2000 - description.length} characters remaining
                  </p>
                )}
              </div>
            </div>

            {/* Evidence */}
            <div>
              <label className="block text-white font-semibold mb-3 text-lg">
                Evidence or Additional Information (Optional)
              </label>
              <textarea
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="Screenshots, links, or additional context that supports your report..."
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-neutral-400 text-sm">
                  {evidence.length}/1000 characters
                </p>
                {evidence.length > 800 && (
                  <p className="text-yellow-400 text-sm">
                    {1000 - evidence.length} characters remaining
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="allowContact"
                  checked={allowContact}
                  onChange={(e) => setAllowContact(e.target.checked)}
                  className="w-5 h-5 text-primary bg-neutral-700 border-neutral-600 rounded focus:ring-primary focus:ring-2"
                />
                <label htmlFor="allowContact" className="text-white font-semibold text-lg">
                  Allow us to contact you about this report
                </label>
              </div>
              
              {allowContact && (
                <div>
                  <label className="block text-white font-semibold mb-3 text-lg">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Your email address"
                    required={allowContact}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-8 py-4 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 justify-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting Report...
                  </>
                ) : (
                  <>
                    <FlagIcon className="w-5 h-5" />
                    Submit Safety Report
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-neutral-700/50">
            <div className="text-center">
              <div className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-6">
                <p className="text-neutral-400 text-sm mb-2">
                  Built by kinky folks, for kinky folks
                </p>
                <p className="text-neutral-500 text-xs">
                  Your safety and privacy are our top priorities
                </p>
                <div className="mt-4 flex justify-center gap-4 text-xs text-neutral-500">
                  <span>24/7 Support</span>
                  <span>•</span>
                  <span>Confidential</span>
                  <span>•</span>
                  <span>Community First</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSafetyReport; 