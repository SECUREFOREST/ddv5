import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  MegaphoneIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  GlobeAltIcon,
  SparklesIcon,
  FireIcon,
  PlayIcon,
  TrophyIcon,
  ClockIcon,
  EyeIcon,
  BoltIcon,
  StarIcon,
  CogIcon,
  BellIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  HeartIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CalendarIcon,
  TagIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const ModernAdvertise = () => {
  const navigate = useNavigate();

  const advertisingOptions = [
    {
      icon: GlobeAltIcon,
      title: "Banner Advertising",
      description: "Prominent banner placements across the platform",
      price: "From $50/day",
      features: ["High visibility", "Targeted audience", "Real-time analytics", "Custom creative"],
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-500/30"
    },
    {
      icon: UserGroupIcon,
      title: "Sponsored Dares",
      description: "Feature your brand through sponsored challenges",
      price: "From $100/day",
      features: ["Brand integration", "User engagement", "Viral potential", "Custom themes"],
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30"
    },
    {
      icon: ChartBarIcon,
      title: "Analytics & Insights",
      description: "Detailed performance metrics and audience data",
      price: "From $25/day",
      features: ["Demographic data", "Engagement metrics", "ROI tracking", "Custom reports"],
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500/30"
    }
  ];

  const benefits = [
    {
      icon: SparklesIcon,
      title: "Engaged Audience",
      description: "Connect with users who actively participate in challenges and dares",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: UserGroupIcon,
      title: "Targeted Demographics",
      description: "Reach specific age groups and interests within our community",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: ChartBarIcon,
      title: "Viral Potential",
      description: "Leverage our challenge-based platform for organic brand exposure",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: GlobeAltIcon,
      title: "Global Reach",
      description: "Access users from around the world in our diverse community",
      color: "from-green-500 to-green-600"
    }
  ];

  const platformStats = [
    {
      icon: UsersIcon,
      value: "10K+",
      label: "Active Users",
      color: "from-primary to-primary-dark",
      bgColor: "bg-primary/20",
      borderColor: "border-primary/30"
    },
    {
      icon: TrophyIcon,
      value: "50K+",
      label: "Dares Completed",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30"
    },
    {
      icon: ArrowTrendingUpIcon,
      value: "95%",
      label: "Engagement Rate",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500/30"
    },
    {
      icon: ClockIcon,
      value: "24/7",
      label: "Active Platform",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-500/30"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border-b border-neutral-700/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Advertising</h1>
                <p className="text-neutral-400 text-sm">Promote your brand</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <MegaphoneIcon className="w-4 h-4" />
                  <span>Business</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <MegaphoneIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
                Advertise with{" "}
                <span className="bg-gradient-to-r from-primary via-red-500 to-pink-500 bg-clip-text text-transparent">
                  Deviant Dare
                </span>
              </h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Reach engaged users through our challenge-based platform. 
                Connect with a community that loves taking risks and trying new things.
              </p>
            </div>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {platformStats.map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <div key={index} className={`${stat.bgColor} backdrop-blur-sm rounded-2xl border ${stat.borderColor} p-6 text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
                <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl inline-block mb-4`}>
                  <StatIcon className="w-8 h-8 text-white" />
                </div>
                <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <div className="text-sm text-neutral-300">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Advertising Options */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Advertising Options
            </h3>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Choose from our range of advertising solutions designed to maximize your brand's impact
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {advertisingOptions.map((option, index) => {
              const OptionIcon = option.icon;
              return (
                <div 
                  key={index}
                  className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
                >
                  <div className="text-center mb-6">
                    <div className={`p-4 ${option.bgColor} rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <OptionIcon className={`w-8 h-8 bg-gradient-to-r ${option.color} bg-clip-text text-transparent`} />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">{option.title}</h4>
                    <p className="text-neutral-300 mb-4">{option.description}</p>
                    <div className={`text-2xl font-bold bg-gradient-to-r ${option.color} bg-clip-text text-transparent mb-6`}>
                      {option.price}
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {option.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3 text-neutral-300">
                        <div className={`w-2 h-2 bg-gradient-to-r ${option.color} rounded-full`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <button className={`w-full bg-gradient-to-r ${option.color} text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl`}>
                    Get Started
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Advertise with Us?
            </h3>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Discover the unique advantages of advertising on our challenge-based platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <div 
                  key={index}
                  className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 bg-gradient-to-r ${benefit.color} rounded-xl`}>
                      <BenefitIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">{benefit.title}</h4>
                      <p className="text-neutral-300 leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-primary/20 to-primary-dark/20 backdrop-blur-sm border border-primary/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h3>
          <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
            Contact our advertising team to discuss custom campaigns, 
            pricing, and how we can help you reach our engaged community.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center justify-center gap-3 text-neutral-300">
              <EnvelopeIcon className="w-5 h-5 text-primary" />
              <span>advertising@deviantdare.com</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-neutral-300">
              <PhoneIcon className="w-5 h-5 text-primary" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-neutral-300">
              <MapPinIcon className="w-5 h-5 text-primary" />
              <span>Available Worldwide</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:advertising@deviantdare.com" 
              className="w-full sm:w-auto inline-block"
            >
              <button className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-8 py-4 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center">
                <EnvelopeIcon className="w-5 h-5" />
                Contact Us
              </button>
            </a>
            <Link to="/modern/news" className="w-full sm:w-auto inline-block">
              <button className="w-full sm:w-auto bg-neutral-700/50 text-neutral-300 border border-neutral-600/50 rounded-xl px-8 py-4 font-bold transition-all duration-200 hover:bg-neutral-600/50 flex items-center gap-2 justify-center">
                <BookOpenIcon className="w-5 h-5" />
                Learn More
              </button>
            </Link>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheckIcon className="w-6 h-6 text-green-400" />
              Advertising Guidelines
            </h4>
            <p className="text-neutral-300 text-sm leading-relaxed">
              All advertisements must comply with our community guidelines. 
              We reserve the right to reject any ad that doesn't align with our values of consent, safety, and respect.
            </p>
          </div>
          
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6 text-blue-400" />
              Performance Metrics
            </h4>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Track your campaign performance with real-time analytics, 
              engagement metrics, and detailed audience insights to optimize your ROI.
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8">
            <p className="text-neutral-400 text-sm max-w-4xl mx-auto">
              <strong>Ready to grow your brand?</strong> Join the hundreds of businesses already advertising on Deviant Dare. 
              Our team is here to help you create campaigns that resonate with our engaged community.
            </p>
            <div className="mt-6 flex justify-center">
              <button className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg">
                Start Your Campaign
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAdvertise; 