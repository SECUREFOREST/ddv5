import React from 'react';
import { 
  MobileText, 
  MobileCard, 
  MobileList, 
  MobileForm,
  MobileContainer,
  MobileSpacing 
} from './MobileContentOptimizer';
import { useIsMobile, useIsSmallMobile } from '../hooks/useMediaQuery';

/**
 * Example component demonstrating mobile content optimization
 * Shows how to implement the mobile content strategy in practice
 */
export default function MobileContentExample() {
  const isMobile = useIsMobile();
  const isSmallMobile = useIsSmallMobile();

  return (
    <MobileContainer size="default" padding="default">
      <MobileSpacing size="default">
        
        {/* Page Header */}
        <MobileText variant="heading" size="3xl" weight="bold">
          Dare Challenge Platform
        </MobileText>
        
        <MobileText variant="body" size="lg">
          Experience the ultimate platform for creating, performing, and sharing dares online.
        </MobileText>

        {/* Feature Cards */}
        <MobileSpacing size="lg">
          <MobileText variant="heading" size="xl" weight="semibold">
            Featured Dares
          </MobileText>
          
          <MobileList variant="grouped" spacing="default">
            <MobileCard variant="interactive" padding="spacious">
              <MobileSpacing size="sm">
                <MobileText variant="heading" size="lg" weight="semibold">
                  Adventure Seeker
                </MobileText>
                <MobileText variant="body" size="base">
                  Complete a daring outdoor challenge and share your experience with the community.
                </MobileText>
                <MobileText variant="caption" size="sm">
                  Difficulty: Hard • Participants: 15
                </MobileText>
              </MobileSpacing>
            </MobileCard>

            <MobileCard variant="interactive" padding="spacious">
              <MobileSpacing size="sm">
                <MobileText variant="heading" size="lg" weight="semibold">
                  Creative Expression
                </MobileText>
                <MobileText variant="body" size="base">
                  Create an artistic piece based on a random prompt within 24 hours.
                </MobileText>
                <MobileText variant="caption" size="sm">
                  Difficulty: Medium • Participants: 28
                </MobileText>
              </MobileSpacing>
            </MobileCard>

            <MobileCard variant="interactive" padding="spacious">
              <MobileSpacing size="sm">
                <MobileText variant="heading" size="lg" weight="semibold">
                  Fitness Challenge
                </MobileText>
                <MobileText variant="body" size="base">
                  Complete a 30-day fitness routine and track your progress daily.
                </MobileText>
                <MobileText variant="caption" size="sm">
                  Difficulty: Easy • Participants: 42
                </MobileText>
              </MobileSpacing>
            </MobileCard>
          </MobileList>
        </MobileSpacing>

        {/* Quick Actions */}
        <MobileSpacing size="lg">
          <MobileText variant="heading" size="xl" weight="semibold">
            Quick Actions
          </MobileText>
          
          <MobileNavigation variant="pills">
            <MobileCard variant="interactive" padding="compact">
              <MobileText variant="body" size="sm" weight="medium">
                Create Dare
              </MobileText>
            </MobileCard>
            
            <MobileCard variant="interactive" padding="compact">
              <MobileText variant="body" size="sm" weight="medium">
                Join Challenge
              </MobileText>
            </MobileCard>
            
            <MobileCard variant="interactive" padding="compact">
              <MobileText variant="body" size="sm" weight="medium">
                View Leaderboard
              </MobileText>
            </MobileCard>
          </MobileNavigation>
        </MobileSpacing>

        {/* Contact Form Example */}
        <MobileSpacing size="lg">
          <MobileText variant="heading" size="xl" weight="semibold">
            Get Started
          </MobileText>
          
          <MobileForm layout="stacked" spacing="default">
            <MobileCard variant="default" padding="spacious">
              <MobileSpacing size="default">
                <MobileText variant="body" size="base" weight="medium">
                  Enter your email to receive challenge updates
                </MobileText>
                
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  style={{
                    minHeight: '48px', // Touch-friendly input height
                    fontSize: isSmallMobile ? '16px' : '18px' // Prevent zoom on iOS
                  }}
                />
                
                <button
                  className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:from-primary-dark hover:to-primary transition-all duration-300 transform hover:scale-105 active:scale-95"
                  style={{
                    minHeight: '48px', // Touch-friendly button height
                    fontSize: isSmallMobile ? '16px' : '18px'
                  }}
                >
                  Subscribe to Updates
                </button>
              </MobileSpacing>
            </MobileCard>
          </MobileForm>
        </MobileSpacing>

        {/* Stats Section */}
        <MobileSpacing size="lg">
          <MobileText variant="heading" size="xl" weight="semibold">
            Platform Statistics
          </MobileText>
          
          <MobileList variant="default" spacing="default">
            <MobileCard variant="elevated" padding="default">
              <MobileText variant="heading" size="2xl" weight="bold">
                1,247
              </MobileText>
              <MobileText variant="caption" size="sm">
                Active Challenges
              </MobileText>
            </MobileCard>
            
            <MobileCard variant="elevated" padding="default">
              <MobileText variant="heading" size="2xl" weight="bold">
                8,392
              </MobileText>
              <MobileText variant="caption" size="sm">
                Community Members
              </MobileText>
            </MobileCard>
            
            <MobileCard variant="elevated" padding="default">
              <MobileText variant="heading" size="2xl" weight="bold">
                15,683
              </MobileText>
              <MobileText variant="caption" size="sm">
                Completed Dares
              </MobileText>
            </MobileCard>
          </MobileList>
        </MobileSpacing>

        {/* Footer */}
        <MobileSpacing size="xl">
          <MobileText variant="body" size="sm" className="text-center text-neutral-400">
            Join thousands of dare-seekers in the ultimate challenge platform
          </MobileText>
        </MobileSpacing>

      </MobileSpacing>
    </MobileContainer>
  );
}

