import React from 'react';
import { Link } from 'react-router-dom';
import { MegaphoneIcon, CurrencyDollarIcon, ChartBarIcon, UserGroupIcon, GlobeAltIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { Helmet } from 'react-helmet';
import Button from '../components/Button';
import { MainContent, ContentContainer } from '../components/Layout';

export default function Advertise() {
  const advertisingOptions = [
    {
      icon: <GlobeAltIcon className="w-8 h-8 text-blue-500" />,
      title: "Banner Advertising",
      description: "Prominent banner placements across the platform",
      price: "From $50/day",
      features: ["High visibility", "Targeted audience", "Real-time analytics", "Custom creative"]
    },
    {
      icon: <UserGroupIcon className="w-8 h-8 text-green-500" />,
      title: "Sponsored Dares",
      description: "Feature your brand through sponsored challenges",
      price: "From $100/day",
      features: ["Brand integration", "User engagement", "Viral potential", "Custom themes"]
    },
    {
      icon: <ChartBarIcon className="w-8 h-8 text-purple-500" />,
      title: "Analytics & Insights",
      description: "Detailed performance metrics and audience data",
      price: "From $25/day",
      features: ["Demographic data", "Engagement metrics", "ROI tracking", "Custom reports"]
    }
  ];

  const benefits = [
    {
      icon: <SparklesIcon className="w-6 h-6 text-primary" />,
      title: "Engaged Audience",
      description: "Connect with users who actively participate in challenges and dares"
    },
    {
      icon: <UserGroupIcon className="w-6 h-6 text-primary" />,
      title: "Targeted Demographics",
      description: "Reach specific age groups and interests within our community"
    },
    {
      icon: <ChartBarIcon className="w-6 h-6 text-primary" />,
      title: "Viral Potential",
      description: "Leverage our challenge-based platform for organic brand exposure"
    },
    {
      icon: <GlobeAltIcon className="w-6 h-6 text-primary" />,
      title: "Global Reach",
      description: "Access users from around the world in our diverse community"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <Helmet>
        <title>Advertise | Deviant Dare</title>
        <meta name="description" content="Advertise your brand on Deviant Dare - reach engaged users through banner ads, sponsored dares, and targeted campaigns." />
        <meta property="og:title" content="Advertise | Deviant Dare" />
        <meta property="og:description" content="Advertise your brand on Deviant Dare - reach engaged users through banner ads, sponsored dares, and targeted campaigns." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://deviantdare.com/advertise" />
        <meta property="og:image" content="/logo.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Advertise | Deviant Dare" />
        <meta name="twitter:description" content="Advertise your brand on Deviant Dare - reach engaged users through banner ads, sponsored dares, and targeted campaigns." />
        <meta name="twitter:image" content="/logo.svg" />
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <main id="main-content" tabIndex="-1" role="main" className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                <MegaphoneIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Advertise with{" "}
              <span className="bg-gradient-to-r from-primary via-red-500 to-pink-500 bg-clip-text text-transparent">
                Deviant Dare
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-neutral-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Reach engaged users through our challenge-based platform. 
              Connect with a community that loves taking risks and trying new things.
            </p>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-gradient-to-r from-primary/20 to-primary-dark/20 rounded-xl p-6 border border-primary/30 text-center">
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-sm text-primary-300">Active Users</div>
            </div>
            <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 rounded-xl p-6 border border-green-600/30 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">50K+</div>
              <div className="text-sm text-green-300">Dares Completed</div>
            </div>
            <div className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 rounded-xl p-6 border border-purple-600/30 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">95%</div>
              <div className="text-sm text-purple-300">Engagement Rate</div>
            </div>
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-xl p-6 border border-blue-600/30 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
              <div className="text-sm text-blue-300">Active Platform</div>
            </div>
          </div>

          {/* Advertising Options */}
          <div className="mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
              Advertising Options
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {advertisingOptions.map((option, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="text-center mb-6">
                    <div className="p-4 bg-neutral-800/50 rounded-2xl inline-block mb-4">
                      {option.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{option.title}</h3>
                    <p className="text-neutral-300 mb-4">{option.description}</p>
                    <div className="text-2xl font-bold text-primary mb-6">{option.price}</div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {option.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3 text-neutral-300">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button variant="primary" className="w-full">
                    Get Started
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
              Why Advertise with Us?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-neutral-800/50 rounded-xl">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                      <p className="text-neutral-300 leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-r from-primary/20 to-primary-dark/20 border border-primary/30 rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
              Contact our advertising team to discuss custom campaigns, 
              pricing, and how we can help you reach our engaged community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:advertising@deviantdare.com" 
                className="w-full sm:w-auto inline-block"
              >
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Contact Us
                </Button>
              </a>
              <Link to="/news" className="w-full sm:w-auto inline-block">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-16 text-center">
            <p className="text-neutral-500 text-sm max-w-4xl mx-auto">
              <strong>Advertising Guidelines:</strong> All advertisements must comply with our community guidelines. 
              We reserve the right to reject any ad that doesn't align with our values of consent, safety, and respect.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
} 