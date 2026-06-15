/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Unit, Lesson, BaseExercise } from './types';

export const LEAGUE_NAMES = [
  'Bronze League',
  'Silver League',
  'Gold League',
  'Sapphire League',
  'Ruby League',
  'Diamond League'
];

interface TopicMetadata {
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

const RAW_UNITS: TopicMetadata[] = [
  // --- BASIC LEVEL (Units 1 - 15) ---
  {
    id: 1,
    level: 'Basic',
    difficulty: 'A1',
    title: 'Alphabet & Phonics Basics',
    description: 'Start learning English with primary sounds and letters like active 5-year-olds.',
    concept: 'Every English letter has a unique phonic sound.',
    howToDo: 'Listen to the sound, find the object that begins with the letter, and recognize its pronunciation.',
    example: '"A" sounds like "ah" in Apple. "C" sounds like "kuh" in Cat.',
    words: ['apple', 'banana', 'cat', 'dog', 'egg'],
    sentences: ['See the cat.', 'I want an apple.', 'The dog is sleeping.']
  },
  {
    id: 2,
    level: 'Basic',
    difficulty: 'A1',
    title: 'Count Your Toys (1 to 5)',
    description: 'Master first simple numbers and counting toy treasures.',
    concept: 'Numbers count physical objects: 1, 2, 3, 4, and 5.',
    howToDo: 'Select the correct quantity of items and practice counting aloud.',
    example: 'I have "one" happy puppy. Here are "two" little cars.',
    words: ['one', 'two', 'three', 'four', 'five'],
    sentences: ['I see one bird.', 'Give me three toys.', 'Four happy babies.']
  },
  {
    id: 3,
    level: 'Basic',
    difficulty: 'A1',
    title: 'Colors of the Rainbow',
    description: 'Recognize bright colors and label beautiful crayons.',
    concept: 'Colors describe the visual appearance of nature.',
    howToDo: 'Match the common objects with their natural hues and select correct color descriptors.',
    example: 'The strawberry is "red". The sunny sky shines bright "blue".',
    words: ['red', 'blue', 'green', 'yellow', 'pink'],
    sentences: ['A green leaf.', 'The sky is blue.', 'I like yellow bananas.']
  },
  {
    id: 4,
    level: 'Basic',
    difficulty: 'A1',
    title: 'Our Warm Family Members',
    description: 'Introduce your lovely family like mommy, daddy, and siblings.',
    concept: 'Family members are labeled by their loving roles.',
    howToDo: 'Name the beautiful relatives living with you and form cute greetings.',
    example: 'This is my "mom". She smiles. That is my loving "dad".',
    words: ['mom', 'dad', 'sister', 'brother', 'baby'],
    sentences: ['I love my mom.', 'My sister plays.', 'The sweet baby sleeps.']
  },
  {
    id: 5,
    level: 'Basic',
    difficulty: 'A1',
    title: 'Pristine Body Parts',
    description: 'Wiggle your toes and label head, eyes, nose, and ears.',
    concept: 'Body part descriptors identify our biological anatomy.',
    howToDo: 'Tap the body parts on cue and choose the corresponding names.',
    example: 'Close your "eyes" to sleep. Touch your cute "nose".',
    words: ['head', 'eyes', 'nose', 'mouth', 'ears'],
    sentences: ['My eyes are bright.', 'Touch your warm nose.', 'Open your mouth.']
  },
  {
    id: 6,
    level: 'Basic',
    difficulty: 'A1',
    title: 'Friendly Animals',
    description: 'Meet kind animals on the farm like cows, sheep, and birds.',
    concept: 'Animals have unique cute names and make magical sounds.',
    howToDo: 'Match animal species with their simple names and sound descriptions.',
    example: 'The "cow" says moo. The soft "sheep" crawls on the grass.',
    words: ['cow', 'sheep', 'bird', 'fish', 'horse'],
    sentences: ['A yellow bird flies.', 'The fish can swim.', 'The cute cow eats grass.']
  },
  {
    id: 7,
    level: 'Basic',
    difficulty: 'A1',
    title: 'Yummy Fruit Treats',
    description: 'Taste sweet grapes, yellow bananas, and red strawberries.',
    concept: 'Fruits are healthy, delicious, and natural treats.',
    howToDo: 'Compare shapes, identify colors of delicious fruits, and solve blanks.',
    example: 'A ripe "banana" is yellow, long, and super tasty.',
    words: ['banana', 'grape', 'orange', 'melon', 'berry'],
    sentences: ['I eat a yellow banana.', 'An orange is round.', 'Grapes are very sweet.']
  },
  {
    id: 8,
    level: 'Basic',
    difficulty: 'A2',
    title: 'Things in My Cute Bedroom',
    description: 'Explore cozy rooms: beds, tables, chairs, and blankets.',
    concept: 'Furniture and toys form the bedroom environment.',
    howToDo: 'State what household object you are pointing at and structure greetings.',
    example: 'I sleep on a soft "bed". The "toy" sits on my chair.',
    words: ['bed', 'desk', 'chair', 'toy', 'book'],
    sentences: ['My bed is comfy.', 'Open the colorful book.', 'Sit on the brown chair.']
  },
  {
    id: 9,
    level: 'Basic',
    difficulty: 'A2',
    title: 'Simple Action Words',
    description: 'Play and express activities like run, jump, sleep, and eat.',
    concept: 'Action verbs explain what people or animals are currently doing.',
    howToDo: 'Match physical actions to their verb words and complete puzzle rows.',
    example: 'I love to "jump" up high. The birds "sing" sweetly.',
    words: ['run', 'jump', 'sleep', 'eat', 'walk'],
    sentences: ['Dogs can run fast.', 'Do play and jump.', 'I sleep at night.']
  },
  {
    id: 10,
    level: 'Basic',
    difficulty: 'A2',
    title: 'Polite Words & Greetings',
    description: 'Say hello, goodbye, thank you, and please with a smile.',
    concept: 'Respectful expressions build friendship and beautiful days.',
    howToDo: 'Determine when to use appreciation phrases and solve conversations.',
    example: 'Always say "please" when asking, and "thank you" when receiving.',
    words: ['hello', 'goodby', 'thanks', 'please', 'sorry'],
    sentences: ['Say hello to everyone.', 'Thank you very much.', 'Please help me now.']
  },
  {
    id: 11,
    level: 'Basic',
    difficulty: 'A2',
    title: 'The Atmospheric Sky',
    description: 'Look up at the shining sun, glowing moon, and white clouds.',
    concept: 'The sky is home to celestial objects and changing weather.',
    howToDo: 'Distinguish day objects from night objects and match terms.',
    example: 'The "sun" shines during warm days. The "moon" glows softly at night.',
    words: ['sun', 'moon', 'star', 'cloud', 'rain'],
    sentences: ['The golden sun shines.', 'A grey cloud is heavy.', 'Stars twinkle at night.']
  },
  {
    id: 12,
    level: 'Basic',
    difficulty: 'A2',
    title: 'Beautiful Shapes',
    description: 'Trace circles, draw basic squares, and find twinkle stars.',
    concept: 'Shapes define the structural outline of objects.',
    howToDo: 'Map general visual outlines to correct geometric titles.',
    example: 'A rolling ball has a "circle" shape. The toy block is a "square".',
    words: ['circle', 'square', 'star', 'heart', 'ring'],
    sentences: ['Draw a perfect circle.', 'A star is in the box.', 'My toy blocks are square.']
  },
  {
    id:13,
    level: 'Basic',
    difficulty: 'A2',
    title: 'Sweet Breakfast Foods',
    description: 'Enjoy delicious daily items like milk, bread, and water.',
    concept: 'Nourishment keeps our bodies strong and full of happy energy.',
    howToDo: 'Choose the correct drink/food types for healthy mornings.',
    example: 'Pour fresh "milk" into the red glass. Eat a slice of "bread".',
    words: ['milk', 'bread', 'egg', 'water', 'cake'],
    sentences: ['Drink clean water daily.', 'Pour some white milk.', 'I like warm bread.']
  },
  {
    id: 14,
    level: 'Basic',
    difficulty: 'A2',
    title: 'My Cute Dress Clothes',
    description: 'Put on tiny hats, warm shirts, cute socks, and shoes.',
    concept: 'Clothing protect our bodies and keep us warm.',
    howToDo: 'Identify suitable wear for sunshine or cold snow and complete sentences.',
    example: 'Tie your "shoes" before going out. Wear a blue "hat" on sunny days.',
    words: ['hat', 'shirt', 'shoe', 'coat', 'socks'],
    sentences: ['Wear a warm coat.', 'These shoes are blue.', 'I have clean white socks.']
  },
  {
    id: 15,
    level: 'Basic',
    difficulty: 'A2',
    title: 'Expressing Happy Feelings',
    description: 'Describe states of mind: happy, sad, excited, or sleepy.',
    concept: 'Feelings represent our current emotional moods.',
    howToDo: 'Correlate facial expressions with descriptive feeling words.',
    example: 'I smile when I feel "happy". I yawn when I am "sleepy".',
    words: ['happy', 'sad', 'angry', 'tired', 'glad'],
    sentences: ['A happy children smiles.', 'I feel tired today.', 'Do not be sad.']
  },

  // --- MODERATE LEVEL (Units 16 - 30) ---
  {
    id: 16,
    level: 'Moderate',
    difficulty: 'B1',
    title: 'Our Active School Garden',
    description: 'Review common classroom rules, desks, pencils, and playground safety.',
    concept: 'Academic environments are guided by structured spaces and tools.',
    howToDo: 'Assemble relative descriptions, label academic tools, and describe tasks.',
    example: 'The "teacher" writes notes. Use a sharp "pencil" to write your ideas.',
    words: ['teacher', 'pencil', 'desk', 'garden', 'student'],
    sentences: ['Our teacher is very sweet.', 'Write with a yellow pencil.', 'Desks are in a solid row.']
  },
  {
    id: 17,
    level: 'Moderate',
    difficulty: 'B1',
    title: 'Telling Time on Clocks',
    description: 'Learn o clock, half past, and quarter hour ticks.',
    concept: 'Clocks split twenty-four hours into minutes and steady ticks.',
    howToDo: 'Read analog numbers, compute current schedules, and identify intervals.',
    example: 'It is "half past" eight in the morning. We must arrive on time.',
    words: ['hour', 'clock', 'minute', 'half', 'quarter'],
    sentences: ['Check the kitchen clock.', 'Wait for a quiet minute.', 'It is half past ten.']
  },
  {
    id: 18,
    level: 'Moderate',
    difficulty: 'B1',
    title: 'Our Weekday Schedules',
    description: 'Navigate school schedules from Monday to peaceful Sundays.',
    concept: 'We divide seven-day weeks into work plans and weekend rests.',
    howToDo: 'Map weekdays chronologically and construct routine paragraphs.',
    example: 'On "Monday" we start our jobs. On "Sunday" we resting quietly.',
    words: ['Monday', 'Tuesday', 'Friday', 'Sunday', 'lunch'],
    sentences: ['Monday is a busy day.', 'I rest on beautiful Sunday.', 'Eat a healthy lunch.']
  },
  {
    id: 19,
    level: 'Moderate',
    difficulty: 'B1',
    title: 'Creative Hobbies',
    description: 'Describe healthy routines: soccer, beautiful melodies, and reading books.',
    concept: 'Hobbies are fun personal activities we do in free recreation times.',
    howToDo: 'Define active sports, express preferences, and assemble verb phrases.',
    example: 'My favorite pastime is playing "soccer" with friends.',
    words: ['soccer', 'music', 'book', 'game', 'swim'],
    sentences: ['He listens to sweet music.', 'I read a library book.', 'They play soccer together.']
  },
  {
    id: 20,
    level: 'Moderate',
    difficulty: 'B1',
    title: 'Ordering Treats & Drinks',
    description: 'Interact in lovely cafes, order fresh cookies, and request water.',
    concept: 'Cafe etiquette uses polite requests whenordering dynamic products.',
    howToDo: 'Formulate polite dining queries and check ingredient options.',
    example: 'Could we please order active "cookies" with fresh tap "water"?',
    words: ['cookie', 'water', 'soup', 'salad', 'bread'],
    sentences: ['One chocolate cookie please.', 'Bring warm tomato soup.', 'I ordered a green salad.']
  },
  {
    id: 21,
    level: 'Moderate',
    difficulty: 'B1',
    title: 'Simple Map Navigation',
    description: 'Go straight, turn left, turn right, and read regional maps.',
    concept: 'Wayfinding relies on clear directional keywords and distance.',
    howToDo: 'Re-order commands, read spatial descriptors, and guide travelers.',
    example: 'Turn "left" at the bookstore, then walk "straight" past the post office.',
    words: ['straight', 'left', 'right', 'map', 'street'],
    sentences: ['Go straight down the lane.', 'The bank is on the left.', 'Check the local travel map.']
  },
  {
    id: 22,
    level: 'Moderate',
    difficulty: 'B1',
    title: 'Buying at the Local Market',
    description: 'Inquire prices, verify coin changes, and manage shopping bills.',
    concept: 'Exchanging money requires math and clear buyer vocabularies.',
    howToDo: 'Understand cost inquiries and calculate simple change returns.',
    example: 'The "price" is five "dollars". Can I buy this sweet bread?',
    words: ['buy', 'sell', 'coin', 'price', 'dollar'],
    sentences: ['How much is the price?', 'Pay with a smart dollar coin.', 'I want to buy food.']
  },
  {
    id: 23,
    level: 'Moderate',
    difficulty: 'B1',
    title: 'The Changing Seasons',
    description: 'Differentiate spring flowers, summer heat, autumn leaves, and winter snow.',
    concept: 'Climatic changes cycle our planet through four diverse seasons.',
    howToDo: 'Label appropriate seasonal weather attributes and answer logic prompts.',
    example: 'In "winter" everything is frozen. In "summer" we wear light hats.',
    words: ['spring', 'summer', 'autumn', 'winter', 'rain'],
    sentences: ['Spring brings cute flowers.', 'Summer is hot and bright.', 'Cold snow falls in winter.']
  },
  {
    id: 24,
    level: 'Moderate',
    difficulty: 'B1',
    title: 'Prepositions of Placement',
    description: 'Use descriptors like inside, outside, under, behind, and between.',
    concept: 'Prepositions define the exact spatial relationships of physical bodies.',
    howToDo: 'Solve puzzle sentences by selecting correct locator words.',
    example: 'The cat sleeps "under" the bed. The ball is "inside" the chest.',
    words: ['inside', 'outside', 'under', 'behind', 'between'],
    sentences: ['The book sits inside the box.', 'Walk outside in the sun.', 'The cat is under the desk.']
  },
  {
    id: 25,
    level: 'Moderate',
    difficulty: 'B1',
    title: 'Comparative Adjectives',
    description: 'Build structures using words like taller, faster, and bigger.',
    concept: 'Comparatives rank attributes dynamically between two distinct targets.',
    howToDo: 'Compare dimensions, apply comparative suffixes, and check syntax.',
    example: 'The majestic lion is "bigger" and "faster" than a household cat.',
    words: ['bigger', 'smaller', 'faster', 'slower', 'taller'],
    sentences: ['He is taller than me.', 'A train goes faster.', 'The toy box is smaller.']
  },
  {
    id: 26,
    level: 'Moderate',
    difficulty: 'B1',
    title: 'Past Tense Walkways',
    description: 'Form simple regular past verbs like walked, played, and smiled.',
    concept: 'The simple past tense denotes actions that completed fully in prior times.',
    howToDo: 'Add regular verb suffixes and trace chronological events.',
    example: 'Yesterday morning, we "walked" down the river and "played" happy games.',
    words: ['walked', 'played', 'slept', 'cooked', 'smiled'],
    sentences: ['They played outside yesterday.', 'I slept ten restful hours.', 'She smiled at our funny joke.']
  },
  {
    id: 27,
    level: 'Moderate',
    difficulty: 'B1',
    title: 'Future Intentions',
    description: 'Use "will" or "going to" to establish planned schedules.',
    concept: 'Future tenses convey plans or firm predictions that lie ahead.',
    howToDo: 'Assemble auxiliary modal verbs with core present action stems.',
    example: 'We are "going to" visit our warm family "tomorrow" morning.',
    words: ['tomorrow', 'future', 'plans', 'will', 'going'],
    sentences: ['We will start tomorrow.', 'What are your future plans?', 'I am going to swim later.']
  },
  {
    id: 28,
    level: 'Moderate',
    difficulty: 'B1',
    title: 'Polite Helper Modals',
    description: 'Differentiate "could you", "would you", and "may I".',
    concept: 'Modal auxiliaries soften imperative commands into beautiful courtesy.',
    howToDo: 'Pick appropriate polite structures to solve corporate/cafe blanks.',
    example: '"Could you" please lend me your pencil for a quick minute?',
    words: ['could', 'would', 'please', 'might', 'shall'],
    sentences: ['Could you open the window?', 'Would you like some tea?', 'I shall write it down.']
  },
  {
    id: 29,
    level: 'Moderate',
    difficulty: 'B1',
    title: 'Our Clean Healthy Habits',
    description: 'Discuss eating green salads, exercising regularly, and hydration.',
    concept: 'Healthy practices maintain strength and biological longevity.',
    howToDo: 'Read nutritional advice and resolve active habit phrases.',
    example: 'It is highly healthy to drink fresh "water" and do daily physical "sports".',
    words: ['health', 'water', 'sport', 'fruit', 'exercise'],
    sentences: ['I take exercise every morning.', 'Fresh water is very clean.', 'Fruit keeps you healthy.']
  },
  {
    id: 30,
    level: 'Moderate',
    difficulty: 'B1',
    title: 'Wonderful Animal Habitats',
    description: 'Compare marine oceans, deep jungles, arid deserts, and damp rivers.',
    concept: 'Different biomes house custom-adapted biological organisms.',
    howToDo: 'Connect ecological features with their corresponding geographical titles.',
    example: 'Fierce tigers live in the lush green "jungle". Sea fishes live in "oceans".',
    words: ['ocean', 'forest', 'desert', 'jungle', 'river'],
    sentences: ['A whale lives in the ocean.', 'The jungle has tall green trees.', 'Desert weather is hot.']
  },

  // --- HIGH LEVEL (Units 31 - 45) ---
  {
    id: 31,
    level: 'High Level',
    difficulty: 'C1',
    title: 'Executive Cover Letters',
    description: 'Present career accolades, lead corporate visions, and outline qualities.',
    concept: 'Professional correspondence demands persuasive vocabulary and assertive verbs.',
    howToDo: 'Arrange standard letter openings, supply career attributes, and assemble lines.',
    example: 'I wish to "spearhead" collaborative efforts to "innovate" your digital vision.',
    words: ['spearhead', 'innovate', 'dynamic', 'lead', 'vision'],
    sentences: ['I will spearhead this project.', 'We must innovate our services.', 'Describe your dynamic career.']
  },
  {
    id: 32,
    level: 'High Level',
    difficulty: 'C1',
    title: 'The STAR Interview Method',
    description: 'Deliver structured interview answers specifying precise metrics.',
    concept: 'The STAR format divides narratives into Situation, Task, Action, and Result.',
    howToDo: 'Formulate chronological career highlights and append operational stats.',
    example: 'The "result" of my tactical "action" led to a forty percent gain in output.',
    words: ['situation', 'task', 'action', 'result', 'metrics'],
    sentences: ['Outline the critical situation.', 'We achieved a positive result.', 'Use metrics to show success.']
  },
  {
    id: 33,
    level: 'High Level',
    difficulty: 'C1',
    title: 'Sophisticated Contrast Markers',
    description: 'Apply connectors like notwithstanding, converse, and nonetheless.',
    concept: 'Advanced transitions connect opposing theories with intellectual poise.',
    howToDo: 'Insert contrast structures into complex compound logical arguments.',
    example: '"Notwithstanding" our temporary loss, our user metrics remained "conversely" high.',
    words: ['notwithstand', 'conversely', 'nonetheless', 'however', 'although'],
    sentences: ['We failed, nonetheless we learned.', 'Conversely, we might succeed.', 'Although risky, it is vital.']
  },
  {
    id: 34,
    level: 'High Level',
    difficulty: 'C1',
    title: 'Executive Compensation Plans',
    description: 'Negotiate comprehensive salary limits, stock equities, and custom benefits.',
    concept: 'Senior compensation pairs base financial wages with performance equity.',
    howToDo: 'Formulate diplomatic requests regarding bonuses, benefits, and contract rules.',
    example: 'He negotiated a "competitive" package including substantial "equity" and bonus options.',
    words: ['competitive', 'benefits', 'base', 'equity', 'bonus'],
    sentences: ['We offer a competitive package.', 'Calculate your legal equity options.', 'Ask about healthcare benefits.']
  },
  {
    id: 35,
    level: 'High Level',
    difficulty: 'C1',
    title: 'Academic Debate Etiquette',
    description: 'Express reservations politely and dissect philosophical assumptions.',
    concept: 'Intellectual friction uses careful qualifiers to prevent personal offense.',
    howToDo: 'Construct counter-theses using mitigated transitions of disagreement.',
    example: 'I accept your academic "thesis" only up to a limited "point" due to reservations.',
    words: ['subjective', 'reservation', 'perspective', 'analytical', 'thesis'],
    sentences: ['I state these reservations clearly.', 'That is a subjective opinion.', 'Her thesis is highly analytical.']
  },
  {
    id: 36,
    level: 'High Level',
    difficulty: 'C1',
    title: 'Rich Idiomatic Expressions',
    description: 'Use terms like "under the weather" and "piece of cake".',
    concept: 'Idioms convey metaphorical cultural ideas beyond dry literal syntax.',
    howToDo: 'Decipher figurative expressions and match them with true semantic intentions.',
    example: 'Learning these 45 units is a complete "piece of cake" for diligent students.',
    words: ['weather', 'cook', 'cake', 'nail', 'rocket'],
    sentences: ['I fell under the weather.', 'That puzzle was a piece of cake.', 'You hit the nail on the head.']
  },
  {
    id: 37,
    level: 'High Level',
    difficulty: 'C1',
    title: 'Corporate Dashboard Syncs',
    description: 'Review digital transformations, automation, database migrations, and conversions.',
    concept: 'Modern operations depend on cloud metrics, user conversions, and data flows.',
    howToDo: 'Analyze performance curves, label database migration tasks, and check indicators.',
    example: 'We performed the cloud "migration" to streamline user "conversion rates" heavily.',
    words: ['migration', 'automation', 'conversion', 'analytics', 'systems'],
    sentences: ['The platform migration succeeded.', 'We track dynamic automation lines.', 'Check your conversion rate.']
  },
  {
    id: 38,
    level: 'High Level',
    difficulty: 'C1',
    title: 'Deductive Scientific Research',
    description: 'Synthesize academic hypotheses, research methodologies, and correlations.',
    concept: 'Empirical science gathers rigorous proof to confirm or refute a thesis.',
    howToDo: 'Compare research approaches and draw clean logical conclusions.',
    example: 'Our research "methodology" found a direct "correlation" between training and memory.',
    words: ['paradigm', 'hypothesis', 'methodology', 'correlation', 'data'],
    sentences: ['Formulate a clear hypothesis.', 'Analyze the academic study research.', 'Determine the direct correlation.']
  },
  {
    id: 39,
    level: 'High Level',
    difficulty: 'C1',
    title: 'Hypothetical Conditional Tenses',
    description: 'Master compound past conditions: "if I had been...", "would have done".',
    concept: 'Third conditionals explore past alternative timelines that never transpired.',
    howToDo: 'Synthesize auxiliary perfect verbs to reflect on past hypothetical outcomes.',
    example: 'If they "had been" more vigilant, the system "would have survived" the audit.',
    words: ['scenario', 'alternative', 'outcome', 'suppose', 'otherwise'],
    sentences: ['Suppose a different scenario.', 'Consider the alternative route.', 'Otherwise, the project fails.']
  },
  {
    id: 40,
    level: 'High Level',
    difficulty: 'C1',
    title: 'Ecological Green Economics',
    description: 'Analyze carbon footprints, complex environmental audits, and ecosystems.',
    concept: 'Sustainable economics calculates natural resource consumption against output.',
    howToDo: 'Propose green carbon solutions and solve sustainability quizzes.',
    example: 'We must execute a technical audit to reduce our "carbon footprint" immediately.',
    words: ['footprint', 'carbon', 'ecosystem', 'reduction', 'sustainable'],
    sentences: ['Reduce your carbon footprint.', 'Support a green energy source.', 'Protect the fragile ecosystem.']
  },
  {
    id: 41,
    level: 'High Level',
    difficulty: 'C1',
    title: 'Agile Project Management',
    description: 'Formulate delegative pipelines, streamline sprint backlogs, and meet deadlines.',
    concept: 'Successful delivery breaks massive projects into incremental milestones.',
    howToDo: 'Model coordination roles and practice task assignment sentences.',
    example: 'We must "streamline" active tasks to secure our core quarter "deadlines".',
    words: ['streamline', 'coordinate', 'output', 'delegation', 'deadline'],
    sentences: ['Streamline corporate pipelines.', 'We must meet this strict deadline.', 'Promote effective delegation.']
  },
  {
    id: 42,
    level: 'High Level',
    difficulty: 'C1',
    title: 'Fiscal Audits & Overheads',
    description: 'Address net revenue streams, operational budgets, and financial dividends.',
    concept: 'Accountancy tracks inbound cash flows against heavy administrative liabilities.',
    howToDo: 'Verify arithmetic assertions and balance budget spreadsheets.',
    example: 'Our "return on investment" grew because we shaved administrative "overheads".',
    words: ['revenue', 'invoice', 'fiscal', 'overheads', 'valuation'],
    sentences: ['The company reports low overheads.', 'Review the next fiscal audit.', 'Our net revenue has doubled.']
  },
  {
    id: 43,
    level: 'High Level',
    difficulty: 'C1',
    title: 'Corporate Crisis Diplomacy',
    description: 'Mitigate hostile corporate escalations, active listening, and compromises.',
    concept: 'Conflict resolution builds shared consensus through active validation.',
    howToDo: 'Write respectful, de-escalating replies to disgruntled team demands.',
    example: 'We must practice "active listening" to build "consensus" and "mitigate" friction.',
    words: ['mitigate', 'negotiate', 'consensus', 'listening', 'perspective'],
    sentences: ['Mitigate teammate escalations.', 'Build a shared company consensus.', 'Value each worker perspective.']
  },
  {
    id: 44,
    level: 'High Level',
    difficulty: 'C1',
    title: 'Mastering Eloquent Vocabulary',
    description: 'Integrate advanced words like paramount, meticulous, and obsolete.',
    concept: 'Precise lexical options amplify the descriptive sharpness of executive prose.',
    howToDo: 'Replace plain verbs and adjectives with their sophisticated counterparts.',
    example: 'It is "paramount" that we maintain "meticulous" standards in our engineering.',
    words: ['paramount', 'meticulous', 'elaborate', 'obsolete', 'diligent'],
    sentences: ['Meticulous care is paramount.', 'This software is completely obsolete.', 'Give an elaborate explanation.']
  },
  {
    id: 45,
    level: 'High Level',
    difficulty: 'C1',
    title: 'Abstract Epistemology & Logic',
    description: 'Debate rationalism theories, empiricism evidence, and complex ethical paradigms.',
    concept: 'High philosophy balances empirical sensory experiences against pure logical reason.',
    howToDo: 'Deconstruct structural arguments for logical fallacies and identify paradoxes.',
    example: 'His advanced "rationalism" thesis presented a fascinating ethical "paradox".',
    words: ['rationalism', 'empirical', 'logic', 'paradox', 'ethical'],
    sentences: ['Apply pure mathematical logic.', 'Empirical proof is vital.', 'This creates a true paradox.']
  }
];

// PROGRAMMATIC SYLLABUS BUILDER
// Expands the RAW_UNITS config into exactly 45 Units.
// Each Unit contains exactly 5 Parts (Lessons).
// Each Part (Lesson) contains exactly 3 Exercises (Sub-Parts).
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
        example = `For instance: a correct sentence is "${raw.sentences[1]}". Pay attention of details.`;
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

