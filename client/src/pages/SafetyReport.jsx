import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { ShieldCheckIcon, ExclamationTriangleIcon, UserIcon, ChatBubbleLeftRightIcon, FlagIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import { MainContent, ContentContainer } from '../components/Layout';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/Button';
import { FormInput, FormSelect, FormTextarea } from '../components/Form';
import { ErrorAlert, SuccessAlert } from '../components/Alert';
import { ButtonLoading } from '../components/LoadingSpinner';
import { retryApiCall } from '../utils/retry';
import { validateFormData, VALIDATION_SCHEMAS } from '../utils/validation';

const REPORT_TYPES = [
  { value: 'harassment', label: 'Harassment or Abuse', description: 'Verbal abuse, threats, or unwanted contact' },
  { value: 'non_consensual', label: 'Non-Consensual Content', description: 'Sharing content without consent' },
  { value: 'underage', label: 'Underage Content', description: 'Content involving minors' },
  { value: 'hate_speech', label: 'Hate Speech', description: 'Discrimination or hate speech' },
  { value: 'impersonation', label: 'Impersonation', description: 'Fake accounts or impersonation' },
  { value: 'spam', label: 'Spam or Commercial', description: 'Unwanted commercial content' },
  { value: 'technical', label: 'Technical Issue', description: 'Bug or technical problem' },
  { value: 'other', label: 'Other', description: 'Other safety concern' }
];

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low', description: 'Minor issue, not urgent' },
  { value: 'medium', label: 'Medium', description: 'Moderate concern' },
  { value: 'high', label: 'High', description: 'Serious violation' },
  { value: 'critical', label: 'Critical', description: 'Immediate safety concern' }
];

export default function SafetyReport() {
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
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Safety Report</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Help us maintain a safe community
            </p>
          </div>

          {submitSuccess ? (
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
              <SuccessAlert className="mb-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-green-400 mb-4">Report Submitted Successfully</h2>
                  <p className="text-neutral-300 mb-6">
                    Thank you for helping keep our community safe. Our safety team will review your report and take appropriate action.
                  </p>
                  <div className="space-y-4 text-sm text-neutral-400">
                    <p>• You will receive a confirmation email if you provided contact information</p>
                    <p>• Critical reports are reviewed within 24 hours</p>
                    <p>• All reports are handled confidentially</p>
                  </div>
                  <Button 
                    onClick={() => setSubmitSuccess(false)}
                    className="mt-6"
                  >
                    Submit Another Report
                  </Button>
                </div>
              </SuccessAlert>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
              {/* Important Notice */}
              <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-yellow-300 mb-2">Important Safety Information</h3>
                    <ul className="space-y-1 text-sm text-neutral-300">
                      <li>• <strong>For immediate danger:</strong> Contact local authorities first</li>
                      <li>• <strong>For harassment:</strong> Use the block feature immediately</li>
                      <li>• <strong>For technical issues:</strong> Include screenshots if possible</li>
                      <li>• <strong>All reports are confidential</strong> and reviewed by our safety team</li>
                    </ul>
                  </div>
                </div>
              </div>

              {submitError && (
                <ErrorAlert className="mb-6">
                  {submitError}
                </ErrorAlert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Report Type */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Report Type *
                  </label>
                  <FormSelect
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    required
                    className="w-full"
                  >
                    <option value="">Select report type</option>
                    {REPORT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </FormSelect>
                </div>

                {/* Urgency Level */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Urgency Level *
                  </label>
                  <FormSelect
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    required
                    className="w-full"
                  >
                    {URGENCY_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label} - {level.description}
                      </option>
                    ))}
                  </FormSelect>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Brief Subject *
                  </label>
                  <FormInput
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of the issue"
                    required
                    maxLength={100}
                  />
                </div>

                {/* Reported User (Optional) */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Username of Reported User (Optional)
                  </label>
                  <FormInput
                    type="text"
                    value={reportedUser}
                    onChange={(e) => setReportedUser(e.target.value)}
                    placeholder="Enter username if reporting a specific user"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Detailed Description *
                  </label>
                  <FormTextarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide detailed information about the issue, including dates, times, and specific details..."
                    required
                    rows={6}
                    maxLength={2000}
                  />
                  <p className="text-neutral-400 text-sm mt-1">
                    {description.length}/2000 characters
                  </p>
                </div>

                {/* Evidence */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Evidence or Additional Information (Optional)
                  </label>
                  <FormTextarea
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    placeholder="Screenshots, links, or additional context that supports your report..."
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-neutral-400 text-sm mt-1">
                    {evidence.length}/1000 characters
                  </p>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="allowContact"
                      checked={allowContact}
                      onChange={(e) => setAllowContact(e.target.checked)}
                      className="w-4 h-4 text-primary bg-neutral-800 border-neutral-600 rounded focus:ring-primary focus:ring-2"
                    />
                    <label htmlFor="allowContact" className="text-white font-semibold">
                      Allow us to contact you about this report
                    </label>
                  </div>
                  
                  {allowContact && (
                    <div>
                      <label className="block text-white font-semibold mb-3">
                        Contact Email
                      </label>
                      <FormInput
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="Your email address"
                        required={allowContact}
                      />
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? (
                      <ButtonLoading text="Submitting Report..." />
                    ) : (
                      <>
                        <FlagIcon className="w-5 h-5 mr-2" />
                        Submit Safety Report
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-neutral-700">
                <div className="text-center text-neutral-400 text-sm">
                  <p>Built by kinky folks, for kinky folks</p>
                  <p className="mt-1">Your safety and privacy are our top priorities</p>
                </div>
              </div>
            </div>
          )}
        </MainContent>
      </ContentContainer>
    </div>
  );
} 