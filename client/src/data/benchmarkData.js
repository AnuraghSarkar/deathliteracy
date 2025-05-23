export const BENCHMARK_DATA = {
  // Overall Death Literacy Index
  overall: {
    score: 6.2,
    range: "5.8-6.6",
    description: "Overall death literacy across all domains"
  },
  
  // Individual domain scores
  skills: {
    score: 6.8,
    range: "6.3-7.3", 
    description: "Practical skills and conversations about death"
  },
  
  experience: {
    score: 6.4,
    range: "5.9-6.9",
    description: "Personal and professional experiences with death"
  },
  
  knowledge: {
    score: 5.7,
    range: "5.2-6.2",
    description: "Understanding of systems, processes, and legal aspects"
  },
  
  community: {
    score: 6.1,
    range: "5.6-6.6",
    description: "Access to community support and resources"
  },
  
  // Social connection benchmark
  socialConnection: {
    score: 3.2,
    range: "2.8-3.6",
    description: "Sense of community support and connection"
  }
};

// Feedback templates based on CSV data
export const FEEDBACK_TEMPLATES = {
  higher: {
    overall: "Your death literacy is above the Australian national average. You demonstrate strong knowledge and skills in end-of-life matters.",
    skills: "You have excellent practical skills for supporting others through death and dying.",
    experience: "Your experiences have given you valuable wisdom about death and loss.",
    knowledge: "You have strong knowledge of end-of-life systems and processes.",
    community: "You have good connections to community support networks."
  },
  
  similar: {
    overall: "Your death literacy is similar to the Australian national average. You have a solid foundation with opportunities for growth.",
    skills: "Your practical skills are at the national average level.",
    experience: "Your experiences with death and loss are typical for your demographic.",
    knowledge: "Your knowledge of end-of-life processes is at the average level.",
    community: "Your community connections are at the national average."
  },
  
  lower: {
    overall: "Your death literacy is below the Australian national average. There are valuable opportunities to develop your knowledge and skills.",
    skills: "Developing practical skills could help you feel more confident supporting others.",
    experience: "Additional experiences or education could help normalize death and dying.",
    knowledge: "Learning about end-of-life systems and processes would be beneficial.",
    community: "Building stronger community connections could provide valuable support."
  }
};

// Recommendations based on low areas
export const RECOMMENDATIONS = {
  skills: [
    "Consider taking a first aid course or CPR training",
    "Volunteer with local hospice or palliative care services",
    "Practice having conversations about death with trusted friends or family",
    "Attend workshops on grief support and active listening"
  ],
  
  experience: [
    "Attend a Death Cafe or similar community discussion group",
    "Read books or watch documentaries about death and dying",
    "Consider grief counseling or therapy if you've experienced loss",
    "Join online communities focused on death literacy and end-of-life planning"
  ],
  
  knowledge: [
    "Learn about advance care planning and living wills",
    "Research funeral options and costs in your area",
    "Understand your local laws regarding death certificates and procedures",
    "Explore palliative care services available in your community",
    "Learn about organ donation and body donation options"
  ],
  
  community: [
    "Connect with local grief support groups",
    "Research community organizations that support end-of-life care",
    "Build relationships with healthcare providers in your area",
    "Join religious or spiritual communities if that aligns with your beliefs",
    "Explore volunteer opportunities with organizations supporting bereaved families"
  ]
};

// Age-specific feedback adjustments
export const AGE_ADJUSTMENTS = {
  "18-24": {
    message: "As a young adult, it's excellent that you're thinking about death literacy early.",
    focus: "Building knowledge and community connections"
  },
  
  "25-34": {
    message: "This is an important time to develop death literacy as you may face these situations.",
    focus: "Practical skills and planning"
  },
  
  "35-44": {
    message: "Your age group often faces their first major losses. Your awareness is valuable.",
    focus: "Supporting others and advance planning"
  },
  
  "45-54": {
    message: "Many people your age become caregivers. Your death literacy can help you support others.",
    focus: "Caregiver skills and knowledge"
  },
  
  "55-64": {
    message: "Pre-retirement is an excellent time to plan and prepare for end-of-life considerations.",
    focus: "Personal planning and knowledge"
  },
  
  "65+": {
    message: "Your experience and wisdom are valuable. You may be able to mentor others.",
    focus: "Sharing knowledge and supporting community"
  }
};

// Function to get personalized recommendations
export const getPersonalizedRecommendations = (comparisons, demographics) => {
  const recommendations = [];
  
  // Add recommendations for low-scoring areas
  Object.keys(comparisons).forEach(area => {
    if (area !== 'overall' && comparisons[area].level === 'lower') {
      const areaRecommendations = RECOMMENDATIONS[area] || [];
      recommendations.push(...areaRecommendations.slice(0, 2)); // Take first 2 recommendations per area
    }
  });
  
  // Add age-specific recommendation if applicable
  if (demographics?.age && AGE_ADJUSTMENTS[demographics.age]) {
    const ageInfo = AGE_ADJUSTMENTS[demographics.age];
    recommendations.push(`${ageInfo.message} Focus on: ${ageInfo.focus}.`);
  }
  
  // If no specific recommendations, add general ones
  if (recommendations.length === 0) {
    recommendations.push(
      "Continue learning about end-of-life planning and advance care directives",
      "Consider sharing your knowledge with others in your community",
      "Stay informed about developments in palliative care and death literacy"
    );
  }
  
  return recommendations.slice(0, 5); // Limit to 5 recommendations
};