import { BENCHMARK_DATA, FEEDBACK_TEMPLATES, getPersonalizedRecommendations } from '../data/benchmarkData';

// National benchmarks from the research paper
const NATIONAL_BENCHMARKS = {
  overall: BENCHMARK_DATA.overall.score,
  skills: BENCHMARK_DATA.skills.score,
  experience: BENCHMARK_DATA.experience.score,
  knowledge: BENCHMARK_DATA.knowledge.score,
  community: BENCHMARK_DATA.community.score
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

// Generate personalized feedback using benchmark data
export const generateFeedback = (comparisons, demographics, experiences) => {
  const feedback = {
    summary: '',
    strengths: [],
    improvements: [],
    recommendations: []
  };
  
  // Generate summary based on overall performance
  const overallLevel = comparisons.overall.level;
  feedback.summary = FEEDBACK_TEMPLATES[overallLevel].overall;
  
  // Identify strengths and improvements using templates
  Object.keys(comparisons).forEach(category => {
    if (category !== 'overall') {
      const level = comparisons[category].level;
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      
      if (level === 'higher') {
        feedback.strengths.push(`${categoryName}: ${FEEDBACK_TEMPLATES.higher[category]}`);
      } else if (level === 'lower') {
        feedback.improvements.push(`${categoryName}: ${FEEDBACK_TEMPLATES.lower[category]}`);
      }
    }
  });
  
  // Generate personalized recommendations
  feedback.recommendations = getPersonalizedRecommendations(comparisons, demographics);
  
  return feedback;
};

// Calculate social connection score (Q15) using benchmark
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
  
  const averageScore = count > 0 ? total / count : 0;
  const benchmark = BENCHMARK_DATA.socialConnection.score;
  
  return {
    score: averageScore,
    benchmark: benchmark,
    level: averageScore > benchmark + 0.5 ? 'higher' : 
           averageScore < benchmark - 0.5 ? 'lower' : 'similar'
  };
};