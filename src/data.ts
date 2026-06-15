// English Curriculum & Progress Levels Structure (LingoClimb PWA)

export interface TopicMetadata {
  id: number;
  level: 'Basic' | 'Moderate' | 'High Level';
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  title: string;
  description: string;
  concept: string;
  howToDo: string;
  example: string;
  words: string[];
  sentences: string[];
}

export interface LessonRule {
  concept: string;
  howToDo: string;
  example: string;
}

export interface BaseExercise {
  id: string;
  type: 'meaning-selection' | 'fill-in-the-blank' | 'sentence-scramble' | 'listening-comprehension' | 'dictation';
  prompt: string;
  audioText?: string;
  correctAnswer: string;
  options?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  xpReward: number;
  rule: LessonRule;
  exercises: BaseExercise[];
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export const RAW_UNITS: TopicMetadata[] = [
  {
    id: 1,
    level: 'Basic',
    difficulty: 'A1',
    title: 'First Words',
    description: 'Master warm greetings, primary phonics, numbers 1-10, colors, and simple objects inside your house.',
    concept: 'Simple nouns, colors, and counts (1-10) form the bedrock of conversational English greeting patterns.',
    howToDo: 'Differentiate simple greetings and count visual toys explicitly.',
    example: 'Saying "Hello" or counting "three red apples" on cue.',
    words: ['hello', 'goodbye', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'red', 'blue', 'green', 'yellow', 'apple', 'cat', 'house'],
    sentences: ['Hello, how are you?', 'I have three red apples.', 'The cat is sleeping in the house.']
  },
  {
    id: 2,
    level: 'Basic',
    difficulty: 'A1',
    title: 'Everyday Basics',
    description: 'Communicate about family members, yummy food & drink, garments/clothing, changing weather, and days of the week.',
    concept: 'Daily routines depend on talking about meals, appropriate clothing for the weather, and calendars.',
    howToDo: 'Connect basic family roles and select foods or clothing tenses appropriately.',
    example: '"My brother eats bread on Monday" or "It is warm today, wear a jacket".',
    words: ['mom', 'dad', 'brother', 'sister', 'bread', 'water', 'shirt', 'pants', 'sunny', 'rainy', 'monday', 'tuesday', 'friday'],
    sentences: ['My mom drinks water.', 'I wear blue pants on Friday.', 'It is sunny and hot today.']
  },
  {
    id: 3,
    level: 'Basic',
    difficulty: 'A2',
    title: 'Getting Around',
    description: 'Learn directions, modes of transportation, telling exact clock time, common shops, and wiggling body parts.',
    concept: 'Navigating active cities requires understanding directions, schedule timings, local shops, and anatomy terminology.',
    howToDo: 'Assemble directional chips and match time labels properly.',
    example: '"Turn left at the shop at five o\'clock" or "My leg hurts from walking".',
    words: ['left', 'right', 'straight', 'bus', 'train', 'clock', 'time', 'store', 'market', 'hand', 'foot', 'head', 'body'],
    sentences: ['Turn left at the next street.', 'The train arrives at six o\'clock.', 'He washed his hands at the store.']
  },
  {
    id: 4,
    level: 'Moderate',
    difficulty: 'B1',
    title: 'Present Tense & Actions',
    description: 'Formulate simple verbs, explain your daily routines, express clear likes/dislikes, present continuous, and modals of ability.',
    concept: 'Describing live events utilizes the present continuous tense, and expressing potential relies on can/can\'t.',
    howToDo: 'Fill in active auxiliary verbs and reorder scrambled progressive structures.',
    example: '"I can run fast, but I am resting today." or "She likes cooking pasta."',
    words: ['run', 'jump', 'cook', 'read', 'always', 'never', 'usually', 'like', 'hate', 'playing', 'sleeping', 'can', 'cannot'],
    sentences: ['I am reading a book right now.', 'They always walk to school together.', 'He can play the piano beautifully.']
  },
  {
    id: 5,
    level: 'Moderate',
    difficulty: 'B1',
    title: 'Describing Things',
    description: 'Enhance your adjectives, master prepositions of place, identify possessives, and compare items using comparatives and superlatives.',
    concept: 'Adjectives specify properties, whereas prepositions (under, above) locate items precisely in three-dimensional space.',
    howToDo: 'Select the optimal comparative forms and locate household objects physically.',
    example: '"My house is bigger than yours; your cat sits under the wooden table."',
    words: ['big', 'bigger', 'biggest', 'small', 'under', 'over', 'between', 'mine', 'yours', 'his', 'hers', 'beautiful', 'intelligent'],
    sentences: ['This apple is bigger than that grape.', 'The key is lying under the cozy cushion.', 'Whose bag is this? It is mine.']
  },
  {
    id: 6,
    level: 'Moderate',
    difficulty: 'B2',
    title: 'Past & Future',
    description: 'Differentiate regular and irregular past simple verbs, project goals using "going to" vs "will", and master past continuous tenses.',
    concept: 'Historical events use simple past, whereas predictive statements balance planned targets against spontaneous decisions.',
    howToDo: 'Replace verbs with irregular past forms and match future condition outcomes.',
    example: '"Yesterday I went to the market; tomorrow I will travel to New York."',
    words: ['yesterday', 'tomorrow', 'went', 'saw', 'slept', 'bought', 'will', 'going', 'was', 'were', 'playing', 'studying'],
    sentences: ['We went to London yesterday.', 'She is going to study medicine next year.', 'I was sleeping when the phone rang.']
  },
  {
    id: 7,
    level: 'Moderate',
    difficulty: 'B2',
    title: 'Connecting Ideas',
    description: 'Use coordinate conjunctions, construct advanced question forms, assign advisory modals (should, must), and use adverbs of frequency.',
    concept: 'Cohesive paragraphs use coordinating linkers like because/although, and strong guidelines use should/must.',
    howToDo: 'Insert logical conjunction fillers and choose the appropriate advisory modals.',
    example: '"You must study because the assessment is tough, and you should sleep early."',
    words: ['because', 'although', 'however', 'should', 'must', 'have', 'always', 'rarely', 'seldom', 'why', 'how', 'when'],
    sentences: ['You must wear a seatbelt because it is safe.', 'Although it was rainy, we went hiking anyway.', 'How often do you practice speaking English?']
  },
  {
    id: 8,
    level: 'High Level',
    difficulty: 'C1',
    title: 'Deeper Grammar',
    description: 'Dive into the present perfect tense, zero and first conditionals, relative clauses, and basic passive voice constructions.',
    concept: 'Describing life experiences uses present perfect, and describing cause-and-effect patterns employs conditional tenses.',
    howToDo: 'Solve passive transitions and select conditional clause outcomes.',
    example: '"If it rains tomorrow, we will stay at home. I have lived here for five years."',
    words: ['have', 'has', 'done', 'seen', 'written', 'whom', 'where', 'whose', 'discovered', 'created', 'if', 'unless'],
    sentences: ['I have done my homework.', 'The book was written by an expert author.', 'If you study hard, you will pass easily.']
  },
  {
    id: 9,
    level: 'High Level',
    difficulty: 'C1',
    title: 'Real Conversations',
    description: 'Enrich speech using popular idioms, versatile phrasal verbs, reported speech structures, and sophisticated polite requests.',
    concept: 'Fluent interactions require natural idiomatic phrasing, phrasal verbs (look up, carry on), and reported speech rules.',
    howToDo: 'Translate standard descriptions to phrasal verbs and build polite requests.',
    example: '"Could you please look up that word? He told me he would carry on practicing."',
    words: ['break', 'carry', 'look', 'told', 'asked', 'said', 'would', 'could', 'please', 'favor', 'mind', 'generous'],
    sentences: ['Could you please tell me how to reach the nearest bank?', 'He said that he was studying for the exam.', 'I must look up the definition of this phrasal verb.']
  },
  {
    id: 10,
    level: 'High Level',
    difficulty: 'C2',
    title: 'Fluent & Advanced',
    description: 'Distinguish formal from informal language, formulate complex conditionals, acquire advanced vocabulary, and compose opinion expressions.',
    concept: 'Highest fluency balances professional prose, advanced academic vocabulary, and nuanced abstract logic.',
    howToDo: 'Subdivide sentences for subtle logical fallacies and match formal variants.',
    example: '"Had I known the parameters of the test, I would have prepared meticulously."',
    words: ['meticulous', 'paramount', 'obsolete', 'diligent', 'nevertheless', 'consequently', 'furthermore', 'academic', 'logical', 'paradox'],
    sentences: ['Paramount diligence is required for high academic success.', 'Had they arrived earlier, they would have seen the performance.', 'Nevertheless, the factual evidence supports our initial thesis.']
  }
];

// PROGRAMMATIC SYLLABUS BUILDER
// Expands the RAW_UNITS config into exactly 10 Units.
// Each Unit contains exactly 5 Parts (Lessons).
// Question generation is powered dynamically by Artificial Intelligence (Gemini) delivering exactly 12 questions per lesson!
// Also attaches the essential "First Teach" rules (concept, howToDo, example) for each lesson.
export function generateCurriculum(): Unit[] {
  return RAW_UNITS.map((raw) => {
    const unitId = `unit_${raw.id}`;
    const levelPrefix = raw.level === 'Basic' ? '👶 Basic Level' : raw.level === 'Moderate' ? '🤝 Moderate Level' : '🚀 High Level';
    const unitTitle = `${levelPrefix} - Unit ${raw.id}: ${raw.title}`;

    const lessons: Lesson[] = [];

    // Formulate 5 progressive Parts (Lessons) for this Unit
    for (let partIdx = 1; partIdx <= 5; partIdx++) {
      const lessonId = `u${raw.id}_p${partIdx}`;
      let partTitle = '';
      let partDesc = '';
      let concept = '';
      let howToDo = '';
      let example = '';

      // Create Custom Theme for each of the 5 lessons based on part index
      if (partIdx === 1) {
        partTitle = `Part 1: Foundational Vocabulary Lab`;
        partDesc = `Learn and test key dictionary terms of "${raw.title}".`;
        concept = `To learn any language, you must first master core nouns and terms. ${raw.concept}`;
        howToDo = `Match vocabulary words directly with meanings, select synonyms, and pay close attention to letter spellings.`;
        example = `For instance: the word "${raw.words[0]}" represents a central concept here. Example: "${raw.sentences[0]}"`;
      } else if (partIdx === 2) {
        partTitle = `Part 2: Spelling & Syntax Construction`;
        partDesc = `Learn how to place letters and compose structural terms neatly.`;
        concept = `Correct word spelling and verb agreements form the bedrock of clear communication.`;
        howToDo = `Type exact spelling representations, fill in critical letter blanks, and correct minor grammatical typos.`;
        example = `For instance: a correct sentence is "${raw.sentences[1]}". Pay attention to details.`;
      } else if (partIdx === 3) {
        partTitle = `Part 3: Daily Conversational Phrasing`;
        partDesc = `Express full ideas, ask polite helper queries, and assemble structures.`;
        concept = `Sentences are formed by arranging subjects, active verbs, and descriptive adjectives in proper order.`;
        howToDo = `Rearrange scattered word chips into fully functional English sentences and solve blanks.`;
        example = `Correct structure: "${raw.sentences[2]}". Feel the rhythm of punctuation!`;
      } else if (partIdx === 4) {
        partTitle = `Part 4: Auditory Labs & Listening Comprehension`;
        partDesc = `Sharpen your pronunciation and understand native spoken tracks.`;
        concept = `Listening to clear voice pitches allows your brain to pair spoken phonics with physical text.`;
        howToDo = `Tap the blue speaker button to hear voice inputs. Choose corresponding matches or type dictated words.`;
        example = `You will hear phonetic sounds like: "${raw.sentences[0]}". Read along silently.`;
      } else {
        partTitle = `Part 5: Unit Mastery Assessment`;
        partDesc = `Challenge your skills and solidify high efficiency across this unit.`;
        concept = `Solidifying skills requires testing all lexical, spelling, and listening competencies.`;
        howToDo = `Solve the mixed list of dictations, active scramble puzzles, and multi-choice definitions on the first try.`;
        example = `Success criteria: Perfecting structures like "${raw.sentences[1]}" and "${raw.sentences[2]}".`;
      }

      lessons.push({
        id: lessonId,
        title: partTitle,
        description: partDesc,
        difficulty: raw.difficulty,
        xpReward: 15,
        rule: { concept, howToDo, example },
        exercises: []
      });
    }

    return {
      id: unitId,
      title: unitTitle,
      description: raw.description,
      lessons
    };
  });
}

export const CURRICULUM: Unit[] = generateCurriculum();
