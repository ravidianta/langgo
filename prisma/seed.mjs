import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.voiceAttempt.deleteMany()
  await prisma.quizAttempt.deleteMany()
  await prisma.progress.deleteMany()
  await prisma.question.deleteMany()
  await prisma.subLevel.deleteMany()
  await prisma.topic.deleteMany()
  await prisma.unit.deleteMany()

  // ===========================
  // UNIT 1 — UNITED KINGDOM 🇬🇧
  // ===========================
  const uk = await prisma.unit.create({
    data: {
      name: 'United Kingdom',
      country: 'UK',
      flag: '🇬🇧',
      theme: 'uk',
      order: 1,
    },
  })

  // TOPIC 1 — GREETINGS
  const greetings = await prisma.topic.create({
    data: {
      unitId: uk.id,
      name: 'Greetings',
      emoji: '👋',
      order: 1,
    },
  })

  // Greetings 1.1
  const g11 = await prisma.subLevel.create({
    data: {
      topicId: greetings.id,
      number: '1.1',
      label: 'Basic Hello & Bye',
      order: 1,
      questions: {
        create: [
          { prompt: 'How do you greet someone in the morning?', correctAnswer: 'Good morning', type: 'MULTIPLE_CHOICE', options: ['Good morning', 'Good night', 'Goodbye', 'See you'] },
          { prompt: 'What do you say when leaving?', correctAnswer: 'Goodbye', type: 'MULTIPLE_CHOICE', options: ['Hello', 'Goodbye', 'Please', 'Thank you'] },
          { prompt: 'How do you say hello casually?', correctAnswer: 'Hi', type: 'MULTIPLE_CHOICE', options: ['Hi', 'Bye', 'Yes', 'No'] },
          { prompt: 'Translate: "Selamat pagi"', correctAnswer: 'Good morning', type: 'TRANSLATION', options: [] },
          { prompt: 'Say "Good morning" out loud', correctAnswer: 'Good morning', type: 'VOICE', isVoice: true, options: [] },
        ],
      },
    },
  })

  // Greetings 1.2
  const g12 = await prisma.subLevel.create({
    data: {
      topicId: greetings.id,
      number: '1.2',
      label: 'Formal Greetings',
      order: 2,
      questions: {
        create: [
          { prompt: 'Formal greeting in the afternoon?', correctAnswer: 'Good afternoon', type: 'MULTIPLE_CHOICE', options: ['Good afternoon', 'Good morning', 'Good night', 'Hello'] },
          { prompt: 'How do you formally say goodbye?', correctAnswer: 'Farewell', type: 'MULTIPLE_CHOICE', options: ['Farewell', 'Bye', 'See ya', 'Later'] },
          { prompt: 'Translate: "Selamat sore"', correctAnswer: 'Good afternoon', type: 'TRANSLATION', options: [] },
          { prompt: 'What does "How do you do?" mean?', correctAnswer: 'A formal greeting', type: 'MULTIPLE_CHOICE', options: ['A formal greeting', 'A question about health', 'A farewell', 'A thank you'] },
          { prompt: 'Say "Good afternoon" out loud', correctAnswer: 'Good afternoon', type: 'VOICE', isVoice: true, options: [] },
        ],
      },
    },
  })

  // Greetings 1.3
  const g13 = await prisma.subLevel.create({
    data: {
      topicId: greetings.id,
      number: '1.3',
      label: 'Introductions',
      order: 3,
      questions: {
        create: [
          { prompt: 'How do you introduce yourself?', correctAnswer: 'My name is...', type: 'MULTIPLE_CHOICE', options: ['My name is...', 'I like...', 'I want...', 'I go...'] },
          { prompt: 'Translate: "Nama saya Rafi"', correctAnswer: 'My name is Rafi', type: 'TRANSLATION', options: [] },
          { prompt: 'How do you ask someone\'s name?', correctAnswer: 'What is your name?', type: 'MULTIPLE_CHOICE', options: ['What is your name?', 'Where are you?', 'How old are you?', 'Who are you?'] },
          { prompt: 'Say "My name is..." out loud', correctAnswer: 'My name is', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Translate: "Senang bertemu denganmu"', correctAnswer: 'Nice to meet you', type: 'TRANSLATION', options: [] },
        ],
      },
    },
  })

  // Greetings Boss
  const gBoss = await prisma.subLevel.create({
    data: {
      topicId: greetings.id,
      number: '1.B',
      label: 'Boss: The Queen\'s Greeting',
      isBoss: true,
      order: 4,
      questions: {
        create: [
          { prompt: 'Formal morning greeting?', correctAnswer: 'Good morning', type: 'MULTIPLE_CHOICE', options: ['Good morning', 'Hey', 'Wassup', 'Hello'] },
          { prompt: 'Translate: "Selamat malam"', correctAnswer: 'Good evening', type: 'TRANSLATION', options: [] },
          { prompt: 'How do you formally introduce yourself?', correctAnswer: 'My name is...', type: 'MULTIPLE_CHOICE', options: ['My name is...', 'I am called...', 'They call me...', 'Name is...'] },
          { prompt: 'What is a formal farewell?', correctAnswer: 'Farewell', type: 'MULTIPLE_CHOICE', options: ['Farewell', 'Cya', 'Bye bye', 'Later'] },
          { prompt: 'Translate: "Apa kabar?"', correctAnswer: 'How are you?', type: 'TRANSLATION', options: [] },
          { prompt: 'Say "Good evening" out loud', correctAnswer: 'Good evening', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Casual way to say hello?', correctAnswer: 'Hi', type: 'MULTIPLE_CHOICE', options: ['Hi', 'Greetings', 'Salutations', 'Good day'] },
          { prompt: 'Translate: "Sampai jumpa"', correctAnswer: 'See you later', type: 'TRANSLATION', options: [] },
          { prompt: 'Afternoon greeting?', correctAnswer: 'Good afternoon', type: 'MULTIPLE_CHOICE', options: ['Good afternoon', 'Good morning', 'Good night', 'Good day'] },
          { prompt: 'Say "Nice to meet you" out loud', correctAnswer: 'Nice to meet you', type: 'VOICE', isVoice: true, options: [] },
        ],
      },
    },
  })

  // TOPIC 2 — GRAMMAR
  const grammar = await prisma.topic.create({
    data: {
      unitId: uk.id,
      name: 'Grammar',
      emoji: '📝',
      order: 2,
    },
  })

  const gram11 = await prisma.subLevel.create({
    data: {
      topicId: grammar.id,
      number: '2.1',
      label: 'Present Tense',
      order: 1,
      questions: {
        create: [
          { prompt: 'Which is correct?', correctAnswer: 'I am happy', type: 'MULTIPLE_CHOICE', options: ['I am happy', 'I is happy', 'I are happy', 'I be happy'] },
          { prompt: 'Fill in: "She ___ a teacher"', correctAnswer: 'is', type: 'MULTIPLE_CHOICE', options: ['is', 'are', 'am', 'be'] },
          { prompt: 'Translate: "Saya sedang belajar"', correctAnswer: 'I am studying', type: 'TRANSLATION', options: [] },
          { prompt: 'Which is correct?', correctAnswer: 'They are students', type: 'MULTIPLE_CHOICE', options: ['They are students', 'They is students', 'They am students', 'They be students'] },
          { prompt: 'Say "I am learning English" out loud', correctAnswer: 'I am learning English', type: 'VOICE', isVoice: true, options: [] },
        ],
      },
    },
  })

  const gram12 = await prisma.subLevel.create({
    data: {
      topicId: grammar.id,
      number: '2.2',
      label: 'Past Tense',
      order: 2,
      questions: {
        create: [
          { prompt: 'Past tense of "go"?', correctAnswer: 'went', type: 'MULTIPLE_CHOICE', options: ['went', 'goed', 'gone', 'going'] },
          { prompt: 'Past tense of "eat"?', correctAnswer: 'ate', type: 'MULTIPLE_CHOICE', options: ['ate', 'eated', 'eaten', 'eating'] },
          { prompt: 'Translate: "Saya pergi ke sekolah kemarin"', correctAnswer: 'I went to school yesterday', type: 'TRANSLATION', options: [] },
          { prompt: 'Which is correct?', correctAnswer: 'She walked to the store', type: 'MULTIPLE_CHOICE', options: ['She walked to the store', 'She walk to the store', 'She walks to the store', 'She walking to the store'] },
          { prompt: 'Say "I went to the market yesterday" out loud', correctAnswer: 'I went to the market yesterday', type: 'VOICE', isVoice: true, options: [] },
        ],
      },
    },
  })

  const gram13 = await prisma.subLevel.create({
    data: {
      topicId: grammar.id,
      number: '2.3',
      label: 'Asking Questions',
      order: 3,
      questions: {
        create: [
          { prompt: 'How do you ask about time?', correctAnswer: 'What time is it?', type: 'MULTIPLE_CHOICE', options: ['What time is it?', 'Where is time?', 'Who is time?', 'How is time?'] },
          { prompt: 'Translate: "Di mana toilet?"', correctAnswer: 'Where is the bathroom?', type: 'TRANSLATION', options: [] },
          { prompt: 'Which is a question?', correctAnswer: 'Are you coming?', type: 'MULTIPLE_CHOICE', options: ['Are you coming?', 'You are coming.', 'Coming you are.', 'You coming.'] },
          { prompt: 'Say "Where is the nearest station?" out loud', correctAnswer: 'Where is the nearest station', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Translate: "Berapa harganya?"', correctAnswer: 'How much does it cost?', type: 'TRANSLATION', options: [] },
        ],
      },
    },
  })

  const gram14 = await prisma.subLevel.create({
    data: {
      topicId: grammar.id,
      number: '2.4',
      label: 'Negatives',
      order: 4,
      questions: {
        create: [
          { prompt: 'Make negative: "I like coffee"', correctAnswer: 'I do not like coffee', type: 'MULTIPLE_CHOICE', options: ['I do not like coffee', 'I not like coffee', 'I likes not coffee', 'Not I like coffee'] },
          { prompt: 'Translate: "Saya tidak mengerti"', correctAnswer: 'I do not understand', type: 'TRANSLATION', options: [] },
          { prompt: 'Which is correct negative?', correctAnswer: "She doesn't eat meat", type: 'MULTIPLE_CHOICE', options: ["She doesn't eat meat", "She don't eat meat", "She not eat meat", "She eats not meat"] },
          { prompt: 'Say "I do not understand" out loud', correctAnswer: 'I do not understand', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Translate: "Dia tidak datang"', correctAnswer: 'He did not come', type: 'TRANSLATION', options: [] },
        ],
      },
    },
  })

  const gramBoss = await prisma.subLevel.create({
    data: {
      topicId: grammar.id,
      number: '2.B',
      label: "Boss: The Grammar Guardian",
      isBoss: true,
      order: 5,
      questions: {
        create: [
          { prompt: 'Fill in: "They ___ playing football"', correctAnswer: 'are', type: 'MULTIPLE_CHOICE', options: ['are', 'is', 'am', 'be'] },
          { prompt: 'Past tense of "drink"?', correctAnswer: 'drank', type: 'MULTIPLE_CHOICE', options: ['drank', 'drinked', 'drunk', 'drinking'] },
          { prompt: 'Translate: "Apakah kamu sudah makan?"', correctAnswer: 'Have you eaten yet?', type: 'TRANSLATION', options: [] },
          { prompt: 'Make negative: "He plays guitar"', correctAnswer: "He doesn't play guitar", type: 'MULTIPLE_CHOICE', options: ["He doesn't play guitar", "He don't play guitar", "He not plays guitar", "He plays not guitar"] },
          { prompt: 'Which is correct?', correctAnswer: 'We were at the park', type: 'MULTIPLE_CHOICE', options: ['We were at the park', 'We was at the park', 'We are at the park', 'We be at the park'] },
          { prompt: 'Say "I did not go to school today" out loud', correctAnswer: 'I did not go to school today', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Translate: "Mereka sedang tidur"', correctAnswer: 'They are sleeping', type: 'TRANSLATION', options: [] },
          { prompt: 'Correct question form?', correctAnswer: 'Did she call you?', type: 'MULTIPLE_CHOICE', options: ['Did she call you?', 'She did call you?', 'Called she you?', 'Does she called you?'] },
          { prompt: 'Fill in: "I ___ not understand"', correctAnswer: 'do', type: 'MULTIPLE_CHOICE', options: ['do', 'does', 'did', 'done'] },
          { prompt: 'Say "Are you ready to continue?" out loud', correctAnswer: 'Are you ready to continue', type: 'VOICE', isVoice: true, options: [] },
        ],
      },
    },
  })

  // TOPIC 3 — VOCABULARY
  const vocab = await prisma.topic.create({
    data: {
      unitId: uk.id,
      name: 'Vocabulary',
      emoji: '📚',
      order: 3,
    },
  })

  const voc11 = await prisma.subLevel.create({
    data: {
      topicId: vocab.id,
      number: '3.1',
      label: 'Numbers 1-20',
      order: 1,
      questions: {
        create: [
          { prompt: 'How do you say "5" in English?', correctAnswer: 'Five', type: 'MULTIPLE_CHOICE', options: ['Five', 'Four', 'Six', 'Three'] },
          { prompt: 'Translate: "Dua belas"', correctAnswer: 'Twelve', type: 'TRANSLATION', options: [] },
          { prompt: 'What comes after fifteen?', correctAnswer: 'Sixteen', type: 'MULTIPLE_CHOICE', options: ['Sixteen', 'Seventeen', 'Fourteen', 'Eighteen'] },
          { prompt: 'Say the number "Twenty" out loud', correctAnswer: 'Twenty', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Translate: "Sembilan belas"', correctAnswer: 'Nineteen', type: 'TRANSLATION', options: [] },
        ],
      },
    },
  })

  const voc12 = await prisma.subLevel.create({
    data: {
      topicId: vocab.id,
      number: '3.2',
      label: 'Colors',
      order: 2,
      questions: {
        create: [
          { prompt: 'Translate: "Merah"', correctAnswer: 'Red', type: 'TRANSLATION', options: [] },
          { prompt: 'What color is the sky?', correctAnswer: 'Blue', type: 'MULTIPLE_CHOICE', options: ['Blue', 'Red', 'Green', 'Yellow'] },
          { prompt: 'Translate: "Hitam"', correctAnswer: 'Black', type: 'TRANSLATION', options: [] },
          { prompt: 'Say "The grass is green" out loud', correctAnswer: 'The grass is green', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'What color is the sun?', correctAnswer: 'Yellow', type: 'MULTIPLE_CHOICE', options: ['Yellow', 'Blue', 'Red', 'Purple'] },
        ],
      },
    },
  })

  const voc13 = await prisma.subLevel.create({
    data: {
      topicId: vocab.id,
      number: '3.3',
      label: 'Family',
      order: 3,
      questions: {
        create: [
          { prompt: 'Translate: "Ibu"', correctAnswer: 'Mother', type: 'TRANSLATION', options: [] },
          { prompt: 'What do you call your father\'s mother?', correctAnswer: 'Grandmother', type: 'MULTIPLE_CHOICE', options: ['Grandmother', 'Aunt', 'Sister', 'Mother'] },
          { prompt: 'Translate: "Kakak laki-laki"', correctAnswer: 'Older brother', type: 'TRANSLATION', options: [] },
          { prompt: 'Say "My family is important to me" out loud', correctAnswer: 'My family is important to me', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'What do you call your parent\'s sister?', correctAnswer: 'Aunt', type: 'MULTIPLE_CHOICE', options: ['Aunt', 'Cousin', 'Niece', 'Grandmother'] },
        ],
      },
    },
  })

  const vocBoss = await prisma.subLevel.create({
    data: {
      topicId: vocab.id,
      number: '3.B',
      label: "Boss: The Vocabulary Vault",
      isBoss: true,
      order: 4,
      questions: {
        create: [
          { prompt: 'Translate: "Tujuh belas"', correctAnswer: 'Seventeen', type: 'TRANSLATION', options: [] },
          { prompt: 'What color is a banana?', correctAnswer: 'Yellow', type: 'MULTIPLE_CHOICE', options: ['Yellow', 'Green', 'Blue', 'Red'] },
          { prompt: 'Translate: "Ayah"', correctAnswer: 'Father', type: 'TRANSLATION', options: [] },
          { prompt: 'What number comes before ten?', correctAnswer: 'Nine', type: 'MULTIPLE_CHOICE', options: ['Nine', 'Eight', 'Eleven', 'Seven'] },
          { prompt: 'Say "I have two brothers and one sister" out loud', correctAnswer: 'I have two brothers and one sister', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Translate: "Putih"', correctAnswer: 'White', type: 'TRANSLATION', options: [] },
          { prompt: 'What do you call your mother\'s brother?', correctAnswer: 'Uncle', type: 'MULTIPLE_CHOICE', options: ['Uncle', 'Cousin', 'Nephew', 'Brother'] },
          { prompt: 'How do you say 14 in English?', correctAnswer: 'Fourteen', type: 'MULTIPLE_CHOICE', options: ['Fourteen', 'Forty', 'Four', 'Fifteen'] },
          { prompt: 'Translate: "Adik perempuan"', correctAnswer: 'Younger sister', type: 'TRANSLATION', options: [] },
          { prompt: 'Say "My favorite color is blue" out loud', correctAnswer: 'My favorite color is blue', type: 'VOICE', isVoice: true, options: [] },
        ],
      },
    },
  })

  // PRONUNCIATION TOPIC
  const pronunciation = await prisma.topic.create({
    data: {
      unitId: uk.id,
      name: 'Pronunciation',
      emoji: '🎙️',
      order: 4,
    },
  })

  const pro11 = await prisma.subLevel.create({
    data: {
      topicId: pronunciation.id,
      number: '4.1',
      label: 'Vowel Sounds',
      isVoiceOnly: true,
      order: 1,
      questions: {
        create: [
          { prompt: 'Say the word "Apple"', correctAnswer: 'Apple', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Say the word "Elephant"', correctAnswer: 'Elephant', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Say the word "Ice cream"', correctAnswer: 'Ice cream', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Say the word "Open"', correctAnswer: 'Open', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Say the word "Under"', correctAnswer: 'Under', type: 'VOICE', isVoice: true, options: [] },
        ],
      },
    },
  })

  const pro12 = await prisma.subLevel.create({
    data: {
      topicId: pronunciation.id,
      number: '4.2',
      label: 'Tricky Sounds',
      isVoiceOnly: true,
      order: 2,
      questions: {
        create: [
          { prompt: 'Say "The weather is wonderful"', correctAnswer: 'The weather is wonderful', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Say "She sells seashells"', correctAnswer: 'She sells seashells', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Say "Three thin things"', correctAnswer: 'Three thin things', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Say "Would you like some water?"', correctAnswer: 'Would you like some water', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Say "I thought about that"', correctAnswer: 'I thought about that', type: 'VOICE', isVoice: true, options: [] },
        ],
      },
    },
  })

  const proBoss = await prisma.subLevel.create({
    data: {
      topicId: pronunciation.id,
      number: '4.B',
      label: 'Boss: The Accent Challenge',
      isBoss: true,
      isVoiceOnly: true,
      order: 3,
      questions: {
        create: [
          { prompt: 'Say "How are you doing today?"', correctAnswer: 'How are you doing today', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Say "I would like a cup of tea please"', correctAnswer: 'I would like a cup of tea please', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Say "The train arrives at half past three"', correctAnswer: 'The train arrives at half past three', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Say "Excuse me, where is the nearest tube station?"', correctAnswer: 'Excuse me where is the nearest tube station', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Say "It is rather cloudy today, isn\'t it?"', correctAnswer: 'It is rather cloudy today', type: 'VOICE', isVoice: true, options: [] },
        ],
      },
    },
  })

  // UNIT FINAL BOSS
  const unitBoss = await prisma.topic.create({
    data: {
      unitId: uk.id,
      name: 'Final Boss',
      emoji: '👑',
      order: 5,
    },
  })

  const ukFinalBoss = await prisma.subLevel.create({
    data: {
      topicId: unitBoss.id,
      number: 'BOSS',
      label: "Unit Boss: The Crown's Challenge",
      isBoss: true,
      isUnitBoss: true,
      order: 1,
      questions: {
        create: [
          { prompt: 'Formal morning greeting?', correctAnswer: 'Good morning', type: 'MULTIPLE_CHOICE', options: ['Good morning', 'Hey', 'Hi there', 'Wassup'] },
          { prompt: 'Translate: "Saya tidak suka hujan"', correctAnswer: 'I do not like rain', type: 'TRANSLATION', options: [] },
          { prompt: 'Past tense of "speak"?', correctAnswer: 'spoke', type: 'MULTIPLE_CHOICE', options: ['spoke', 'speaked', 'spoken', 'speaking'] },
          { prompt: 'Translate: "Dua puluh"', correctAnswer: 'Twenty', type: 'TRANSLATION', options: [] },
          { prompt: 'Say "It is lovely weather today" out loud', correctAnswer: 'It is lovely weather today', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'What color is the British flag?', correctAnswer: 'Red, white and blue', type: 'MULTIPLE_CHOICE', options: ['Red, white and blue', 'Green and yellow', 'Blue and white', 'Red and white'] },
          { prompt: 'Translate: "Kakek"', correctAnswer: 'Grandfather', type: 'TRANSLATION', options: [] },
          { prompt: 'Correct sentence?', correctAnswer: 'She does not know the answer', type: 'MULTIPLE_CHOICE', options: ['She does not know the answer', 'She do not know the answer', 'She not know the answer', 'She knowing not the answer'] },
          { prompt: 'Translate: "Berapa usiamu?"', correctAnswer: 'How old are you?', type: 'TRANSLATION', options: [] },
          { prompt: 'Say "I am very pleased to meet you" out loud', correctAnswer: 'I am very pleased to meet you', type: 'VOICE', isVoice: true, options: [] },
        ],
      },
    },
  })

  // ===========================
  // UNIT 2 — UNITED STATES 🇺🇸
  // ===========================
  const usa = await prisma.unit.create({
    data: {
      name: 'United States',
      country: 'USA',
      flag: '🇺🇸',
      theme: 'usa',
      order: 2,
    },
  })

  const foodTopic = await prisma.topic.create({
    data: { unitId: usa.id, name: 'Food & Drinks', emoji: '🍔', order: 1 },
  })

  await prisma.subLevel.create({
    data: {
      topicId: foodTopic.id, number: '1.1', label: 'Ordering Food', order: 1,
      questions: {
        create: [
          { prompt: 'How do you order food politely?', correctAnswer: 'I would like a burger please', type: 'MULTIPLE_CHOICE', options: ['I would like a burger please', 'Give me burger', 'Burger now', 'Want burger'] },
          { prompt: 'Translate: "Saya lapar"', correctAnswer: 'I am hungry', type: 'TRANSLATION', options: [] },
          { prompt: 'What do Americans call french fries?', correctAnswer: 'Fries', type: 'MULTIPLE_CHOICE', options: ['Fries', 'Chips', 'Crisps', 'Wedges'] },
          { prompt: 'Say "Can I have the menu please?" out loud', correctAnswer: 'Can I have the menu please', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Translate: "Saya mau minum air putih"', correctAnswer: 'I want to drink water', type: 'TRANSLATION', options: [] },
        ],
      },
    },
  })

  await prisma.subLevel.create({
    data: {
      topicId: foodTopic.id, number: '1.2', label: 'At the Diner', order: 2,
      questions: {
        create: [
          { prompt: 'How do you ask for the bill?', correctAnswer: 'Check please', type: 'MULTIPLE_CHOICE', options: ['Check please', 'Money now', 'Pay time', 'Bill me'] },
          { prompt: 'Translate: "Ini enak sekali"', correctAnswer: 'This is very delicious', type: 'TRANSLATION', options: [] },
          { prompt: 'What is a typical American breakfast drink?', correctAnswer: 'Orange juice', type: 'MULTIPLE_CHOICE', options: ['Orange juice', 'Tea', 'Coconut water', 'Soup'] },
          { prompt: 'Say "I would like my steak well done please" out loud', correctAnswer: 'I would like my steak well done please', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Translate: "Apakah ada menu vegetarian?"', correctAnswer: 'Is there a vegetarian menu?', type: 'TRANSLATION', options: [] },
        ],
      },
    },
  })

  await prisma.subLevel.create({
    data: {
      topicId: foodTopic.id, number: '1.B', label: 'Boss: The Diner Challenge', isBoss: true, order: 3,
      questions: {
        create: [
          { prompt: 'Translate: "Saya alergi kacang"', correctAnswer: 'I am allergic to nuts', type: 'TRANSLATION', options: [] },
          { prompt: 'Polite way to get a waiter\'s attention?', correctAnswer: 'Excuse me', type: 'MULTIPLE_CHOICE', options: ['Excuse me', 'Hey you', 'Come here', 'Waiter!'] },
          { prompt: 'Say "Can we get two coffees and one orange juice?" out loud', correctAnswer: 'Can we get two coffees and one orange juice', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Translate: "Tolong jangan terlalu pedas"', correctAnswer: 'Please not too spicy', type: 'TRANSLATION', options: [] },
          { prompt: 'What do Americans say instead of "bill"?', correctAnswer: 'Check', type: 'MULTIPLE_CHOICE', options: ['Check', 'Invoice', 'Receipt', 'Payment'] },
          { prompt: 'Say "Do you have any specials today?" out loud', correctAnswer: 'Do you have any specials today', type: 'VOICE', isVoice: true, options: [] },
          { prompt: 'Translate: "Ini terlalu manis"', correctAnswer: 'This is too sweet', type: 'TRANSLATION', options: [] },
          { prompt: 'How do Americans order coffee to go?', correctAnswer: 'Coffee to go please', type: 'MULTIPLE_CHOICE', options: ['Coffee to go please', 'Take coffee', 'Coffee outside', 'Moving coffee'] },
          { prompt: 'Translate: "Boleh saya lihat menunya?"', correctAnswer: 'May I see the menu?', type: 'TRANSLATION', options: [] },
          { prompt: 'Say "Thank you so much, everything was great" out loud', correctAnswer: 'Thank you so much everything was great', type: 'VOICE', isVoice: true, options: [] },
        ],
      },
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('Units created: UK 🇬🇧, USA 🇺🇸')
  console.log('Topics: Greetings, Grammar, Vocabulary, Pronunciation, Final Boss (UK), Food & Drinks (USA)')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })