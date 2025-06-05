// DLI-R Validated Scoring System
// Based on research benchmarks and SEAK model

// Validated Australian National Benchmarks (scaled means out of 10)
const NATIONAL_BENCHMARKS = {
  overall: 6.2,
  practicalKnowledge: 6.8,    // Skills (Q16 + Q17)
  experientialKnowledge: 6.4, // Experience (Q18)
  factualKnowledge: 5.7,      // Knowledge (Q19)
  communityKnowledge: 6.1     // Action (Q20 + Q21)
};

// Question mappings to DLI-R domains
const DLI_QUESTION_MAPPING = {
  // Practical Knowledge (Skills) - 8 items
  practicalKnowledge: [
    'Q16_1', 'Q16_2', 'Q16_3', 'Q16_4', // Talking Support (4 items)
    'Q17_1', 'Q17_2', 'Q17_3', 'Q17_4'  // Hands-on Care (4 items)
  ],
  
  // Experiential Knowledge (Experience) - 5 items
  experientialKnowledge: [
    'Q18_1', 'Q18_2', 'Q18_3', 'Q18_4', 'Q18_5'
  ],
  
  // Factual Knowledge (Knowledge) - 7 items
  factualKnowledge: [
    'Q19_1', 'Q19_2', 'Q19_3', 'Q19_4', 'Q19_5', 'Q19_6', 'Q19_7'
  ],
  
  // Community Knowledge (Action) - 9 items
  communityKnowledge: [
    'Q20_1', 'Q20_2', 'Q20_3', 'Q20_4', 'Q20_5', // Accessing Help (5 items)
    'Q21_1', 'Q21_2', 'Q21_3', 'Q21_4'           // Community Support (4 items)
  ]
};

// Calculate scaled mean for each DLI domain (out of 10)
export const calculateDLIDomainScore = (answers, domain) => {
  const domainQuestions = DLI_QUESTION_MAPPING[domain];
  if (!domainQuestions) {
    throw new Error(`Invalid DLI domain: ${domain}`);
  }
  
  let totalScore = 0;
  let answeredQuestions = 0;
  
  domainQuestions.forEach(questionId => {
    if (answers[questionId] && !isNaN(parseInt(answers[questionId]))) {
      totalScore += parseInt(answers[questionId]);
      answeredQuestions++;
    }
  });
  
  if (answeredQuestions === 0) return 0;
  
  // Convert 1-5 Likert scale to 0-10 scale: ((mean - 1) / 4) * 10
  const average = totalScore / answeredQuestions;
  const scaledScore = ((average - 1) / 4) * 10;
  
  return Math.round(scaledScore * 10) / 10; // Round to 1 decimal place
};

// Calculate overall DLI score and all domain scores
export const calculateDLIScores = (answers) => {
  const domainScores = {
    practicalKnowledge: calculateDLIDomainScore(answers, 'practicalKnowledge'),
    experientialKnowledge: calculateDLIDomainScore(answers, 'experientialKnowledge'),
    factualKnowledge: calculateDLIDomainScore(answers, 'factualKnowledge'),
    communityKnowledge: calculateDLIDomainScore(answers, 'communityKnowledge')
  };
  
  // Overall score is the average of all four domains
  const validScores = Object.values(domainScores).filter(score => score > 0);
  const overallScore = validScores.length > 0 ? 
    validScores.reduce((sum, score) => sum + score, 0) / validScores.length : 0;
  
  return {
    overall: Math.round(overallScore * 10) / 10,
    domains: domainScores,
    completedDomains: validScores.length,
    totalDomains: 4
  };
};

// Compare DLI scores with national benchmarks
export const compareWithDLIBenchmarks = (userScores) => {
  const comparisons = {};
  
  // Overall comparison
  const overallDiff = userScores.overall - NATIONAL_BENCHMARKS.overall;
  comparisons.overall = {
    userScore: userScores.overall,
    benchmark: NATIONAL_BENCHMARKS.overall,
    difference: overallDiff,
    level: getDLIComparisonLevel(overallDiff),
    percentageDiff: Math.round((overallDiff / NATIONAL_BENCHMARKS.overall) * 100)
  };
  
  // Domain comparisons
  Object.keys(userScores.domains).forEach(domain => {
    const userScore = userScores.domains[domain];
    const benchmark = NATIONAL_BENCHMARKS[domain];
    const diff = userScore - benchmark;
    
    comparisons[domain] = {
      userScore: userScore,
      benchmark: benchmark,
      difference: diff,
      level: getDLIComparisonLevel(diff),
      percentageDiff: Math.round((diff / benchmark) * 100)
    };
  });
  
  return comparisons;
};

// Determine comparison level based on difference from benchmark
const getDLIComparisonLevel = (difference) => {
  // Based on research: ±1.0 point difference is considered similar
  if (difference > 1.0) return 'higher';
  if (difference < -1.0) return 'lower';
  return 'similar';
};

// Generate DLI feedback based on validated benchmarks
export const generateDLIFeedback = (comparisons, demographics) => {
  const feedback = {
    summary: '',
    strengths: [],
    improvements: [],
    recommendations: [],
    interpretation: {}
  };
  
  // Generate overall summary
  const overallLevel = comparisons.overall.level;
  const overallScore = comparisons.overall.userScore;
  
  if (overallLevel === 'higher') {
    feedback.summary = `Your overall death literacy score (${overallScore}/10) is above the Australian national average (${NATIONAL_BENCHMARKS.overall}/10). You demonstrate strong knowledge and capabilities across end-of-life care domains.`;
  } else if (overallLevel === 'lower') {
    feedback.summary = `Your overall death literacy score (${overallScore}/10) is below the Australian national average (${NATIONAL_BENCHMARKS.overall}/10). There are valuable opportunities to develop your knowledge and skills in end-of-life care.`;
  } else {
    feedback.summary = `Your overall death literacy score (${overallScore}/10) is similar to the Australian national average (${NATIONAL_BENCHMARKS.overall}/10). You have a solid foundation with opportunities for targeted growth.`;
  }
  
  // Identify strengths and areas for improvement
  const domainNames = {
    practicalKnowledge: 'Practical Skills',
    experientialKnowledge: 'Experiential Learning',
    factualKnowledge: 'Factual Knowledge',
    communityKnowledge: 'Community Awareness'
  };
  
  Object.keys(comparisons).forEach(domain => {
    if (domain !== 'overall') {
      const comp = comparisons[domain];
      const displayName = domainNames[domain];
      
      if (comp.level === 'higher') {
        feedback.strengths.push(`${displayName}: You score ${comp.userScore}/10 vs national average ${comp.benchmark}/10 (+${comp.percentageDiff}%)`);
      } else if (comp.level === 'lower') {
        feedback.improvements.push(`${displayName}: You score ${comp.userScore}/10 vs national average ${comp.benchmark}/10 (${comp.percentageDiff}%)`);
      }
    }
  });
  
  // Generate targeted recommendations
  feedback.recommendations = generateDLIRecommendations(comparisons, demographics);
  
  // Add interpretation
  feedback.interpretation = {
    scoreRange: '0-10 scale (based on 5-point Likert responses)',
    benchmark: 'Australian national population sample',
    significance: 'Differences of ±1.0 points are considered meaningful',
    domains: {
      practicalKnowledge: 'Your ability to have conversations and provide hands-on care',
      experientialKnowledge: 'How past experiences have prepared you for end-of-life situations',
      factualKnowledge: 'Your understanding of systems, processes, and legal aspects',
      communityKnowledge: 'Your awareness of available support and resources'
    }
  };
  
  return feedback;
};

// Generate targeted recommendations based on DLI performance
const generateDLIRecommendations = (comparisons, demographics) => {
  const recommendations = [];
  
  // Domain-specific recommendations for low-scoring areas
  if (comparisons.practicalKnowledge?.level === 'lower') {
    recommendations.push(
      'Consider taking courses in end-of-life care or grief support',
      'Practice having conversations about death with trusted friends or family',
      'Volunteer with hospice or palliative care organizations'
    );
  }
  
  if (comparisons.experientialKnowledge?.level === 'lower') {
    recommendations.push(
      'Attend Death Cafes or community discussions about death and dying',
      'Read books or watch documentaries about end-of-life experiences',
      'Reflect on your own experiences with loss and grief'
    );
  }
  
  if (comparisons.factualKnowledge?.level === 'lower') {
    recommendations.push(
      'Learn about advance care planning and living wills in your area',
      'Research funeral options and legal requirements',
      'Explore palliative care services available locally'
    );
  }
  
  if (comparisons.communityKnowledge?.level === 'lower') {
    recommendations.push(
      'Connect with local grief support groups and community organizations',
      'Build relationships with healthcare providers in your area',
      'Research volunteer opportunities supporting bereaved families'
    );
  }
  
  // If high performing, add sharing recommendations
  if (comparisons.overall.level === 'higher') {
    recommendations.push(
      'Consider mentoring others or sharing your knowledge in your community',
      'Explore advanced training opportunities in end-of-life care'
    );
  }
  
  // Default recommendations if none specific
  if (recommendations.length === 0) {
    recommendations.push(
      'Continue learning about end-of-life planning and advance care directives',
      'Stay informed about developments in palliative care and death literacy'
    );
  }
  
  return recommendations.slice(0, 5); // Limit to 5 recommendations
};

// Validate DLI scoring completeness
export const validateDLICompleteness = (answers) => {
  const completion = {};
  
  Object.keys(DLI_QUESTION_MAPPING).forEach(domain => {
    const domainQuestions = DLI_QUESTION_MAPPING[domain];
    const answeredCount = domainQuestions.filter(q => answers[q]).length;
    
    completion[domain] = {
      answered: answeredCount,
      total: domainQuestions.length,
      percentage: Math.round((answeredCount / domainQuestions.length) * 100),
      isComplete: answeredCount === domainQuestions.length
    };
  });
  
  const totalAnswered = Object.values(completion).reduce((sum, domain) => sum + domain.answered, 0);
  const totalQuestions = Object.values(completion).reduce((sum, domain) => sum + domain.total, 0);
  
  completion.overall = {
    answered: totalAnswered,
    total: totalQuestions,
    percentage: Math.round((totalAnswered / totalQuestions) * 100),
    isComplete: totalAnswered === totalQuestions
  };
  
  return completion;
};

// Export domain mapping for frontend use
export const getDLIDomainMapping = () => DLI_QUESTION_MAPPING;

// Export benchmarks for frontend use
export const getNationalBenchmarks = () => NATIONAL_BENCHMARKS;