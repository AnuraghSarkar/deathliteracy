const mongoose = require('mongoose');
const Question = require('../models/questionModel');
const connectDB = require('../config/db');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Function to determine question type and category
const getQuestionTypeAndCategory = (q) => {
  const id = q.questionId;
  const hasOptions = q.options && q.options.length > 0;
  
  // Determine category based on DLI research structure
  let category = 'General';
  if (['Q1', 'Q1_1', 'Q2', 'Q3', 'Q4', 'Q5'].includes(id)) category = 'Demographics';
  else if (['Q6', 'Q6_1', 'Q6_2', 'Q6_3', 'Q6_4', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12', 'Q13', 'Q14'].includes(id)) category = 'Experiences';
  else if (['Q15', 'Q15_1', 'Q15_2', 'Q15_3', 'Q15_4'].includes(id)) category = 'Social Connection';
  else if (id.startsWith('Q16') || id.startsWith('Q17')) category = 'Practical Knowledge';  // DLI Skills
  else if (id.startsWith('Q18')) category = 'Experiential Knowledge';  // DLI Experience
  else if (id.startsWith('Q19')) category = 'Factual Knowledge';       // DLI Knowledge
  else if (id.startsWith('Q20') || id.startsWith('Q21')) category = 'Community Knowledge';  // DLI Action
  else if (id.startsWith('Q22')) category = 'Death Competency';
  else if (['Q23', 'Q24', 'Q25'].includes(id)) category = 'Demographics';

  // Determine type
  let questionType = 'single_choice';
  
  if (id === 'Q1') questionType = 'single_choice'; // Country dropdown
  else if (!hasOptions) questionType = 'single_choice'; // Header questions
  else if (hasOptions && q.options.length === 2 && 
           q.options.some(opt => opt.label === 'Yes') && 
           q.options.some(opt => opt.label === 'No')) questionType = 'boolean';
  else if (hasOptions && q.options.length >= 4 && 
           (q.text.toLowerCase().includes('agree') || 
            q.text.toLowerCase().includes('able'))) questionType = 'likert_5';
  else if (hasOptions) questionType = 'single_choice';
  
  return { type: questionType, category };
};

// Complete survey questions Q1-Q25
const allSurveyQuestions = [
  // Q1-Q5: Demographics
  {
    questionId: "Q1",
    text: "Country of residence",
    options: [{ value: "dropdown", label: "Pre-populated in a drop-down menu" }]
  },
  {
    questionId: "Q1_1",
    text: "Name of state (if Australia)",
    options: [
      { value: 1, label: "ACT" },
      { value: 2, label: "NSW" },
      { value: 3, label: "NT" },
      { value: 4, label: "QLD" },
      { value: 5, label: "SA" },
      { value: 6, label: "TAS" },
      { value: 7, label: "VIC" },
      { value: 8, label: "WA" }
    ]
  },
  {
    questionId: "Q2",
    text: "Which of the following best describes where you live?",
    options: [
      { value: 1, label: "Urban area" },
      { value: 2, label: "Semi-urban area" },
      { value: 3, label: "Regional area" },
      { value: 4, label: "Rural area" },
      { value: 5, label: "Remote area" }
    ]
  },
  {
    questionId: "Q3",
    text: "What age group do you belong to?",
    options: [
      { value: 1, label: "Under 18" },
      { value: 2, label: "18 - 24 years" },
      { value: 3, label: "25 - 34 years" },
      { value: 4, label: "35 - 44 years" },
      { value: 5, label: "45 - 54 years" },
      { value: 6, label: "55 - 64 years" },
      { value: 7, label: "65 - 79 years" },
      { value: 8, label: "80+ years" }
    ]
  },
  {
    questionId: "Q4",
    text: "Please indicate your gender",
    options: [
      { value: 1, label: "Woman/female" },
      { value: 2, label: "Man/male" },
      { value: 3, label: "Non-binary/genderqueer/gender-fluid" },
      { value: 4, label: "I use a different term (please specify)" },
      { value: 98, label: "Prefer not to answer" }
    ]
  },
  {
    questionId: "Q5",
    text: "Are you currently living with a terminal illness?",
    options: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" }
    ]
  },

  // Q6-Q14: Experiences
  {
    questionId: "Q6",
    text: "Have you made any plans for the end of your life?",
    options: []
  },
  {
    questionId: "Q6_1",
    text: "Written a will",
    options: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" }
    ]
  },
  {
    questionId: "Q6_2",
    text: "I have written down my wishes for end of life care (e.g. made an advance care directive)",
    options: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" }
    ]
  },
  {
    questionId: "Q6_3",
    text: "Appointed someone to make decisions regarding your health or wellbeing e.g. Enduring guardianship/ Health care proxy",
    options: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" }
    ]
  },
  {
    questionId: "Q6_4",
    text: "Appointed someone to make decisions regarding finances or property e.g. Enduring Power of Attorney/ Legally appointed substitute decision maker",
    options: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" }
    ]
  },
  {
    questionId: "Q7",
    text: "I have kept someone company who is near death",
    options: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" }
    ]
  },
  {
    questionId: "Q8",
    text: "I have witnessed the death of another person",
    options: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" }
    ]
  },
  {
    questionId: "Q9",
    text: "I have spent time with a person after their death",
    options: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" }
    ]
  },
  {
    questionId: "Q10",
    text: "I have helped care for a dead body",
    options: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" }
    ]
  },
  {
    questionId: "Q11",
    text: "I do paid work or have done paid work with people at end of life or supporting people through loss and grief",
    options: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" }
    ]
  },
  {
    questionId: "Q12",
    text: "I am a volunteer or have volunteered with people at end of life or supporting people through loss and grief",
    options: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" }
    ]
  },
  {
    questionId: "Q13",
    text: "I have attended training on helping people with dying, grief or bereavement",
    options: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" }
    ]
  },
  {
    questionId: "Q14",
    text: "Are you currently a health or medical practitioner?",
    options: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" }
    ]
  },

  // Q15: Social Connection
  {
    questionId: "Q15",
    text: "Please indicate how you feel about the following sentences",
    options: []
  },
  {
    questionId: "Q15_1",
    text: "Most people in my community are helpful",
    options: [
      { value: 1, label: "Strongly disagree" },
      { value: 2, label: "Disagree" },
      { value: 3, label: "Agree" },
      { value: 4, label: "Strongly agree" }
    ]
  },
  {
    questionId: "Q15_2",
    text: "I have someone I can call on for help",
    options: [
      { value: 1, label: "Strongly disagree" },
      { value: 2, label: "Disagree" },
      { value: 3, label: "Agree" },
      { value: 4, label: "Strongly agree" }
    ]
  },
  {
    questionId: "Q15_3",
    text: "I feel connected to my community",
    options: [
      { value: 1, label: "Strongly disagree" },
      { value: 2, label: "Disagree" },
      { value: 3, label: "Agree" },
      { value: 4, label: "Strongly agree" }
    ]
  },
  {
    questionId: "Q15_4",
    text: "I can rely on people in my community",
    options: [
      { value: 1, label: "Strongly disagree" },
      { value: 2, label: "Disagree" },
      { value: 3, label: "Agree" },
      { value: 4, label: "Strongly agree" }
    ]
  },

  // Q16-Q21: THE 29-ITEM VALIDATED DLI-R (Death Literacy Index)
  
  // Q16: Talking Support (Practical Knowledge) - 4 items
  {
    questionId: "Q16",
    text: "Conversations about dying, death or grief. How able are you to have the following conversations, where 1 = not at all able to 5 = very able?",
    options: []
  },
  {
    questionId: "Q16_1",
    text: "Talking about death, dying or grief to a close friend",
    options: [
      { value: 1, label: "1 - Not at all able to" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Very able" }
    ]
  },
  {
    questionId: "Q16_2",
    text: "Talking about death, dying or grief to a child",
    options: [
      { value: 1, label: "1 - Not at all able to" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Very able" }
    ]
  },
  {
    questionId: "Q16_3",
    text: "Talking to a grieving person about their loss",
    options: [
      { value: 1, label: "1 - Not at all able to" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Very able" }
    ]
  },
  {
    questionId: "Q16_4",
    text: "Talking to a health professional about getting support for a dying person where they live",
    options: [
      { value: 1, label: "1 - Not at all able to" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Very able" }
    ]
  },

  // Q17: Hands-on Care (Practical Knowledge) - 4 items
  {
    questionId: "Q17",
    text: "Providing hands on care. How able are you to do the following, where 1 = not at all able to 5 = very able?",
    options: []
  },
  {
    questionId: "Q17_1",
    text: "Feed or help a person to eat",
    options: [
      { value: 1, label: "1 - Not at all able to" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Very able" }
    ]
  },
  {
    questionId: "Q17_2",
    text: "Wash a person",
    options: [
      { value: 1, label: "1 - Not at all able to" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Very able" }
    ]
  },
  {
    questionId: "Q17_3",
    text: "Lift a person or help them move",
    options: [
      { value: 1, label: "1 - Not at all able to" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Very able" }
    ]
  },
  {
    questionId: "Q17_4",
    text: "Administer injections",
    options: [
      { value: 1, label: "1 - Not at all able to" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Very able" }
    ]
  },

  // Q18: Learning from Experience (Experiential Knowledge) - 5 items
  {
    questionId: "Q18",
    text: "To what extent do you agree with the following? Indicate your response on a scale from 1-5, where 1=do not agree at all and 5=strongly agree. Previous experiences of grief, losing someone, or other important life events have…",
    options: []
  },
  {
    questionId: "Q18_1",
    text: "Made me more emotionally prepared to support others with death dying and bereavement",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },
  {
    questionId: "Q18_2",
    text: "Made me think about what is important and not important in life",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },
  {
    questionId: "Q18_3",
    text: "Developed my wisdom and understanding",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },
  {
    questionId: "Q18_4",
    text: "Made me more compassionate toward myself",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },
  {
    questionId: "Q18_5",
    text: "Made me better prepared to face similar challenges in the future",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },

  // Q19: Factual Knowledge - 7 items
  {
    questionId: "Q19",
    text: "To what extent do you agree with the following? Indicate your response on a scale of 1-5, where 1=do not agree at all and 5=strongly agree",
    options: []
  },
  {
    questionId: "Q19_1",
    text: "I know the rules and regulations when a person dies at home",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },
  {
    questionId: "Q19_2",
    text: "I know what documents are needed when planning for death",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },
  {
    questionId: "Q19_3",
    text: "I know enough about the healthcare system to find the support that a dying person needs",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },
  {
    questionId: "Q19_4",
    text: "I know enough to make decisions about funeral services and options",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },
  {
    questionId: "Q19_5",
    text: "I know how to access palliative care in my area",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },
  {
    questionId: "Q19_6",
    text: "I know enough about how illnesses progress to make decisions about medical treatments at end of life",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },
  {
    questionId: "Q19_7",
    text: "I know about the ways that cemetery staff can be of help around funerals",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },

  // Q20: Accessing Help (Community Knowledge) - 5 items
  {
    questionId: "Q20",
    text: "Others can help me provide end of life care. PLEASE RATE YOUR LEVEL OF AGREEMENT WITH THE FOLLOWING STATEMENTS - If I were to provide end-of-life care for someone, I know people who could help me (on a scale of 1–5 between Strongly disagree and Strongly agree)",
    options: []
  },
  {
    questionId: "Q20_1",
    text: "To get support in the area where I live, e.g., from clubs, associations, or volunteer organizations",
    options: [
      { value: 1, label: "1 - Strongly disagree" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },
  {
    questionId: "Q20_2",
    text: "To get help with providing day to day care for a person at the end of life",
    options: [
      { value: 1, label: "1 - Strongly disagree" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },
  {
    questionId: "Q20_3",
    text: "To get equipment that is required for care",
    options: [
      { value: 1, label: "1 - Strongly disagree" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },
  {
    questionId: "Q20_4",
    text: "To get support that is culturally appropriate for a person",
    options: [
      { value: 1, label: "1 - Strongly disagree" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },
  {
    questionId: "Q20_5",
    text: "To get emotional support for myself",
    options: [
      { value: 1, label: "1 - Strongly disagree" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },

  // Q21: Community Support Groups (Community Knowledge) - 4 items
  {
    questionId: "Q21",
    text: "Support groups in my community. PLEASE RATE YOUR LEVEL OF AGREEMENT WITH THE FOLLOWING STATEMENTS - If I were to provide end of life care for someone, there is support in my community for (on a scale of 1-5 between Strongly disagree to Strongly agree)",
    options: []
  },
  {
    questionId: "Q21_1",
    text: "People with life threatening illnesses",
    options: [
      { value: 1, label: "1 - Strongly disagree" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },
  {
    questionId: "Q21_2",
    text: "People who are nearing the end of their lives",
    options: [
      { value: 1, label: "1 - Strongly disagree" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },
  {
    questionId: "Q21_3",
    text: "People who are caring for a dying person",
    options: [
      { value: 1, label: "1 - Strongly disagree" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },
  {
    questionId: "Q21_4",
    text: "People who are grieving",
    options: [
      { value: 1, label: "1 - Strongly disagree" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 - Strongly agree" }
    ]
  },

  // Q22: Death Competency (9 items, 7-point scale)
  {
    questionId: "Q22",
    text: "PLEASE RATE HOW MUCH YOU AGREE WITH EACH OF THE FOLLOWING STATEMENTS: Indicate your response on a scale of 1-7, where 1=do not agree at all and 7=Completely agree",
    options: []
  },
  {
    questionId: "Q22_1",
    text: "I am aware of the full array of emotions which characterize human grief",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
      { value: 6, label: "6" },
      { value: 7, label: "7 - Completely agree" }
    ]
  },
  {
    questionId: "Q22_2",
    text: "I feel prepared to face my dying process",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
      { value: 6, label: "6" },
      { value: 7, label: "7 - Completely agree" }
    ]
  },
  {
    questionId: "Q22_3",
    text: "I can put words to my gut-level feelings about death and dying",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
      { value: 6, label: "6" },
      { value: 7, label: "7 - Completely agree" }
    ]
  },
  {
    questionId: "Q22_4",
    text: "I know who to contact when death occurs",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
      { value: 6, label: "6" },
      { value: 7, label: "7 - Completely agree" }
    ]
  },
  {
    questionId: "Q22_5",
    text: "I will be able to cope with future losses",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
      { value: 6, label: "6" },
      { value: 7, label: "7 - Completely agree" }
    ]
  },
  {
    questionId: "Q22_6",
    text: "I know how to listen to others, including the terminally ill",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
      { value: 6, label: "6" },
      { value: 7, label: "7 - Completely agree" }
    ]
  },
  {
    questionId: "Q22_7",
    text: "I can help someone with their thoughts and feelings about death and dying",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
      { value: 6, label: "6" },
      { value: 7, label: "7 - Completely agree" }
    ]
  },
  {
    questionId: "Q22_8",
    text: "I would be able to talk to a friend or family member about their death",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
      { value: 6, label: "6" },
      { value: 7, label: "7 - Completely agree" }
    ]
  },
  {
    questionId: "Q22_9",
    text: "I can lessen the anxiety of those around me when the topic is death and dying",
    options: [
      { value: 1, label: "1 - Do not agree at all" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
      { value: 6, label: "6" },
      { value: 7, label: "7 - Completely agree" }
    ]
  },

  // Q23-Q25: Final Demographics
  {
    questionId: "Q23",
    text: "What is your ancestry? Ancestry means a person's ethnic origin or cultural heritage",
    options: [
      { value: 1, label: "Australia" },
      { value: 2, label: "America, including North, South and Central American and Caribbean" },
      { value: 3, label: "Chinese" },
      { value: 4, label: "Filipino" },
      { value: 5, label: "Vietnamese" },
      { value: 6, label: "India" },
      { value: 7, label: "South Korean" },
      { value: 8, label: "Japanese" },
      { value: 9, label: "Other SouthEast and NorthEast Asian" },
      { value: 10, label: "Other Southern and Central Asian" },
      { value: 11, label: "European, including British and Irish" },
      { value: 12, label: "African and Middle Eastern" },
      { value: 13, label: "Oceanian including New Zealand, Melanesian and Papuan, Micronesian and Polynesian" },
      { value: 14, label: "Other, please specify" },
      { value: 15, label: "Prefer not to say / Can't say" }
    ]
  },
  {
    questionId: "Q24",
    text: "Do you believe in afterlife?",
    options: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" }
    ]
  },
  {
    questionId: "Q25",
    text: "Which religion do you identify with?",
    options: [
      { value: 1, label: "Catholic" },
      { value: 2, label: "Anglican (Church of England) Uniting Church" },
      { value: 3, label: "Presbyterian" },
      { value: 4, label: "Buddhism" },
      { value: 5, label: "Islam" },
      { value: 6, label: "Greek Orthodox" },
      { value: 7, label: "Baptist" },
      { value: 8, label: "Hinduism" },
      { value: 9, label: "Spiritual" },
      { value: 10, label: "None" },
      { value: 11, label: "Other (please specify)" },
      { value: 12, label: "Prefer not to say" }
    ]
  }
];

// Convert to database format with proper DLI structure
const convertQuestionsForDB = () => {
  const dbQuestions = [];
  let order = 1;
  
  allSurveyQuestions.forEach(q => {
    const { type, category } = getQuestionTypeAndCategory(q);
    
    // Determine parent question and subcategory for DLI questions
    let parentQuestion = null;
    let subcategory = null;
    let parentText = null;
    let dliScale = null;
    let scoringInfo = { isDLIQuestion: false };
    
    if (q.questionId.includes('_')) {
      parentQuestion = q.questionId.split('_')[0];
      
      // Set DLI subcategories and scoring info
      if (parentQuestion === 'Q16') {
        subcategory = 'Talking Support';
        dliScale = 'practical_talking';
        parentText = 'How able are you to have the following conversations?';
        scoringInfo = {
          isDLIQuestion: true,
          dliDomain: 'Practical Knowledge',
          scaleType: 'ability_scale',
          maxScore: 5
        };
      } else if (parentQuestion === 'Q17') {
        subcategory = 'Hands-on Care';
        dliScale = 'practical_hands_on';
        parentText = 'How able are you to do the following?';
        scoringInfo = {
          isDLIQuestion: true,
          dliDomain: 'Practical Knowledge',
          scaleType: 'ability_scale',
          maxScore: 5
        };
      } else if (parentQuestion === 'Q18') {
        subcategory = 'Learning from Experience';
        dliScale = 'experiential';
        parentText = 'Previous experiences of grief, losing someone, or other important life events have…';
        scoringInfo = {
          isDLIQuestion: true,
          dliDomain: 'Experiential Knowledge',
          scaleType: 'agreement_scale',
          maxScore: 5
        };
      } else if (parentQuestion === 'Q19') {
        subcategory = 'Factual Understanding';
        dliScale = 'factual';
        parentText = 'To what extent do you agree with the following?';
        scoringInfo = {
          isDLIQuestion: true,
          dliDomain: 'Factual Knowledge',
          scaleType: 'agreement_scale',
          maxScore: 5
        };
      } else if (parentQuestion === 'Q20') {
        subcategory = 'Accessing Help';
        dliScale = 'community_help';
        parentText = 'If I were to provide end-of-life care for someone, I know people who could help me';
        scoringInfo = {
          isDLIQuestion: true,
          dliDomain: 'Community Knowledge',
          scaleType: 'agreement_scale',
          maxScore: 5
        };
      } else if (parentQuestion === 'Q21') {
        subcategory = 'Community Support Groups';
        dliScale = 'community_support';
        parentText = 'If I were to provide end of life care for someone, there is support in my community for';
        scoringInfo = {
          isDLIQuestion: true,
          dliDomain: 'Community Knowledge',
          scaleType: 'agreement_scale',
          maxScore: 5
        };
      } else if (parentQuestion === 'Q22') {
        subcategory = null;
        parentText = 'Please rate how much you agree with each of the following statements';
        scoringInfo = {
          isDLIQuestion: false, // Death Competency is separate from DLI
          scaleType: 'agreement_scale',
          maxScore: 7
        };
      }
    }
    
    // Add conditional logic for Q1_1 (Australia states)
    let conditionalLogic = null;
    if (q.questionId === 'Q1_1') {
      conditionalLogic = {
        showIf: {
          questionId: 'Q1',
          value: 'Australia'
        }
      };
    }
    
    const dbQuestion = {
      questionId: q.questionId,
      text: q.text,
      type,
      category,
      subcategory,
      dliScale,
      parentQuestion,
      parentText,
      options: q.options,
      conditionalLogic,
      order: order++,
      scoringInfo,
      isActive: true
    };
    
    dbQuestions.push(dbQuestion);
  });
  
  return dbQuestions;
};
const seedCompleteQuestions = async () => {
  try {    
    // Connect to database directly like your working createAdmin script
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing questions
    await Question.deleteMany({});

    // Convert and insert questions
    const questionsForDB = convertQuestionsForDB();
    const insertedQuestions = await Question.insertMany(questionsForDB);

    // Display summary by category
    const categorySummary = {};
    insertedQuestions.forEach(q => {
      categorySummary[q.category] = (categorySummary[q.category] || 0) + 1;
    });
    // Display DLI-specific summary
    const dliSummary = {};
    insertedQuestions.forEach(q => {
      if (q.scoringInfo.isDLIQuestion) {
        const domain = q.scoringInfo.dliDomain;
        dliSummary[domain] = (dliSummary[domain] || 0) + 1;
      }
    });

    const totalDLI = Object.values(dliSummary).reduce((a, b) => a + b, 0);
    // Verify correct DLI structure
    const expectedStructure = {
      'Practical Knowledge': 8,   // Q16 (4) + Q17 (4)
      'Experiential Knowledge': 5, // Q18 (5)
      'Factual Knowledge': 7,     // Q19 (7)
      'Community Knowledge': 9    // Q20 (5) + Q21 (4)
    };

    const structureCorrect = Object.keys(expectedStructure).every(
      domain => dliSummary[domain] === expectedStructure[domain]
    );

    // Display question order verification
    const dliQuestions = insertedQuestions.filter(q => q.scoringInfo.isDLIQuestion);
    dliQuestions.forEach(q => {
      console.log(`  ${q.questionId}: ${q.scoringInfo.dliDomain} - ${q.subcategory}`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedCompleteQuestions();
}

module.exports = { seedCompleteQuestions, allSurveyQuestions };
