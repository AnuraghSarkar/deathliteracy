const NATIONAL_BENCHMARKS = {
  overall: 6.2,
  skills: 6.8,
  experience: 6.4,
  knowledge: 5.7,
  community: 6.1
};

// Question mappings to SEAK categories
const QUESTION_CATEGORIES = {
  // Skills (Practical abilities) - Q16 & Q17
  skills: [
    'Q16_1', 'Q16_2', 'Q16_3', 'Q16_4', // Conversations
    'Q17_1', 'Q17_2', 'Q17_3', 'Q17_4'  // Hands-on care
  ],
  
  // Experience (Personal encounters) - Q18
  experience: [
    'Q18_1', 'Q18_2', 'Q18_3', 'Q18_4', 'Q18_5'
  ],
  
  // Knowledge (Understanding systems) - Q19
  knowledge: [
    'Q19_1', 'Q19_2', 'Q19_3', 'Q19_4', 'Q19_5', 'Q19_6', 'Q19_7'
  ],
  
  // Action/Community (Finding help) - Q20 & Q21
  community: [
    'Q20_1', 'Q20_2', 'Q20_3', 'Q20_4', 'Q20_5', // Personal help
    'Q21_1', 'Q21_2', 'Q21_3', 'Q21_4'           // Community support
  ]
};

// Calculate scaled mean (out of 10) for each category
export const calculateCategoryScore = (answers, category) => {
  const categoryQuestions = QUESTION_CATEGORIES[category];
  if (!categoryQuestions) return 0;
  
  let totalScore = 0;
  let answeredQuestions = 0;
  
  categoryQuestions.forEach(questionId => {
    if (answers[questionId]) {
      totalScore += parseInt(answers[questionId]);
      answeredQuestions++;
    }
  });
  
  if (answeredQuestions === 0) return 0;
  
  // Convert to scale of 10 (questions are 1-5 scale)
  const average = totalScore / answeredQuestions;
  return ((average - 1) / 4) * 10; // Convert 1-5 scale to 0-10 scale
};

// Calculate overall death literacy score
export const calculateOverallScore = (answers) => {
  const categoryScores = {
    skills: calculateCategoryScore(answers, 'skills'),
    experience: calculateCategoryScore(answers, 'experience'),
    knowledge: calculateCategoryScore(answers, 'knowledge'),
    community: calculateCategoryScore(answers, 'community')
  };
  
  // Overall score is average of all categories
  const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
  const overallScore = totalScore / 4;
  
  return {
    overall: overallScore,
    categories: categoryScores
  };
};

// Compare with national benchmarks
export const compareWithBenchmarks = (userScores) => {
  const comparisons = {};
  
  // Overall comparison
  const overallDiff = userScores.overall - NATIONAL_BENCHMARKS.overall;
  comparisons.overall = {
    userScore: userScores.overall,
    benchmark: NATIONAL_BENCHMARKS.overall,
    difference: overallDiff,
    level: overallDiff > 1 ? 'higher' : overallDiff < -1 ? 'lower' : 'similar'
  };
  
  // Category comparisons
  Object.keys(userScores.categories).forEach(category => {
    const userScore = userScores.categories[category];
    const benchmark = NATIONAL_BENCHMARKS[category];
    const diff = userScore - benchmark;
    
    comparisons[category] = {
      userScore: userScore,
      benchmark: benchmark,
      difference: diff,
      level: diff > 1 ? 'higher' : diff < -1 ? 'lower' : 'similar'
    };
  });
  
  return comparisons;
};

// Generate personalized feedback
export const generateFeedback = (comparisons, demographics, experiences) => {
  const feedback = {
    summary: '',
    strengths: [],
    improvements: [],
    recommendations: []
  };
  
  // Generate summary based on overall performance
  if (comparisons.overall.level === 'higher') {
    feedback.summary = "Your death literacy is above the Australian national average. You demonstrate strong knowledge and skills in end-of-life matters.";
  } else if (comparisons.overall.level === 'lower') {
    feedback.summary = "Your death literacy is below the Australian national average. There are opportunities to develop your knowledge and skills in end-of-life matters.";
  } else {
    feedback.summary = "Your death literacy is similar to the Australian national average. You have a good foundation with room for growth.";
  }
  
  // Identify strengths
  Object.keys(comparisons).forEach(category => {
    if (category !== 'overall' && comparisons[category].level === 'higher') {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      feedback.strengths.push(`${categoryName}: You scored well above average in this area`);
    }
  });
  
  // Identify improvement areas
  Object.keys(comparisons).forEach(category => {
    if (category !== 'overall' && comparisons[category].level === 'lower') {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      feedback.improvements.push(`${categoryName}: This area could benefit from further development`);
    }
  });
  
  // Generate recommendations
  if (comparisons.skills?.level === 'lower') {
    feedback.recommendations.push("Consider taking a first aid course or volunteering with hospice services to develop practical care skills");
  }
  
  if (comparisons.knowledge?.level === 'lower') {
    feedback.recommendations.push("Learn about advance care planning, wills, and end-of-life legal processes");
  }
  
  if (comparisons.community?.level === 'lower') {
    feedback.recommendations.push("Explore community support services and build connections with local grief support groups");
  }
  
  if (comparisons.experience?.level === 'lower') {
    feedback.recommendations.push("Consider attending death cafes or grief education workshops to normalize discussions about death");
  }
  
  return feedback;
};

// Calculate social connection score (Q15)
export const calculateSocialConnectionScore = (answers) => {
  const socialQuestions = ['Q15_1', 'Q15_2', 'Q15_3', 'Q15_4'];
  let total = 0;
  let count = 0;
  
  socialQuestions.forEach(q => {
    if (answers[q]) {
      total += parseInt(answers[q]);
      count++;
    }
  });
  
  return count > 0 ? total / count : 0;
};