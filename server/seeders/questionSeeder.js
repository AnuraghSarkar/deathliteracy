const mongoose = require('mongoose');
const Question = require('../models/questionModel');
const connectDB = require('../config/db');
require('dotenv').config();

// Function to determine question type and category
const getQuestionTypeAndCategory = (q) => {
  const id = q.id;
  const safeOptions = q.options || {};
  
  // Determine category
  let category = 'General';
  if (['Q1', 'Q1a', 'Q2', 'Q3', 'Q4', 'Q5'].includes(id)) category = 'Demographics';
  else if (['Q6', 'Q6_1', 'Q6_2', 'Q6_3', 'Q6_4', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12', 'Q13', 'Q14'].includes(id)) category = 'Experience';
  else if (['Q15', 'Q15_1', 'Q15_2', 'Q15_3', 'Q15_4'].includes(id)) category = 'Social Connection';
  else if (id.startsWith('Q16') || id.startsWith('Q17')) category = 'Skills';
  else if (id.startsWith('Q18')) category = 'Experience';
  else if (id.startsWith('Q19')) category = 'Knowledge';
  else if (id.startsWith('Q20') || id.startsWith('Q21')) category = 'Community';
  else if (id.startsWith('Q22')) category = 'Death Competency';
  else if (['Q23', 'Q24', 'Q25'].includes(id)) category = 'Demographics';

  // Determine type
  let questionType = 'single_choice';
  
  if (id === 'Q1') questionType = 'single_choice'; // Will handle dropdown in frontend
  else if (Object.keys(safeOptions).length === 0) questionType = 'single_choice'; // Info questions
  else if (safeOptions['1'] === 'Yes' && safeOptions['2'] === 'No') questionType = 'boolean';
  else if (typeof q.question === 'string' && (q.question.toLowerCase().includes('agree') || q.question.toLowerCase().includes('able'))) questionType = 'scale';
  
  return { type: questionType, category };
};

// Raw questions data from your file
const rawQuestions = [
  {
    id: "Q1",
    question: "Country of residence.",
    options: { }
  },
  {
    id: "Q1a",
    question: "Name of state",
    options: {
      "1": "ACT",
      "2": "NSW",
      "3": "NT",
      "4": "QLD",
      "5": "SA",
      "6": "TAS",
      "7": "VIC",
      "8": "WA"
    }
  },
  {
    id: "Q2",
    question: "Which of the following best describes where you live?",
    options: {
      "1": "Urban area",
      "2": "Semi-urban area",
      "3": "Regional area",
      "4": "Rural area",
      "5": "Remote area"
    }
  },
  {
    id: "Q3",
    question: "What age group do you belong to?",
    options: {
      "1": "Under 18",
      "2": "18 - 24 years",
      "3": "25 - 34 years",
      "4": "35 - 44 years",
      "5": "45 - 54 years",
      "6": "55 - 64 years",
      "7": "65 - 79 years",
      "8": "80+ years"
    }
  },
  {
    id: "Q4",
    question: "Please indicate your gender",
    options: {
      "1": "Woman/female",
      "2": "Man/male",
      "3": "Non-binary/genderqueer/gender-fluid",
      "4": "I use a different term (please specify)",
      "98": "Prefer not to answer"
    }
  },
  {
    id: "Q5",
    question: "Are you currently living with a terminal illness?",
    options: {
      "1": "Yes",
      "2": "No"
    }
  },
  {
    id: "Q6",
    question: "Have you made any plans for the end of your life?",
    options: {}
  },
  {
    id: "Q6_1",
    question: "Written a will",
    options: {
      "1": "Yes",
      "2": "No"
    }
  },
  {
    id: "Q6_2",
    question: "I have written down my wishes for end of life care (e.g. made an advance care directive",
    options: {
      "1": "Yes",
      "2": "No"
    }
  },
  {
    id: "Q6_3",
    question: "Appointed someone to make decisions regarding your health or wellbeing e.g. Enduring guardianship/ Health care proxy",
    options: {
      "1": "Yes",
      "2": "No"
    }
  },
  {
    id: "Q6_4",
    question: "Appointed someone to make decisions regarding finances or property e.g. Enduring Power of Attorney/ Legally appointed substitute decision maker.",
    options: {
      "1": "Yes",
      "2": "No"
    }
  },
  {
    id: "Q7",
    question: " I have kept someone company who is near death",
    options: {
      "1": "Yes",
      "2": "No"
    }
  },
  {
    id: "Q8",
    question: " I have witnessed the death of another person",
    options: {
      "1": "Yes",
      "2": "No"
    }
  },
  {
    id: "Q9",
    question: " I have spent time with a person after their death",
    options: {
      "1": "Yes",
      "2": "No"
    }
  },
  {
    id: "Q10",
    question: " I have helped care for a dead body",
    options: {
      "1": "Yes",
      "2": "No"
    }
  },
  {
    id: "Q11",
    question: " I do paid work or have done paid work with people at end of life or supporting people through loss and grief",
    options: {
      "1": "Yes",
      "2": "No"
    }
  },
  {
    id: "Q12",
    question: " I am a volunteer or have volunteered with people at end of life or supporting people through loss and grief",
    options: {
      "1": "Yes",
      "2": "No"
    }
  },
  {
    id: "Q13",
    question: " I have attended training on helping people with dying, grief or bereavement",
    options: {
      "1": "Yes",
      "2": "No"
    }
  },
  {
    id: "Q14",
    question: " Are you currently a health or medical practitioner?",
    options: {
      "1": "Yes",
      "2": "No"
    }
  },
  {
    id: "Q15",
    question: " Please indicate how you feel about the following sentences",
    options: {}
  },
  {
    id: "Q15_1",
    question: "  Most people in my community are helpful",
    options: {
      "1": "Strongly disagree",
      "2": "Disagree",
      "3": "Agree",
      "4": "Strongly agree"
    }
  },
  {
    id: "Q15_2",
    question: "  I have someone I can call on for help",
    options: {
      "1": "Strongly disagree",
      "2": "Disagree",
      "3": "Agree",
      "4": "Strongly agree"
    }
  },
  {
    id: "Q15_3",
    question: "  I feel connected to my community",
    options: {
      "1": "Strongly disagree",
      "2": "Disagree",
      "3": "Agree",
      "4": "Strongly agree"
    }
  },
  {
    id: "Q15_4",
    question: "  I can rely on people in my community",
    options: {
      "1": "Strongly disagree",
      "2": "Disagree",
      "3": "Agree",
      "4": "Strongly agree"
    }
  },
  {
    id: "Q16",
    question: " Conversations about dying, death or grief. How able are you to have the following conversations, where 1 = not at all able to 5 = very able? ",
    options: {}
  },
  {
    id: "Q16_1",
    question: " Talking about death, dying or grief to a close friend",
    options: {
      "1": "1 - Not at all able to",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Very able"
    }
  },
  {
    id: "Q16_2",
    question: " Talking about death, dying or grief to a child",
    options: {
      "1": "1 - Not at all able to",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Very able"
    }
  },
  {
    id: "Q16_3",
    question: " Talking to a grieving person about their loss",
    options: {
      "1": "1 - Not at all able to",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Very able"
    }
  },
  {
    id: "Q16_4",
    question: " Talking to a health professional about getting support for a dying person where they live",
    options: {
      "1": "1 - Not at all able to",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Very able"
    }
  },
  {
    id: "Q17",
    question: "Providing hands on care. How able are you to do the following, where 1 = not at all able to 5 = very able?",
    options: {}
  },
  {
    id: "Q17_1",
    question: " Feed or help a person to eat",
    options: {
      "1": "1 - Not at all able to",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Very able"
    }
  },
  {
    id: "Q17_2",
    question: " Wash a person",
    options: {
      "1": "1 - Not at all able to",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Very able"
    }
  },
  {
    id: "Q17_3",
    question: " Lift a person or help them move",
    options: {
      "1": "1 - Not at all able to",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Very able"
    }
  },
  {
    id: "Q17_4",
    question: " Administer injections",
    options: {
      "1": "1 - Not at all able to",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Very able"
    }
  },
  {
    id: "Q18",
    question: " To what extent do you agree with the following?Indicate your response on a scale from 1-5, where 1=do not agree at all and 5=strongly agree. Previous experiences of grief, losing someone, or other important life events have… ",
    options: {}
  },
  {
    id: "Q18_1",
    question: "  Made me more emotionally prepared to support others with death dying and bereavement",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q18_2",
    question: "  Made me think about what is important and not important in life",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q18_3",
    question: "  Developed my wisdom and understanding",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q18_4",
    question: "  Made me more compassionate toward myself",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q18_5",
    question: "  Made me better prepared to face similar challenges in the future",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q19",
    question: " To what extent do you agree with the following? Indicate your response on a scale of 1-5, where 1=do not agree at all and 5=strongly agree",
    options: {}
  },
  {
    id: "Q19_1",
    question: "  I know the rules and regulations when a person dies at home",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q19_2",
    question: "  I know what documents are needed when planning for death",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q19_3",
    question: "  I know enough about the healthcare system to find the support that a dying person needs",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q19_4",
    question: "  I know enough to make decisions about funeral services and options",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q19_5",
    question: "  I know how to access palliative care in my area",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q19_6",
    question: "  I know enough about how illnesses progress to make decisions about medical treatments at end of life",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q19_7",
    question: "  I know about the ways that cemetery staff can be of help around funerals",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q20",
    question: "Others can help me provide end of life care. PLEASE RATE YOUR LEVEL OF AGREEMENT WITH THE FOLLOWING STATEMENTS -  If I were to provide end-of-life care for someone, I know people who could help me (on a scale of 1–5 between Strongly disagree and Strongly agree)",
    options: {}
  },
  {
    id: "Q20_1",
    question: "  To get support in the area where I live, e.g., from clubs, associations, or volunteer organizations",
    options: {
      "1": "1 - Strongly disagree",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q20_2",
    question: "  To get help with providing day to day care for a person at the end of life",
    options: {
      "1": "1 - Strongly disagree",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q20_3",
    question: "  To get equipment that is required for care",
    options: {
      "1": "1 - Strongly disagree",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q20_4",
    question: "  To get support that is culturally appropriate for a person",
    options: {
      "1": "1 - Strongly disagree",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q20_5",
    question: "  To get emotional support for myself",
    options: {
      "1": "1 - Strongly disagree",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q21",
    question: " Support groups in my community. PLEASE RATE YOUR LEVEL OF AGREEMENT WITH THE FOLLOWING STATEMENTS - If I were to provide end of life care for someone, there is support in my community for (on a scale of 1-5 between Strongly disagree to Strongly agree)",
    options: {}
  },
  {
    id: "Q21_1",
    question: "  People with life threatening illnesses",
    options: {
      "1": "1 - Strongly disagree",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q21_2",
    question: "  People who are nearing the end of their lives",
    options: {
      "1": "1 - Strongly disagree",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q21_3",
    question: "  People who are caring for a dying person",
    options: {
      "1": "1 - Strongly disagree",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q21_4",
    question: "  People who are grieving",
    options: {
      "1": "1 - Strongly disagree",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5 - Strongly agree"
    }
  },
  {
    id: "Q22",
    question: "PLEASE RATE HOW MUCH YOU AGREE WITH EACH OF THE FOLLOWING STATEMENTS: Indicate your response on a scale of 1-7, where 1=do not agree at all and 7=Completely agree",
    options: {}
  },
  {
    id: "Q22_1",
    question: "I am aware of the full array of emotions which characterize human grief",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5",
      "6": "6",
      "7": "7 - Completely agree"
    }
  },
  {
    id: "Q22_2",
    question: "I feel prepared to face my dying process",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5",
      "6": "6",
      "7": "7 - Completely agree"
    }
  },
  {
    id: "Q22_3",
    question: "I can put words to my gut-level feelings about death and dying",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5",
      "6": "6",
      "7": "7 - Completely agree"
    }
  },
  {
    id: "Q22_4",
    question: "I know who to contact when death occurs",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5",
      "6": "6",
      "7": "7 - Completely agree"
    }
  },
  {
    id: "Q22_5",
    question: "I will be able to cope with future losses",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5",
      "6": "6",
      "7": "7 - Completely agree"
    }
  },
  {
    id: "Q22_6",
    question: "I know how to listen to others, including the terminally ill",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5",
      "6": "6",
      "7": "7 - Completely agree"
    }
  },
  {
    id: "Q22_7",
    question: "I can help someone with their thoughts and feelings about death and dying",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5",
      "6": "6",
      "7": "7 - Completely agree"
    }
  },
  {
    id: "Q22_8",
    question: "I would be able to talk to a friend or family member about their death",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5",
      "6": "6",
      "7": "7 - Completely agree"
    }
  },
  {
    id: "Q22_9",
    question: "I can lessen the anxiety of those around me when the topic is death and dying",
    options: {
      "1": "1 - Do not agree at all",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5",
      "6": "6",
      "7": "7 - Completely agree"
    }
  },
  {
    id: "Q23",
    question: " What is your ancestry?  Ancestry means a person's ethnic origin or cultural heritage",
    options: {
      "1": "Australia",
      "2": "America, including North, South and Central American and Caribbean",
      "3": "Chinese",
      "4": "Filipino",
      "5": "Vietnamese",
      "6": "India",
      "7": "South Korean",
      "8": "Japanese",
      "9": "Other SouthEast and NorthEast Asian",
      "10": "Other Southern and Central Asian",
      "11": "European, including British and lrish",
      "12": "African and Middle Eastern",
      "13": "Oceanian including New Zealand, Melanesian and Papuan, Micronesian and Polynesian",
      "14": "Other, please specific",
      "15": "Prefer not to say / Can't say",
      "16": "Other, please specific"
    }
  },
  {
    id: "Q24",
    question: "Do you believe in afterlife?",
    options: {
      "1": "Yes",
      "2": "No"
    }
  },
  {
    id: "Q25",
    question: "Which religion do you identify with?",
    options: {
      "1": "Catholic",
      "2": "Anglican (Church of England) Uniting Church",
      "3": "Presbyterian",
      "4": "Buddhism",
      "5": "Islam",
      "6": "Greek Orthodox",
      "7": "Baptist",
      "8": "Hinduism",
      "9": "Spiritual",
      "10": "None",
      "11": "Other (please specify)",
      "12": "Prefer not to say"
    }
  }
];

// Convert to database format
const convertQuestionsForDB = () => {
  const dbQuestions = [];
  let order = 1;
  
  rawQuestions.forEach(q => {
    const { type, category } = getQuestionTypeAndCategory(q);
    
    // Convert options to proper format
    const options = Object.entries(q.options || {}).map(([value, label]) => ({
      value,
      label
    }));
    
    // Check for conditional logic (Q1a depends on Q1)
    let conditionalLogic = null;
    if (q.id === 'Q1a') {
      conditionalLogic = {
        showIf: {
          questionId: 'Q1',
          value: 'Australia'
        }
      };
    }
    
    // Determine parent question and subcategory
    let parentQuestion = null;
    let subcategory = null;
    let parentText = null;
    
    if (q.id.includes('_')) {
      parentQuestion = q.id.split('_')[0];
      
      // Set subcategories
      if (parentQuestion === 'Q16') {
        subcategory = 'Conversations';
        parentText = 'Conversations about dying, death or grief. How able are you to have the following conversations, where 1 = not at all able to 5 = very able?';
      } else if (parentQuestion === 'Q17') {
        subcategory = 'Hands-on Care';
        parentText = 'Providing hands on care. How able are you to do the following, where 1 = not at all able to 5 = very able?';
      } else if (parentQuestion === 'Q18') {
        subcategory = 'Experiential Knowledge';
        parentText = 'To what extent do you agree with the following? Previous experiences of grief, losing someone, or other important life events have…';
      } else if (parentQuestion === 'Q19') {
        subcategory = 'Factual Knowledge';
        parentText = 'To what extent do you agree with the following? Indicate your response on a scale of 1-5, where 1=do not agree at all and 5=strongly agree';
      } else if (parentQuestion === 'Q20') {
        subcategory = 'Community Knowledge';
        parentText = 'Others can help me provide end of life care. If I were to provide end-of-life care for someone, I know people who could help me';
      } else if (parentQuestion === 'Q21') {
        subcategory = 'Community Support';
        parentText = 'Support groups in my community. If I were to provide end of life care for someone, there is support in my community for';
      } else if (parentQuestion === 'Q22') {
        subcategory = 'Death Competency';
        parentText = 'Please rate how much you agree with each of the following statements';
      }
    }
    
    const dbQuestion = {
      questionId: q.id,
      text: q.question,
      type,
      category,
      subcategory,
      parentQuestion,
      parentText,
      options,
      conditionalLogic,
      order: order++,
      isActive: true
    };
    
    dbQuestions.push(dbQuestion);
  });
  
  return dbQuestions;
};

const seedQuestions = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');
    
    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');
    
    // Convert and insert questions
    const questionsForDB = convertQuestionsForDB();
    const insertedQuestions = await Question.insertMany(questionsForDB);
    
    console.log(`✅ Seeded ${insertedQuestions.length} questions successfully`);
    
    // Display summary
    const summary = {};
    insertedQuestions.forEach(q => {
      summary[q.category] = (summary[q.category] || 0) + 1;
    });
    
    console.log('Questions by category:', summary);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding questions:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedQuestions();
}

module.exports = { seedQuestions };