import React, { useState, useEffect } from 'react';
import { useProfile } from '@farcaster/auth-kit';
import './ProfileCard.css';

const ProfileCard = ({ terms }) => {
  const { isAuthenticated, profile } = useProfile();
  const [score, setScore] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Check if mobile on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate score based on user submissions
  useEffect(() => {
    if (isAuthenticated && profile && terms) {
      // Count terms submitted by current user
      const userSubmissionsCount = Object.values(terms).filter(
        term => term.submitted_by === `@${profile.username}`
      ).length;
      
      // Each submission is worth 10 points
      setScore(userSubmissionsCount * 10);
    }
  }, [isAuthenticated, profile, terms]);

  if (!isAuthenticated || !profile) {
    return null;
  }

  // Get pfpUrl from profile - handle both pfp.url and pfpUrl formats
  const getProfileImageUrl = () => {
    if (profile.pfp && profile.pfp.url) {
      return profile.pfp.url;
    } else if (profile.pfpUrl) {
      return profile.pfpUrl;
    } else if (profile.displayName && profile.displayName.pfpUrl) {
      return profile.displayName.pfpUrl;
    }
    // Default placeholder if no image is found
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
  };

  return (
    <div className="profile-card" style={{ top: isMobile ? '12px' : '16px' }}>
      <div className="profile-info">
        <div className="profile-name">@{profile.username}</div>
        <div className="profile-score">{score} points</div>
      </div>
      <div className="profile-image">
        <img src={getProfileImageUrl()} alt={`@${profile.username}`} />
      </div>
    </div>
  );
};

export default ProfileCard;