      // Generate 3 sub-parts (exercises) for this exact Part
      const exercises: BaseExercise[] = [];

      // Sub-Part A (Exercise 1) - Interactive Word / Translation Selection
      if (partIdx === 1 || partIdx === 5) {
        exercises.push({
          id: `${lessonId}_s1`,
          type: 'meaning-selection',
          prompt: `Select the correct English definition for "${raw.words[0]}"`,
          correctAnswer: `The primary term representing ${raw.words[0]} in the context of ${raw.title}.`,
          options: [
            `The primary term representing ${raw.words[0]} in the context of ${raw.title}.`,
            `A totally unrelated random item or speed test decoy.`,
            `To run in circles extremely fast without any purpose.`
          ],
          hint: `It directly represents "${raw.words[0]}".`
        });
      } else {
        // Sentence Scramble
        const scrambleWords = raw.sentences[1].split(' ');
        exercises.push({
          id: `${lessonId}_s1`,
          type: 'sentence-scramble',
          prompt: `Arrange the words to form this clean statement:`,
          correctAnswer: raw.sentences[1],
          options: [...scrambleWords].sort(() => Math.random() - 0.5),
          hint: `Starts with "${scrambleWords[0]}".`
        });
      }

      // Sub-Part B (Exercise 2) - Fill-in-the-blank Construction
      const blankWord = raw.words[Math.min(partIdx, raw.words.length - 1)];
      const targetSentence = raw.sentences[partIdx % raw.sentences.length];
      const replacedSentence = targetSentence.replace(new RegExp(`\\b${blankWord}\\b`, 'gi'), '_____');

