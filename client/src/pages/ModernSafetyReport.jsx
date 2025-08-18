import React, { useState } from 'react';
import { 
  FireIcon, 
  FlagIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  PaperAirplaneIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  UserMinusIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';

const ModernSafetyReport = () => {
  const [formData, setFormData] = useState({
    reportType: '',
    severity: 'medium',
    description: '',
    evidence: [],
    reportedUser: '',
    location: '',
    additionalDetails: '',
    contactPreference: 'anonymous',
    allowFollowUp: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const reportTypes = [
    {
      value: 'inappropriate_content',
      label: 'Inappropriate Content',
      description: 'Content that violates community guidelines',
      icon: <DocumentTextIcon className="w-5 h-5" />
    },
    {
      value: 'harassment',
      label: 'Harassment',
      description: 'Unwanted behavior or communication',
      icon: <ChatBubbleLeftIcon className="w-5 h-5" />
    },
    {
      value: 'fake_profile',
      label: 'Fake Profile',
      description: 'Impersonation or false identity',
      icon: <UserIcon className="w-5 h-5" />
    },
    {
      value: 'unsafe_behavior',
      label: 'Unsafe Behavior',
      description: 'Actions that could harm users',
      icon: <ExclamationTriangleIcon className="w-5 h-5" />
    },
    {
      value: 'spam',
      label: 'Spam',
      description: 'Unwanted promotional content',
      icon: <PaperAirplaneIcon className="w-5 h-5" />
    },
    {
      value: 'other',
      label: 'Other',
      description: 'Other safety concerns',
      icon: <FlagIcon className="w-5 h-5" />
    }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', description: 'Minor violation, first offense' },
    { value: 'medium', label: 'Medium', description: 'Moderate violation, repeated offense' },
    { value: 'high', label: 'High', description: 'Serious violation, immediate action needed' },
    { value: 'urgent', label: 'Urgent', description: 'Critical safety issue, emergency response' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Safety report submitted:', formData);
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        reportType: '',
        severity: 'medium',
        description: '',
        evidence: [],
        reportedUser: '',
        location: '',
        additionalDetails: '',
        contactPreference: 'anonymous',
        allowFollowUp: false
      });
      
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500'
    };
    return colors[severity] || 'bg-gray-500';
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center py-12 px-6 sm:px-8 lg:px-12">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-12">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckIcon className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Report Submitted</h1>
            <p className="text-neutral-300 text-lg mb-8">
              Thank you for helping keep our community safe. Your report has been received and will be reviewed by our safety team.
            </p>
            <div className="space-y-4">
              <div className="bg-neutral-700/30 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">What happens next?</h3>
                <ul className="text-neutral-400 text-sm space-y-1 text-left">
                  <li>• Your report will be reviewed within 24 hours</li>
                  <li>• Our safety team will investigate the issue</li>
                  <li>• Appropriate action will be taken if needed</li>
                  <li>• You'll receive updates if you requested follow-up</li>
                </ul>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-all duration-200"
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-12 px-6 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Safety Report</h1>
              <p className="text-neutral-400">Help us keep the community safe by reporting inappropriate behavior</p>
            </div>
          </div>
        </div>

        {/* Safety Notice */}
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-400 mt-0.5" />
            <div>
              <h3 className="text-white font-medium mb-2">Important Safety Information</h3>
              <p className="text-red-200 text-sm">
                If you're experiencing an immediate safety threat, please contact local law enforcement immediately. 
                This form is for reporting community guideline violations and inappropriate behavior within the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Report Form */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-4">
                What type of issue are you reporting? *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTypes.map((type) => (
                  <label key={type.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="reportType"
                      value={type.value}
                      checked={formData.reportType === type.value}
                      onChange={(e) => handleInputChange('reportType', e.target.value)}
                      className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-5 h-5 text-neutral-400">
                          {type.icon}
                        </div>
                        <span className="text-white font-medium">{type.label}</span>
                      </div>
                      <div className="text-neutral-400 text-sm">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Severity Level */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-4">
                How severe is this issue? *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {severityLevels.map((level) => (
                  <label key={level.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="severity"
                      value={level.value}
                      checked={formData.severity === level.value}
                      onChange={(e) => handleInputChange('severity', e.target.value)}
                      className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(level.value)}`}></div>
                        <span className="text-white font-medium">{level.label}</span>
                      </div>
                      <div className="text-neutral-400 text-sm">{level.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-300 mb-2">
                Describe what happened *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Please provide a detailed description of the incident..."
                required
              />
            </div>

            {/* Reported User */}
            <div>
              <label htmlFor="reportedUser" className="block text-sm font-medium text-neutral-300 mb-2">
                Who is this report about? (if applicable)
              </label>
              <input
                type="text"
                id="reportedUser"
                value={formData.reportedUser}
                onChange={(e) => handleInputChange('reportedUser', e.target.value)}
                className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Username or profile link"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-neutral-300 mb-2">
                Where did this happen?
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Page URL, task ID, or general location"
              />
            </div>

            {/* Additional Details */}
            <div>
              <label htmlFor="additionalDetails" className="block text-sm font-medium text-neutral-300 mb-2">
                Additional Details
              </label>
              <textarea
                id="additionalDetails"
                value={formData.additionalDetails}
                onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
                rows={3}
                className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Any additional context, screenshots, or evidence..."
              />
            </div>

            {/* Contact Preferences */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-4">
                Contact Preferences
              </label>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="contactPreference"
                      value="anonymous"
                      checked={formData.contactPreference === 'anonymous'}
                      onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                      className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                    />
                    <div>
                      <span className="text-white font-medium">Anonymous Report</span>
                      <p className="text-neutral-400 text-sm">Your identity will not be shared with the reported user</p>
                    </div>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="contactPreference"
                      value="identified"
                      checked={formData.contactPreference === 'identified'}
                      onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                      className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                    />
                    <div>
                      <span className="text-white font-medium">Identified Report</span>
                      <p className="text-neutral-400 text-sm">Our safety team may contact you for additional information</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Follow-up Permission */}
            <div>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowFollowUp}
                  onChange={(e) => handleInputChange('allowFollowUp', e.target.checked)}
                  className="w-5 h-5 text-primary bg-neutral-700/50 border-neutral-600/50 rounded focus:ring-primary focus:ring-2 mt-0.5"
                />
                <div>
                  <span className="text-white font-medium">Allow Follow-up Contact</span>
                  <p className="text-neutral-400 text-sm">
                    We may contact you for additional information or to provide updates on the investigation
                  </p>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.reportType || !formData.description}
              className="w-full py-3 bg-primary hover:bg-primary-dark disabled:bg-neutral-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting Report...</span>
                </>
              ) : (
                <>
                  <FlagIcon className="w-5 h-5" />
                  <span>Submit Safety Report</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 text-center">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <h3 className="text-white font-medium mb-4">Need Immediate Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-neutral-400">
                <p className="font-medium text-white mb-1">Emergency Services</p>
                <p>Call 911 for immediate danger</p>
              </div>
              <div className="text-neutral-400">
                <p className="font-medium text-white mb-1">Community Guidelines</p>
                <p>Review our safety policies</p>
              </div>
              <div className="text-neutral-400">
                <p className="font-medium text-white mb-1">Support Team</p>
                <p>Contact our safety team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSafetyReport; 