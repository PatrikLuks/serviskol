import React from 'react';
import FollowupAiRecommendationPanel from './FollowupAiRecommendationPanel';

export default function FollowupEffectivenessAiIntegration({ segment, variants }) {
  if (!variants || Object.keys(variants).length < 2) return null;
  // Připrav pole variant pro AI (label, messageTemplate)
  const aiVariants = Object.entries(variants).map(([label, v]) => ({ label, messageTemplate: v.messageTemplate || '' }));
  return (
    <div className="mb-2">
      <FollowupAiRecommendationPanel segment={segment} variants={aiVariants} />
    </div>
  );
}