      exercises.push({
        id: `${lessonId}_s2`,
        type: 'fill-in-the-blank',
        prompt: `Select the missing word to complete this unit pattern: "${replacedSentence}"`,
        correctAnswer: blankWord,
        options: [blankWord, 'something', 'always'],
        hint: `The correct vocabulary word is: "${blankWord}".`
      });

      // Sub-Part C (Exercise 3) - Listening Phonics Comprehension / Dictation
      const spokenText = raw.sentences[2];
      if (partIdx % 2 === 0) {
        exercises.push({
          id: `${lessonId}_s3`,
          type: 'listening-comprehension',
          prompt: `Listen closely and select what sound is dictated:`,
          audioText: spokenText,
          correctAnswer: spokenText,
          options: [
            spokenText,
            `A completely different spoken phrase logic.`,
            `Please stand outside and check the weather.`
          ],
          hint: `The speaker dictates: "${spokenText}".`
        });
      } else {
        exercises.push({
          id: `${lessonId}_s3`,
          type: 'dictation',
          prompt: `Listen and type the sentence perfectly:`,
          audioText: spokenText,
          correctAnswer: spokenText,
          hint: `Spoken sentence: "${spokenText}".`
        });
      }

      lessons.push({
        id: lessonId,
        title: partTitle,
        description: partDesc,
        difficulty: raw.difficulty,
        xpReward: 15,
        rule: { concept, howToDo, example },
        exercises
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
