import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { UserPlusIcon, FireIcon, SparklesIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon, ShieldCheckIcon, ClockIcon, NoSymbolIcon, StarIcon, CameraIcon, PhotoIcon, EyeIcon, EyeSlashIcon, PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, ArrowsPointingOutIcon, CalendarIcon, DocumentIcon, VideoCameraIcon, XMarkIcon, CheckIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ListSkeleton } from '../components/Skeleton';
import { PRIVACY_OPTIONS, DIFFICULTY_OPTIONS } from '../constants.jsx';
import { retryApiCall } from '../utils/retry';
import { useContentDeletion } from '../hooks/useContentDeletion';
import { DifficultyBadge } from '../components/Badge';
import { ButtonLoading } from '../components/LoadingSpinner';
import { MainContent, ContentContainer } from '../components/Layout';
import Button from '../components/Button';

export default function ClaimDare() {
  const { claimToken } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const [dare, setDare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [errorShown, setErrorShown] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [proof, setProof] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofError, setProofError] = useState('');
  const [proofSuccess, setProofSuccess] = useState('');
  const [grade, setGrade] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [gradeError, setGradeError] = useState('');
  const [grading, setGrading] = useState(false);
  const [grades, setGrades] = useState([]);
  const [chickenOutLoading, setChickenOutLoading] = useState(false);
  const [chickenOutError, setChickenOutError] = useState('');
  const [secureFileUrls, setSecureFileUrls] = useState({});
  const [proofPreview, setProofPreview] = useState({
    isFullscreen: false,
    isMuted: false,
    isPlaying: false,
    showControls: true
  });
  const [fileValidation, setFileValidation] = useState({
    isValid: true,
    error: '',
    size: 0,
    type: '',
    dimensions: null
  });
  const [filePreview, setFilePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileLoading, setFileLoading] = useState(false);

  const [fullscreenLoading, setFullscreenLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [optimizationLoading, setOptimizationLoading] = useState(false);
  const { contentDeletion, updateContentDeletion } = useContentDeletion();

  // Prevent right-click and basic keyboard shortcuts
  useEffect(() => {
    const preventRightClick = (e) => {
      if (e.type === 'contextmenu') {
        e.preventDefault();
        return false;
      }
    };

    const preventKeyboardShortcuts = (e) => {
      // Prevent common screenshot shortcuts
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.key === 'p') ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', preventRightClick);
    document.addEventListener('keydown', preventKeyboardShortcuts);
    
    // Disable text selection on proof content
    const proofElements = document.querySelectorAll('.proof-content');
    proofElements.forEach(element => {
      element.style.userSelect = 'none';
      element.style.webkitUserSelect = 'none';
      element.style.mozUserSelect = 'none';
      element.style.msUserSelect = 'none';
    });

    return () => {
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
    };
  }, []);

  const fetchClaimDare = useCallback(async () => {
    if (!claimToken) return;
    
    try {
      setLoading(true);
      
      // Use retry mechanism for dare claim fetch
      // Include auth token in case the dare is already claimed
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await retryApiCall(() => api.get(`/dares/claim/${claimToken}`, { headers }));
      
      if (response.data) {
        setDare(response.data);
        
        // If dare is already claimed by the current user, show the perform section directly
        if ((response.data.claimedBy && response.data.claimedBy === user?._id) || !response.data.claimable) {
          setSubmitted(true);
        }
        
        // Set grades from dare object and find current user's grade
        setGrades(response.data.grades || []);
        if (user && response.data.grades) {
          const currentUserGrade = response.data.grades.find(g => g.user === user._id);
          if (currentUserGrade) {
            setGrade(currentUserGrade.grade);
          }
        }
        
        // Load secure proof files if completed
        if (response.data.proof && response.data.proof.fileUrl) {
          const secureUrl = await loadSecureFile(response.data.proof.fileUrl);
          if (secureUrl) {
            setSecureFileUrls(prev => ({
              ...prev,
              [response.data.proof.fileUrl]: secureUrl
            }));
          }
        }
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Dare claim loading error:', error);
      
      // Only show error once
      if (!errorShown) {
        let errorMessage = 'Dare not found or already claimed.';
        
        if (error.response?.status === 404) {
          errorMessage = 'This dare link is invalid or has expired. The dare may have already been claimed or removed.';
        } else if (error.response?.status === 401) {
          errorMessage = 'Please log in to access this dare.';
        } else if (error.response?.status === 403) {
          errorMessage = 'You can only access dares you have claimed.';
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
        
        showError(errorMessage);
        setErrorShown(true);
      }
    } finally {
      setLoading(false);
    }
  }, [claimToken]);

  useEffect(() => {
    setErrorShown(false);
    fetchClaimDare();
  }, [fetchClaimDare]);

  const handleConsent = async (e) => {
    e.preventDefault();
    setClaiming(true);
    try {
      // Use retry mechanism for dare claim submission
      const res = await retryApiCall(() => api.post(`/dares/claim/${claimToken}`, { 
        demand: 'I consent',
        contentDeletion // OSA-style content expiration specified by participant
      }));
      
      // Check if this is a dom demand that requires double-consent
      if (dare.dareType === 'domination' && dare.requiresConsent) {
        // For dom demands, show the actual demand after consent
        setSubmitted(true);
        showSuccess('Consent given! Now you can see the actual demand.');
      } else {
        // For regular dares, redirect to perform
        const dareId = res.data?.dare?._id || (dare && dare._id);
        if (dareId) {
          showSuccess('Dare claimed successfully! Redirecting...');
          navigate(`/dare/${dareId}/perform`);
        } else {
          setSubmitted(true);
          showSuccess('Thank you! You have consented to perform this dare.');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to consent to dare.';
      showError(errorMessage);
    } finally {
      setClaiming(false);
    }
  };

  const handleBlockDom = async () => {
    console.log('Block button clicked!');
    console.log('Dare object:', dare);
    console.log('Creator:', dare?.creator);
    console.log('Creator ID:', dare?.creator?._id);
    
    if (!dare?.creator?._id) {
      console.log('No creator ID found, returning early');
      showError('Cannot block: No creator information available.');
      return;
    }
    
    console.log('Proceeding with block request for user ID:', dare.creator._id);
    setBlocking(true);
    
    try {
      console.log('Making API call to block user...');
      await retryApiCall(() => api.post('/users/block', { userId: dare.creator._id }));
      console.log('Block API call successful');
      showSuccess('Dom blocked successfully. You will no longer see their content.');
      navigate('/dashboard');
    } catch (err) {
      console.error('Block API call failed:', err);
      const errorMessage = err.response?.data?.error || 'Failed to block dom.';
      showError(errorMessage);
    } finally {
      setBlocking(false);
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    setProofLoading(true);
    setProofError('');
    setProofSuccess('');
    
    if (!proofFile) {
      showError('Please upload a proof file.');
      setProofLoading(false);
      return;
    }
    
    try {
      let formData;
      if (proofFile) {
        // Optimize file before upload
        const optimizedFile = await optimizeFile(proofFile);
        
        formData = new FormData();
        if (proof) formData.append('text', proof);
        formData.append('file', optimizedFile);
        formData.append('contentDeletion', contentDeletion);
        
        // Simulate upload progress for better UX
        setUploadProgress(10);
        setTimeout(() => setUploadProgress(30), 200);
        setTimeout(() => setUploadProgress(60), 500);
        setTimeout(() => setUploadProgress(90), 1000);
        
        await retryApiCall(() => api.post(`/dares/${dare._id}/proof`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          },
        }));
      } else {
        await retryApiCall(() => api.post(`/dares/${dare._id}/proof`, { text: proof, contentDeletion }));
      }
      setProof('');
      setProofFile(null);
      setFilePreview(null);
      setFileValidation({
        isValid: true,
        error: '',
        size: 0,
        type: '',
        dimensions: null
      });
      setUploadProgress(0);
      setProofSuccess('Proof submitted successfully!');
      showSuccess('Proof submitted successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit proof.';
      setProofError(errorMessage);
      showError(errorMessage);
    } finally {
      setProofLoading(false);
    }
  };

  const handleChickenOut = async () => {
    setChickenOutLoading(true);
    setChickenOutError('');
    try {
      await retryApiCall(() => api.post(`/dares/${dare._id}/chicken-out`));
      showSuccess('Dare declined successfully.');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to decline dare.';
      setChickenOutError(errorMessage);
      showError(errorMessage);
    } finally {
      setChickenOutLoading(false);
    }
  };

  // Mobile upload functions
  const handleCameraUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.capture = 'environment'; // Use back camera by default
    input.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (validateFile(file)) {
          setProofFile(file);
          createFilePreview(file);
        } else {
          showError(fileValidation.error);
        }
      }
    };
    input.click();
  };

  const handleGalleryUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.multiple = false;
    input.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (validateFile(file)) {
          setProofFile(file);
          createFilePreview(file);
        } else {
          showError(fileValidation.error);
        }
      }
    };
    input.click();
  };

  // Check if device supports camera
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const supportsCamera = isMobile && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

  // Secure file loading function
  const loadSecureFile = async (fileUrl) => {
    setFileLoading(true);
    try {
      const filename = fileUrl.split('/').pop();
      const response = await api.get(`/uploads/secure/${filename}`);
      const { data, contentType } = response.data;
      
      // Convert base64 to blob
      const byteCharacters = atob(data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: contentType });
      
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('Failed to load secure file:', err);
      return null;
    } finally {
      setFileLoading(false);
    }
  };

  // Enhanced proof preview functions
  const toggleFullscreen = () => {
    setProofPreview(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  };

  const openFullscreen = async (element) => {
    setFullscreenLoading(true);
    try {
      console.log('Attempting to open fullscreen for:', element);
      
      // Prevent opening in new window by ensuring we're working with the DOM element
      if (element && element.tagName) {
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen();
        } else {
          console.log('Fullscreen API not supported, using CSS fallback');
          setProofPreview(prev => ({ ...prev, isFullscreen: true }));
        }
      } else {
        console.log('Invalid element for fullscreen, using CSS fallback');
        setProofPreview(prev => ({ ...prev, isFullscreen: true }));
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      // Fallback to CSS fullscreen
      setProofPreview(prev => ({ ...prev, isFullscreen: true }));
    } finally {
      setFullscreenLoading(false);
    }
  };

  const closeFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    } catch (error) {
      console.error('Exit fullscreen error:', error);
    }
    // Always update state
    setProofPreview(prev => ({ ...prev, isFullscreen: false }));
  };

  const toggleMute = () => {
    setProofPreview(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const togglePlayPause = () => {
    setProofPreview(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };



  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const videoTypes = ['mp4', 'webm', 'mov', 'avi'];
    
    if (imageTypes.includes(ext)) return 'image';
    if (videoTypes.includes(ext)) return 'video';
    return 'file';
  };

  // Advanced file handling functions
  const validateFile = (file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/mov', 'video/avi'
    ];
    
    // Reset validation state
    setFileValidation({
      isValid: true,
      error: '',
      size: file.size,
      type: file.type,
      dimensions: null
    });

    // Check file size
    if (file.size > maxSize) {
      setFileValidation(prev => ({
        ...prev,
        isValid: false,
        error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size of 50MB`
      }));
      return false;
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      setFileValidation(prev => ({
        ...prev,
        isValid: false,
        error: `File type "${file.type}" is not supported. Please upload an image (JPG, PNG, GIF, WebP) or video (MP4, WebM, MOV, AVI)`
      }));
      return false;
    }

    return true;
  };

  const createFilePreview = (file) => {
    if (!file) {
      setFilePreview(null);
      return;
    }

    setPreviewLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (file.type.startsWith('image/')) {
        // Create image preview with dimensions
        const img = new Image();
        img.onload = () => {
          setFilePreview({
            url: e.target.result,
            type: 'image',
            dimensions: { width: img.width, height: img.height }
          });
          setFileValidation(prev => ({
            ...prev,
            dimensions: { width: img.width, height: img.height }
          }));
          setPreviewLoading(false);
        };
        img.onerror = () => {
          setPreviewLoading(false);
        };
        img.src = e.target.result;
      } else if (file.type.startsWith('video/')) {
        // Create video preview
        setFilePreview({
          url: e.target.result,
          type: 'video'
        });
        setPreviewLoading(false);
      } else {
        // Generic file preview
        setFilePreview({
          url: null,
          type: 'file',
          name: file.name
        });
        setPreviewLoading(false);
      }
    };
    reader.onerror = () => {
      setPreviewLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setProofFile(null);
      setFilePreview(null);
      setFileValidation({
        isValid: true,
        error: '',
        size: 0,
        type: '',
        dimensions: null
      });
      return;
    }

    if (validateFile(file)) {
      setProofFile(file);
      createFilePreview(file);
    } else {
      setProofFile(null);
      setFilePreview(null);
      showError(fileValidation.error);
    }
  };

  const compressImage = async (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const optimizeFile = async (file) => {
    if (file.type.startsWith('image/') && file.size > 5 * 1024 * 1024) { // 5MB
      // Compress large images
      setOptimizationLoading(true);
      try {
        const compressedBlob = await compressImage(file);
        return new File([compressedBlob], file.name, { type: file.type });
      } finally {
        setOptimizationLoading(false);
      }
    }
    return file;
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return PhotoIcon;
    if (fileType.startsWith('video/')) return VideoCameraIcon;
    return DocumentIcon;
  };

  const getFileColor = (fileType) => {
    if (fileType.startsWith('image/')) return 'text-blue-400';
    if (fileType.startsWith('video/')) return 'text-purple-400';
    return 'text-neutral-400';
  };

  const handleGrade = async (starRating, targetId) => {
    if (starRating === grade) return; // Don't submit if same rating
    
    setGrading(true);
    setGradeError('');
    
    try {
      console.log('Sending grade:', starRating, 'to dare:', targetId);
      console.log('Dare object:', dare);
      console.log('Dare ID:', dare?._id);
      
      if (!targetId) {
        throw new Error('No dare ID provided for grading');
      }
      
      // Check if user already has a grade before submitting
      const hadExistingGrade = grades.find(g => g.user === user._id);
      
      const response = await retryApiCall(() => api.post(`/dares/${targetId}/grade`, { grade: starRating }));
      setGrade(starRating);
      
      // Show appropriate message based on whether it was an update or new rating
      if (hadExistingGrade) {
        showSuccess(`Updated rating to ${starRating} stars!`);
      } else {
        showSuccess(`Rated ${starRating} stars!`);
      }
      
      // Update grades from the response
      if (response.data && response.data.dare && response.data.dare.grades) {
        setGrades(response.data.dare.grades);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit grade.';
      setGradeError(errorMessage);
      showError(errorMessage);
    } finally {
      setGrading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <ContentContainer>
          <div className="max-w-2xl mx-auto space-y-8">
            <ListSkeleton count={5} />
          </div>
        </ContentContainer>
      </div>
    );
  }

  if (!dare) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <ContentContainer>
          <MainContent className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-neutral-600 to-neutral-700 p-4 rounded-2xl shadow-2xl shadow-neutral-500/25">
                  <ExclamationTriangleIcon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Dare Not Found</h1>
              <p className="text-xl sm:text-2xl text-neutral-300">
                This dare link is invalid or has expired
              </p>
            </div>

            {/* Error Details */}
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
              <div className="text-center space-y-6">
                <div className="text-neutral-400 text-lg">
                  This dare may have been:
                </div>
                <div className="space-y-3 text-left max-w-md mx-auto">
                  <div className="flex items-center gap-3 text-neutral-300">
                    <div className="w-2 h-2 bg-neutral-500 rounded-full"></div>
                    <span>Already claimed by someone else</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-300">
                    <div className="w-2 h-2 bg-neutral-500 rounded-full"></div>
                    <span>Removed by the creator</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-300">
                    <div className="w-2 h-2 bg-neutral-500 rounded-full"></div>
                    <span>Expired or invalid</span>
                  </div>
                </div>
                
                <div className="pt-6">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gradient-to-r from-neutral-600 to-neutral-700 text-white rounded-xl px-6 py-3 font-bold hover:from-neutral-700 hover:to-neutral-800 transition-all duration-200"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </MainContent>
        </ContentContainer>
      </div>
    );
  }

  // Check if dare is completed (has proof submitted)
  const isCompleted = dare.status === 'completed' && dare.proof;
  
  if (isCompleted) {
    // Show completed dare preview
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <ContentContainer>
          <MainContent className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-2xl shadow-2xl shadow-green-500/25">
                  <FireIcon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Dare Completed</h1>
              <p className="text-xl sm:text-2xl text-neutral-300">
                This dare has been completed successfully
              </p>
            </div>

            {/* Dare Details */}
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
              <div className="text-center mb-6">
                <div className="text-green-400 text-xl mb-4">The Dare</div>
                <DifficultyBadge level={dare.difficulty} />
              </div>
              
              <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/30 mb-6">
                <p className="text-white text-lg leading-relaxed">
                  {dare.description}
                </p>
              </div>

              {/* Enhanced Proof Preview */}
              {dare.proof && (
                <div className="bg-gradient-to-r from-green-900/20 to-green-800/10 rounded-xl p-6 border border-green-500/30 mb-6">
                  {/* Header with completion info */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
                        <FireIcon className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="text-green-400 text-lg font-semibold">Proof Submitted</div>
                        <div className="text-green-300 text-sm flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {dare.completedAt ? (
                            `${new Date(dare.completedAt).toLocaleDateString()} at ${new Date(dare.completedAt).toLocaleTimeString()}`
                          ) : dare.updatedAt ? (
                            `${new Date(dare.updatedAt).toLocaleDateString()} at ${new Date(dare.updatedAt).toLocaleTimeString()}`
                          ) : (
                            'Completion date not available'
                          )}
                        </div>
                      </div>
                    </div>
                    

                  </div>
                  
                  {/* Proof Text */}
                  {dare.proof.text && (
                    <div className="bg-gradient-to-r from-neutral-800/50 to-neutral-700/30 border border-neutral-600/30 rounded-xl p-4 mb-4 proof-content">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FireIcon className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white text-sm leading-relaxed">
                            {dare.proof.text}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Enhanced Proof File Preview */}
                  {dare.proof.fileUrl && (
                    <div className="bg-gradient-to-r from-neutral-800/50 to-neutral-700/30 border border-neutral-600/30 rounded-xl overflow-hidden proof-content">
                      {/* Screenshot Warning */}
                      <div className="bg-yellow-900/20 border-b border-yellow-500/30 p-3 text-center">
                        <div className="flex items-center justify-center gap-2 text-yellow-300 text-sm">
                          <ShieldCheckIcon className="w-4 h-4" />
                          <span>Hover over content to view - Screenshot protected</span>
                        </div>
                      </div>
                      {/* File Header */}
                      <div className="p-4 border-b border-neutral-700/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                              <FireIcon className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <div className="text-white font-semibold">
                                {dare.proof.fileName || 'Proof File'}
                              </div>
                              <div className="text-neutral-400 text-sm">
                                {getFileType(dare.proof.fileName || '') === 'image' ? 'Image' : 
                                 getFileType(dare.proof.fileName || '') === 'video' ? 'Video' : 'File'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                                                         <button
                               onClick={(e) => {
                                 e.preventDefault();
                                 e.stopPropagation();
                                 console.log('Fullscreen button clicked - using CSS toggle like debug button');
                                 
                                 // Use the same behavior as the debug toggle button
                                 setProofPreview(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
                               }}
                               disabled={fullscreenLoading}
                               className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                               title="Toggle fullscreen"
                             >
                               {fullscreenLoading ? (
                                 <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                               ) : (
                                 <ArrowsPointingOutIcon className="w-4 h-4" />
                               )}
                             </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* File Content */}
                      <div className="p-4">
                        {secureFileUrls[dare.proof.fileUrl] ? (
                          <div className={`${proofPreview.isFullscreen ? 'fixed inset-0 z-50 bg-black/95 flex items-center justify-center' : ''}`}>
                            {proofPreview.isFullscreen && (
                              <button
                                onClick={toggleFullscreen}
                                className="absolute top-4 right-4 p-2 bg-neutral-800/80 text-white rounded-lg hover:bg-neutral-700/80 transition-colors"
                              >
                                <EyeSlashIcon className="w-5 h-5" />
                              </button>
                            )}
                            
                                                         {dare.proof.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                               // Enhanced Image Preview
                               <div className="relative">
                                 <img 
                                   src={secureFileUrls[dare.proof.fileUrl]} 
                                   alt="Proof submission"
                                   className={`${proofPreview.isFullscreen ? 'max-h-screen max-w-screen object-contain' : 'max-w-full h-auto rounded-lg mx-auto max-h-96 object-contain'} transition-all duration-300`}
                                   onClick={async (e) => {
                                     console.log('Image clicked, current fullscreen state:', proofPreview.isFullscreen);
                                     // Use the same behavior as the debug toggle button
                                     setProofPreview(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
                                   }}
                                   onDragStart={(e) => e.preventDefault()}
                                   onContextMenu={(e) => e.preventDefault()}
                                   style={{ cursor: 'pointer' }}
                                 />
                                 {!proofPreview.isFullscreen && (
                                   <div 
                                     className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 pointer-events-none"
                                   >
                                     <div className="bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                                       Click to expand
                                     </div>
                                   </div>
                                 )}
                                 

                               </div>
                            ) : dare.proof.fileUrl.match(/\.(mp4|webm|mov|avi)$/i) ? (
                              // Enhanced Video Preview
                              <div className="relative">
                                <video 
                                  ref={(el) => {
                                    if (el) {
                                      el.muted = proofPreview.isMuted;
                                      if (proofPreview.isPlaying) {
                                        el.play();
                                      } else {
                                        el.pause();
                                      }
                                    }
                                  }}
                                  className={`${proofPreview.isFullscreen ? 'max-h-screen max-w-screen' : 'max-w-full h-auto rounded-lg mx-auto max-h-96'} transition-all duration-300`}
                                  preload="metadata"
                                  onPlay={() => setProofPreview(prev => ({ ...prev, isPlaying: true }))}
                                  onPause={() => setProofPreview(prev => ({ ...prev, isPlaying: false }))}
                                  onDragStart={(e) => e.preventDefault()}
                                  onContextMenu={(e) => e.preventDefault()}
                                >
                                  <source src={secureFileUrls[dare.proof.fileUrl]} type="video/mp4" />
                                  <source src={secureFileUrls[dare.proof.fileUrl]} type="video/webm" />
                                  <source src={secureFileUrls[dare.proof.fileUrl]} type="video/mov" />
                                  Your browser does not support the video tag.
                                </video>
                                
                                {/* Custom Video Controls */}
                                {!proofPreview.isFullscreen && (
                                  <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
                                    <button
                                      onClick={togglePlayPause}
                                      className="p-1 text-white hover:text-green-400 transition-colors"
                                      title={proofPreview.isPlaying ? 'Pause' : 'Play'}
                                    >
                                      {proofPreview.isPlaying ? (
                                        <PauseIcon className="w-4 h-4" />
                                      ) : (
                                        <PlayIcon className="w-4 h-4" />
                                      )}
                                    </button>
                                    <button
                                      onClick={toggleMute}
                                      className="p-1 text-white hover:text-green-400 transition-colors"
                                      title={proofPreview.isMuted ? 'Unmute' : 'Mute'}
                                    >
                                      {proofPreview.isMuted ? (
                                        <SpeakerXMarkIcon className="w-4 h-4" />
                                      ) : (
                                        <SpeakerWaveIcon className="w-4 h-4" />
                                      )}
                                    </button>
                                                                         <button
                                       onClick={(e) => {
                                         e.preventDefault();
                                         e.stopPropagation();
                                         console.log('Video fullscreen button clicked - using CSS toggle like debug button');
                                         
                                         // Use the same behavior as the debug toggle button
                                         setProofPreview(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
                                       }}
                                       disabled={fullscreenLoading}
                                       className="p-1 text-white hover:text-green-400 transition-colors ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                       title="Fullscreen"
                                     >
                                       {fullscreenLoading ? (
                                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                       ) : (
                                         <ArrowsPointingOutIcon className="w-4 h-4" />
                                       )}
                                     </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              // Generic file info with enhanced styling
                              <div className="text-center p-6">
                                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <FireIcon className="w-8 h-8 text-green-400" />
                                </div>
                                <div className="text-white font-semibold mb-1">
                                  {dare.proof.fileName || 'Proof file uploaded'}
                                </div>
                                <div className="text-neutral-400 text-sm mb-3">
                                  File uploaded successfully
                                </div>

                              </div>
                            )}
                          </div>
                        ) : (
                          // Loading state with enhanced styling
                          <div className="text-center p-8">
                            <div className="w-16 h-16 bg-neutral-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                              {fileLoading ? (
                                <div className="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <FireIcon className="w-8 h-8 text-neutral-400" />
                              )}
                            </div>
                            <div className="text-neutral-400 text-sm font-semibold mb-2">
                              {fileLoading ? 'Securely Loading Proof' : 'Securely Loading Proof'}
                            </div>
                            <div className="text-neutral-500 text-xs">
                              {fileLoading ? 'Verifying access permissions...' : 'Verifying access permissions...'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Grades */}
              {dare.grades && dare.grades.length > 0 && (
                <div className="bg-yellow-900/20 rounded-xl p-6 border border-yellow-500/30">
                  <div className="text-center mb-4">
                    <div className="text-yellow-400 text-lg font-semibold mb-2">Rating</div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`p-2 rounded-lg ${
                          dare.grades.some(g => g.grade >= star) 
                            ? 'text-yellow-400' 
                            : 'text-neutral-400'
                        }`}
                      >
                        <StarIcon className="w-6 h-6" />
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-2 text-sm text-neutral-300">
                    Average rating: {dare.grades.reduce((sum, g) => sum + g.grade, 0) / dare.grades.length} stars
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="text-center pt-6">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl px-6 py-3 font-bold hover:from-green-700 hover:to-green-800 transition-all duration-200"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </MainContent>
        </ContentContainer>
      </div>
    );
  }

  if (submitted) {
    // For dom demands, show the actual demand after consent
    if (dare.dareType === 'domination' && dare.requiresConsent) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
          <ContentContainer>
            <MainContent className="max-w-2xl mx-auto space-y-8">
              {/* Header */}
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-2xl shadow-2xl shadow-red-500/25">
                    <ShieldCheckIcon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Dom Demand Revealed</h1>
                <p className="text-xl sm:text-2xl text-neutral-300">
                  You have consented. Here is the actual demand:
                </p>
              </div>

              {/* Revealed Demand */}
              <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 rounded-2xl p-8 border border-red-800/30 shadow-xl">
                <div className="text-center mb-6">
                  <div className="text-red-400 text-xl mb-4">The Dom's Demand</div>
                  <DifficultyBadge level={dare.difficulty} />
                </div>
                
                <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/30 mb-6">
                  <p className="text-white text-lg leading-relaxed">
                    {dare.description}
                  </p>
                </div>

                {/* Dom Information */}
                {dare.creator && (
                  <div className="bg-neutral-800/30 rounded-xl p-6 border border-neutral-700/30 mb-6">
                    <div className="text-center mb-4">
                      <div className="text-red-400 text-lg font-semibold mb-2">Demand Created By</div>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        {dare.creator.avatar ? (
                          <img 
                            src={dare.creator.avatar} 
                            alt={`${dare.creator.fullName || dare.creator.username} avatar`}
                            className="w-12 h-12 rounded-full border-2 border-red-500/30"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center border-2 border-red-500/30">
                            <span className="text-white font-bold text-lg">
                              {(dare.creator.fullName || dare.creator.username || 'D').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-white font-semibold text-lg">
                            {dare.creator.fullName || dare.creator.username}
                          </div>
                          <div className="text-neutral-400 text-sm">
                            Dom • {dare.creator.daresCreated || 0} dares created
                          </div>
                        </div>
                      </div>
                      
                      {/* Block Button */}
                      <div className="mt-4">
                        <button
                          onClick={(e) => {
                            console.log('Button clicked! Event:', e);
                            e.preventDefault();
                            e.stopPropagation();
                            handleBlockDom();
                          }}
                          disabled={blocking}
                          className="bg-gradient-to-r from-red-800 to-red-900 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:from-red-900 hover:to-red-950 transition-all duration-200 flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {blocking ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Blocking...
                            </>
                          ) : (
                            <>
                              <NoSymbolIcon className="w-4 h-4" />
                              Block Dom
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {dare.creator.gender && (
                        <div>
                          <span className="text-neutral-400">Gender:</span>
                          <span className="ml-2 text-white capitalize">{dare.creator.gender}</span>
                        </div>
                      )}
                      {dare.creator.age && (
                        <div>
                          <span className="text-neutral-400">Age:</span>
                          <span className="ml-2 text-white">{dare.creator.age}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-neutral-400">Dares performed:</span>
                        <span className="ml-2 text-white">{dare.creator.daresPerformed || 0} completed</span>
                      </div>
                      <div>
                        <span className="text-neutral-400">Average grade:</span>
                        <span className="ml-2 text-white">
                          {dare.creator.avgGrade ? `${dare.creator.avgGrade.toFixed(1)}` : 'No grades yet'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <p className="text-neutral-300 text-sm">
                    You have consented to perform this demand. The dom will be notified.
                  </p>
                </div>



                {/* Proof Submission */}
                <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-6">Submit Proof</h3>
                  
                  <form onSubmit={handleProofSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="proof-text" className="block font-semibold mb-2 text-white">Proof Description (Optional)</label>
                      <textarea
                        id="proof-text"
                        value={proof}
                        onChange={(e) => setProof(e.target.value)}
                        className="w-full h-32 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 resize-none"
                        placeholder="Describe how you completed the dare... (optional)"
                      />
                    </div>

                    <div>
                      <label htmlFor="proof-file" className="block font-semibold mb-2 text-white">Proof File (Required)</label>
                      
                      {/* Mobile Upload Options */}
                      {isMobile && (
                        <div className="mb-4">
                          <div className="text-sm text-neutral-400 mb-3">Quick Upload Options:</div>
                          <div className="flex gap-3">
                            {supportsCamera && (
                              <button
                                type="button"
                                onClick={handleCameraUpload}
                                disabled={previewLoading || optimizationLoading}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl px-4 py-3 font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {previewLoading || optimizationLoading ? (
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <CameraIcon className="w-5 h-5" />
                                )}
                                {previewLoading || optimizationLoading ? 'Processing...' : 'Camera'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={handleGalleryUpload}
                              disabled={previewLoading || optimizationLoading}
                              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl px-4 py-3 font-semibold hover:from-purple-700 hover:from-purple-800 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {previewLoading || optimizationLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <PhotoIcon className="w-5 h-5" />
                              )}
                              {previewLoading || optimizationLoading ? 'Processing...' : 'Gallery'}
                            </button>
                          </div>
                        </div>
                      )}
                      
                              {/* Advanced File Preview */}
        {proofFile && (
          <div className="mb-4 bg-gradient-to-r from-neutral-800/50 to-neutral-700/30 rounded-xl border border-neutral-600/30 overflow-hidden proof-content">
            {/* Screenshot Warning */}
            <div className="bg-yellow-900/20 border-b border-yellow-500/30 p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-yellow-300 text-sm">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>Hover over content to view - Screenshot protected</span>
              </div>
            </div>
            {/* File Header */}
            <div className="p-4 border-b border-neutral-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getFileColor(proofFile.type)}`}>
                    {React.createElement(getFileIcon(proofFile.type), { className: "w-5 h-5" })}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{proofFile.name}</div>
                    <div className="text-neutral-400 text-sm">
                      {formatFileSize(proofFile.size)}
                      {fileValidation.dimensions && (
                        <span className="ml-2">
                          • {fileValidation.dimensions.width}×{fileValidation.dimensions.height}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {fileValidation.isValid && (
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                      <CheckIcon className="w-4 h-4" />
                      <span>Valid</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setProofFile(null);
                      setFilePreview(null);
                      setFileValidation({
                        isValid: true,
                        error: '',
                        size: 0,
                        type: '',
                        dimensions: null
                      });
                    }}
                    className="text-red-400 hover:text-red-300 p-1 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Remove file"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* File Preview Content */}
            {filePreview && (
              <div className="p-4">
                {filePreview.type === 'image' && filePreview.url && (
                  <div className="relative">
                    <img 
                      src={filePreview.url} 
                      alt="File preview"
                      className="max-w-full h-auto rounded-lg mx-auto max-h-48 object-contain"
                      onDragStart={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      {fileValidation.dimensions?.width}×{fileValidation.dimensions?.height}
                    </div>
                  </div>
                )}
                {filePreview.type === 'video' && filePreview.url && (
                  <div className="relative">
                    <video 
                      src={filePreview.url}
                      className="max-w-full h-auto rounded-lg mx-auto max-h-48"
                      preload="metadata"
                      muted
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                      <PlayIcon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
                {filePreview.type === 'file' && (
                  <div className="text-center p-4">
                    <DocumentIcon className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">{filePreview.name}</div>
                    <div className="text-neutral-400 text-sm">File ready for upload</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* File Validation Error */}
        {!fileValidation.isValid && fileValidation.error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <ExclamationCircleIcon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-red-300 text-sm">
                {fileValidation.error}
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {proofLoading && uploadProgress > 0 && (
          <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-blue-300 text-sm font-semibold">Uploading proof...</div>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="text-blue-300 text-xs mt-1">{uploadProgress}% complete</div>
          </div>
        )}

        {/* File Upload Guidelines */}
        <div className="mb-4 p-4 bg-neutral-800/30 border border-neutral-700/30 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <DocumentIcon className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold mb-2">Upload Guidelines</div>
              <div className="text-neutral-300 text-sm space-y-1">
                <div>• <strong>Supported formats:</strong> JPG, PNG, GIF, WebP, MP4, WebM, MOV, AVI</div>
                <div>• <strong>Maximum size:</strong> 50MB per file</div>
                <div>• <strong>Image dimensions:</strong> Will be automatically optimized if larger than 1920×1080</div>
                <div>• <strong>Video length:</strong> No specific limit, but larger files take longer to upload</div>
              </div>
            </div>
          </div>
        </div>
                      
                      {/* Standard File Input */}
                      <div className="relative">
                        <input
                          type="file"
                          id="proof-file"
                          onChange={handleFileChange}
                          disabled={previewLoading || optimizationLoading}
                          className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          accept="image/*,video/*"
                          required
                        />
                        {(previewLoading || optimizationLoading) && (
                          <div className="absolute inset-0 bg-neutral-800/80 rounded-xl flex items-center justify-center">
                            <div className="flex items-center gap-2 text-neutral-300">
                              <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                              {previewLoading ? 'Processing file...' : 'Optimizing file...'}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400 mt-2">
                        Supported: Images (JPG, PNG, GIF) and Videos (MP4, WebM, MOV)
                      </div>
                    </div>

                    {/* OSA-Style Content Expiration Settings */}
                    <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 rounded-2xl p-6 shadow-xl">
                      <div className="flex items-start gap-4 mb-4">
                        <ClockIcon className="w-8 h-8 text-yellow-400 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">Content Privacy</h3>
                          <p className="text-neutral-300 leading-relaxed">
                            Choose how long this proof content should be available. This helps protect your privacy and ensures content doesn't persist indefinitely.
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {PRIVACY_OPTIONS.map((option) => (
                          <label key={option.value} className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                            contentDeletion === option.value 
                              ? 'border-yellow-500 bg-yellow-500/10' 
                              : 'border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/50'
                          }`}>
                            <input 
                              type="radio" 
                              name="contentDeletion" 
                              value={option.value} 
                              checked={contentDeletion === option.value} 
                              onChange={(e) => updateContentDeletion(e.target.value)} 
                              className="w-5 h-5 text-yellow-600 bg-neutral-700 border-neutral-600 rounded-full focus:ring-yellow-500 focus:ring-2" 
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{option.icon}</span>
                                <span className="font-semibold text-white">{option.label}</span>
                              </div>
                              <p className="text-sm text-neutral-300">{option.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Grading Section */}
                    {dare && dare._id && (
                      <div className="space-y-6">
                        <div>
                          <label className="block font-semibold mb-4 text-white">Rate This Dare (1-5 Stars)</label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => {
                                  console.log('Star clicked:', star);
                                  console.log('Dare ID being passed:', dare._id);
                                  handleGrade(star, dare._id);
                                }}
                                disabled={grading}
                                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  star <= grade 
                                    ? 'text-yellow-400 bg-yellow-400/10' 
                                    : 'text-neutral-400 hover:text-yellow-400'
                                }`}
                              >
                                <StarIcon className="w-8 h-8" />
                              </button>
                            ))}
                          </div>
                          {grade > 0 && (
                            <div className="mt-2 text-sm text-neutral-300">
                              {grades.find(g => g.user === user?._id) ? 
                                `Your rating: ${grade} star${grade > 1 ? 's' : ''}` :
                                `You rated this dare ${grade} star${grade > 1 ? 's' : ''}`
                              } (Debug: grade={grade})
                            </div>
                          )}
                        </div>

                        {gradeError && (
                          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-300">
                            {gradeError}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        type="submit"
                        disabled={proofLoading || !proofFile}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl px-6 py-3 font-bold hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {proofLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <FireIcon className="w-5 h-5" />
                            Submit Proof
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleChickenOut}
                        disabled={chickenOutLoading}
                        className="flex-1 bg-gradient-to-r from-neutral-600 to-neutral-700 text-white rounded-xl px-6 py-3 font-bold hover:from-neutral-700 hover:to-neutral-800 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {chickenOutLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Declining...
                          </>
                        ) : (
                          <>
                            <ExclamationTriangleIcon className="w-5 h-5" />
                            Chicken Out
                          </>
                        )}
                      </button>
                    </div>

                    {/* Error/Success Messages */}
                    {proofError && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-300">
                        {proofError}
                      </div>
                    )}
                    {proofSuccess && (
                      <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 text-green-300">
                        {proofSuccess}
                      </div>
                    )}
                    {chickenOutError && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-300">
                        {chickenOutError}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </MainContent>
          </ContentContainer>
        </div>
      );
    }

    // For regular dares, show the standard thank you message
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <ContentContainer>
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-2xl p-8 border border-green-800/30 shadow-xl text-center">
              <div className="text-green-400 text-xl mb-4">Thank You!</div>
              <p className="text-green-300 text-sm">
                You have consented to perform this dare.
              </p>
            </div>
          </div>
        </ContentContainer>
      </div>
    );
  }

  const creator = dare.creator;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <style>
        {`
          .proof-content {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
            pointer-events: auto;
            position: relative;
            transition: all 0.3s ease;
          }
          
          .proof-content img,
          .proof-content video {
            -webkit-user-drag: none;
            -khtml-user-drag: none;
            -moz-user-drag: none;
            -o-user-drag: none;
            user-drag: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            transition: all 0.3s ease;
          }
          
          .proof-content::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: transparent;
            z-index: 1;
            pointer-events: none;
            transition: all 0.3s ease;
          }
          
          /* Always-on screenshot protection */
          .proof-content {
            position: relative !important;
            overflow: hidden !important;
          }
          
          .proof-content::before {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background: rgba(0, 0, 0, 0.95) !important;
            z-index: 9999 !important;
            pointer-events: none !important;
            opacity: 0 !important;
            transition: opacity 0.3s ease !important;
          }
          
          .proof-content:hover::before {
            opacity: 0 !important;
          }
          
          .proof-content:not(:hover)::before {
            opacity: 0.95 !important;
          }
          
          /* Make content semi-transparent by default */
          .proof-content img,
          .proof-content video {
            opacity: 0.3 !important;
            filter: brightness(0.3) !important;
            transition: all 0.3s ease !important;
          }
          
          .proof-content:hover img,
          .proof-content:hover video {
            opacity: 1 !important;
            filter: brightness(1) !important;
          }
          
          /* Text content protection */
          .proof-content .text-content {
            opacity: 0.3 !important;
            transition: opacity 0.3s ease !important;
          }
          
          .proof-content:hover .text-content {
            opacity: 1 !important;
          }
          
          /* Warning overlay */
          .proof-content::after {
            content: 'HOVER TO VIEW - SCREENSHOT PROTECTED' !important;
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            background: rgba(0, 0, 0, 0.9) !important;
            color: #fff !important;
            padding: 15px 20px !important;
            font-size: 16px !important;
            font-weight: bold !important;
            z-index: 10000 !important;
            border: 2px solid #fff !important;
            text-align: center !important;
            white-space: nowrap !important;
            opacity: 1 !important;
            transition: opacity 0.3s ease !important;
          }
          
          .proof-content:hover::after {
            opacity: 0 !important;
          }
        `}
      </style>
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <MainContent className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                <UserPlusIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {creator?.fullName || creator?.username || 'Someone'} wants you to perform
            </h1>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              One Submissive Act
            </h2>
          </div>

          {/* Dom Information Table - OSA Style */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <tbody className="space-y-4">
                  <tr className="border-b border-neutral-700/30 pb-4">
                    <td className="py-2 text-neutral-400 font-semibold w-1/3">Name</td>
                    <td className="py-2 text-white font-semibold">
                      {creator?.fullName || creator?.username || 'Anonymous'}
                    </td>
                  </tr>
                  {creator?.gender && (
                    <tr className="border-b border-neutral-700/30 pb-4">
                      <td className="py-2 text-neutral-400 font-semibold w-1/3">Gender</td>
                      <td className="py-2 text-white capitalize">{creator.gender}</td>
                    </tr>
                  )}
                  {creator?.age && (
                    <tr className="border-b border-neutral-700/30 pb-4">
                      <td className="py-2 text-neutral-400 font-semibold w-1/3">Age</td>
                      <td className="py-2 text-white">{creator.age} years old</td>
                    </tr>
                  )}
                  <tr className="border-b border-neutral-700/30 pb-4">
                    <td className="py-2 text-neutral-400 font-semibold w-1/3">Submissive Acts</td>
                    <td className="py-2 text-white">
                      {creator?.daresPerformed || 0} of {creator?.daresPerformed || 0} completed 
                      {creator?.avgGrade ? ` ${Math.round(creator.avgGrade * 20)}% ${creator.avgGrade >= 4.5 ? 'A' : creator.avgGrade >= 3.5 ? 'B' : creator.avgGrade >= 2.5 ? 'C' : 'D'}` : ''}
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-700/30 pb-4">
                    <td className="py-2 text-neutral-400 font-semibold w-1/3">Dominant Acts</td>
                    <td className="py-2 text-white">{creator?.daresCreated || 0}</td>
                  </tr>
                  {creator?.hardLimits && creator.hardLimits.length > 0 && (
                    <tr className="border-b border-neutral-700/30 pb-4">
                      <td className="py-2 text-neutral-400 font-semibold w-1/3">Hard Limits</td>
                      <td className="py-2 text-white">{creator.hardLimits.join(' ')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Consent Question */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl text-center">
            <h3 className="text-2xl font-bold text-white mb-6">
              Will you agree to perform their demand?
            </h3>
          </div>

          {/* Catch Warning */}
          <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 rounded-2xl p-6 shadow-xl">
            <div className="text-center">
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Of course, there's a catch.</h3>
              <p className="text-yellow-300 text-lg">
                We'll only tell you what you have to do once you consent. :)
              </p>
            </div>
          </div>

          {/* Difficulty Information */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            <div className="text-center mb-6">
              <p className="text-neutral-300 text-lg mb-4">
                This dare might describe any act up to or including the following difficulty level:
              </p>
              <div className="flex items-center justify-center gap-4 mb-4">
                <DifficultyBadge level={dare.difficulty} />
              </div>
            </div>
            
            {DIFFICULTY_OPTIONS.find(d => d.value === dare.difficulty) && (
              <div className="text-center">
                <p className="text-neutral-300 leading-relaxed">
                  {DIFFICULTY_OPTIONS.find(d => d.value === dare.difficulty).desc}
                </p>
              </div>
            )}
          </div>



            {/* Consent Button */}
            <div className="mt-8 text-center">
              <Button
                onClick={handleConsent}
                disabled={claiming}
                variant="primary"
                size="lg"
                className="mx-auto"
              >
                {claiming ? (
                  <>
                    <ButtonLoading />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-6 h-6" />
                    I Consent
                  </>
                )}
              </Button>
            </div>
        </MainContent>
      </ContentContainer>
    </div>
  );
} 