/**
 * Mobile-optimized dare card component
 * Demonstrates how to create reusable mobile-optimized components
 */
export function MobileDareCard({ dare, onSelect }) {
  const isMobile = useIsMobile();
  
  return (
    <MobileCard 
      variant="interactive" 
      padding="spacious"
      onClick={onSelect}
      className="cursor-pointer"
    >
      <MobileSpacing size="sm">
        <MobileText variant="heading" size="lg" weight="semibold">
          {dare.title}
        </MobileText>
        
        <MobileText variant="body" size="base">
          {dare.description}
        </MobileText>
        
        <MobileSpacing size="xs" direction="horizontal">
          <MobileText variant="caption" size="sm">
            Difficulty: {dare.difficulty}
          </MobileText>
          <MobileText variant="caption" size="sm">
            • {dare.participants} participants
          </MobileText>
        </MobileSpacing>
        
        {isMobile && (
          <MobileText variant="caption" size="xs" className="text-primary">
            Tap to view details
          </MobileText>
        )}
      </MobileSpacing>
    </MobileCard>
  );
}

/**
 * Mobile-optimized form input component
 * Shows mobile-first form design patterns
 */
export function MobileFormInput({ 
  label, 
  type = 'text', 
  placeholder, 
  required = false,
  error = null,
  ...props 
}) {
  const isSmallMobile = useIsSmallMobile();
  
  return (
    <MobileSpacing size="sm">
      {label && (
        <MobileText variant="body" size="sm" weight="medium">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </MobileText>
      )}
      
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        className={`
          w-full px-4 py-3 bg-neutral-800/50 border rounded-xl 
          text-neutral-200 placeholder-neutral-400 
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
          transition-all duration-200
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-neutral-700'}
        `.trim()}
        style={{
          minHeight: '48px', // Touch-friendly height
          fontSize: isSmallMobile ? '16px' : '18px' // Prevent iOS zoom
        }}
        {...props}
      />
      
      {error && (
        <MobileText variant="caption" size="sm" className="text-red-400">
          {error}
        </MobileText>
      )}
    </MobileSpacing>
  );
} 