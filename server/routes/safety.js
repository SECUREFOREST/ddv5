const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Report = require('../models/Report');
const User = require('../models/User');

/**
 * @route   POST /safety/report
 * @desc    Submit a safety report
 * @access  Private
 */
router.post('/report', auth, async (req, res) => {
  try {
    const {
      type,
      urgency,
      subject,
      description,
      reportedUser,
      evidence,
      contactEmail,
      allowContact
    } = req.body;

    // Validate required fields
    if (!type || !urgency || !subject || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate report type
    const validTypes = ['harassment', 'non_consensual', 'underage', 'hate_speech', 'impersonation', 'spam', 'technical', 'other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid report type' });
    }

    // Validate urgency level
    const validUrgency = ['low', 'medium', 'high', 'critical'];
    if (!validUrgency.includes(urgency)) {
      return res.status(400).json({ error: 'Invalid urgency level' });
    }

    // Create the report
    const report = new Report({
      type,
      urgency,
      subject,
      description,
      reportedUser: reportedUser?.trim() || null,
      evidence: evidence?.trim() || null,
      contactEmail: allowContact ? contactEmail : null,
      allowContact,
      reporterId: req.user.id,
      timestamp: new Date()
    });

    await report.save();

    // Log the report for admin review


    res.status(201).json({
      message: 'Safety report submitted successfully',
      reportId: report._id
    });

  } catch (error) {
    console.error('Safety report error:', error);
    res.status(500).json({ error: 'Failed to submit safety report' });
  }
});

/**
 * @route   GET /safety/guidelines
 * @desc    Get community guidelines
 * @access  Public
 */
router.get('/guidelines', async (req, res) => {
  try {
    const guidelines = {
      corePrinciples: [
        'Consent is mandatory - All interactions must be between consenting adults',
        'Respect personal boundaries - Honor stated limits and preferences',
        'Privacy is paramount - Content is private by default and expires automatically',
        'No harassment or abuse - Verbal abuse, threats, or encouraging harm is strictly prohibited'
      ],
      allowed: [
        'Consensual adult interactions between 18+ users',
        'Respectful exploration of kinks and fantasies',
        'Honoring stated limits and hard boundaries',
        'Personal beliefs and preferences (so long as acts are consensual)',
        'Constructive feedback and community support'
      ],
      prohibited: [
        'Harassment, threats, or encouraging self-harm',
        'Non-consensual content sharing or distribution',
        'Underage content or interactions',
        'Hate speech or discrimination',
        'Impersonation or fake accounts',
        'Spam or commercial solicitation'
      ],
      privacy: {
        photoDeletion: 'Photos are automatically deleted after viewing unless you choose otherwise',
        contentExpiration: 'Content expires in 30 days by default',
        screenshotWarning: 'Screenshots are not prevented - trust your recipients',
        controlWarning: 'Once shared, you lose control over content distribution'
      },
      enforcement: {
        violations: 'Violations can result in temporary suspension or permanent account termination',
        reporting: 'Use the Safety Report form for violations',
        blocking: 'Block users who make you uncomfortable',
        confidentiality: 'All reports are handled confidentially'
      }
    };

    res.json(guidelines);
  } catch (error) {
    console.error('Guidelines error:', error);
    res.status(500).json({ error: 'Failed to retrieve guidelines' });
  }
});

/**
 * @route   GET /safety/terms
 * @desc    Get terms of service
 * @access  Public
 */
router.get('/terms', async (req, res) => {
  try {
    const terms = {
      title: 'Terms of Service & Community Guidelines',
      subtitle: 'Built by kinky folks, for kinky folks',
      lastUpdated: new Date().toISOString(),
      sections: {
        corePrinciples: {
          title: 'Core Principles',
          content: 'Deviant Dare is a safe, private space for consensual adult interactions. Our community is built on mutual respect, explicit consent, and personal responsibility.'
        },
        safetyPrivacy: {
          title: 'Safety & Privacy',
          content: 'Your safety and privacy are our top priorities. Content is private by default and expires automatically.'
        },
        communityGuidelines: {
          title: 'Community Guidelines',
          content: 'We foster a respectful community where all members feel safe to explore their boundaries.'
        },
        enforcement: {
          title: 'Enforcement & Reporting',
          content: 'Violations of these guidelines can result in temporary suspension or permanent account termination.'
        },
        accountManagement: {
          title: 'Account Management',
          content: 'You have full control over your account and content.'
        }
      }
    };

    res.json(terms);
  } catch (error) {
    console.error('Terms error:', error);
    res.status(500).json({ error: 'Failed to retrieve terms' });
  }
});

// GET /safety/content_deletion - get user's content deletion setting
router.get('/content_deletion', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ value: user?.contentDeletion || '' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch content deletion setting.' });
  }
});

// POST /safety/content_deletion - update user's content deletion setting
router.post('/content_deletion', auth, async (req, res) => {
  let { value } = req.body;
  // Map legacy/frontend values to canonical enum values
  if (value === 'when_viewed') value = 'delete_after_view';
  if (value === '30_days') value = 'delete_after_30_days';
  if (value === 'never') value = 'never_delete';
  try {
    await User.findByIdAndUpdate(req.userId, { contentDeletion: value });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update content deletion setting.' });
  }
});

module.exports = router; 