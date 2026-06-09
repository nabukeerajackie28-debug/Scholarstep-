import { Task, QuizQuestion, Riddle } from './types';

export interface Topic {
  id: string;
  name: string;
  description: string;
  factsheet: string;
  quizQuestions: QuizQuestion[];
}

export interface Subject {
  id: string;
  name: string;
  iconName: string;
  color: string;
  gradient: string;
  topics: Topic[];
}

export const SUBJECTS_DATA: Subject[] = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    iconName: 'Calculator',
    color: 'from-blue-600 to-indigo-600',
    gradient: 'linear-gradient(135deg, #2563eb, #4f46e5)',
    topics: [
      {
        id: 'quadratic-equations',
        name: 'Quadratic Equations',
        description: 'Solving ax² + bx + c = 0 using factoring, standard forms, and the quadratic formula.',
        factsheet: `### Quadratic Equations Factsheet

A quadratic equation is any equation that can be rearranged in standard form as:
**ax² + bx + c = 0**
Where **x** represents an unknown, and **a**, **b**, and **c** are coefficients (with a ≠ 0).

#### Primary Formula (The Quadratic Formula):
The solutions can be computed using:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

#### Key Concepts:
- **The Discriminant (Δ = b² - 4ac)**:
  - If **Δ > 0**: Two distinct real roots.
  - If **Δ = 0**: Exactly one real root (a double root).
  - If **Δ < 0**: Two complex conjugate roots.
- **Vertex Form of a Parabola**:
  - $y = a(x - h)^2 + k$, where point **(h, k)** is the vertex, calculated as $h = -b/(2a)$.`,
        quizQuestions: [
          {
            id: 'm-q1',
            question: 'What does the discriminant (b² - 4ac) being less than zero indicate for a quadratic equation?',
            options: [
              'The equation has two identical real roots.',
              'The equation has two distinct real roots.',
              'The equation has two complex conjugate roots.',
              'The equation has exactly one non-zero real root.'
            ],
            correctAnswerIndex: 2,
            explanation: 'When the discriminant (b² - 4ac) is negative, the square root term produces an imaginary number, yielding two complex roots.'
          },
          {
            id: 'm-q2',
            question: 'Solve for x in the equation x² - 5x + 6 = 0.',
            options: [
              'x = -2 or x = -3',
              'x = 2 or x = 3',
              'x = 1 or x = 5',
              'x = -1 or x = 6'
            ],
            correctAnswerIndex: 1,
            explanation: 'The equation can be factored as (x - 2)(x - 3) = 0. Therefore, the roots are x = 2 and x = 3.'
          }
        ]
      },
      {
        id: 'pythagorean-theorem',
        name: 'Pythagoras Theorem',
        description: 'Understanding right-angled triangles and calculating missing hypotenuse or side values.',
        factsheet: `### Pythagorean Theorem Factsheet

In mathematics, the Pythagorean theorem is a fundamental relation in Euclidean geometry among the three sides of a right triangle.

#### Core Equation:
**a² + b² = c²**

Where:
- **a** and **b** are the lengths of the legs of the right-angled triangle.
- **c** is the length of the hypotenuse (the longest side opposite the right angle).

#### Common Pythagorean Triples (Whole numbers):
- (3, 4, 5)
- (5, 12, 13)
- (8, 15, 17)
- (7, 24, 25)

#### Practical Uses:
Used in navigation, surveying, architecture, and calculating 2D distances ($d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$).`,
        quizQuestions: [
          {
            id: 'm-p1',
            question: 'If a right triangle has short sides of length 5 cm and 12 cm, what is the length of its hypotenuse?',
            options: ['13 cm', '15 cm', '17 cm', '25 cm'],
            correctAnswerIndex: 0,
            explanation: 'By the theorem: 5² + 12² = 25 + 144 = 169. Taking the square root of 169 yields 13 cm.'
          },
          {
            id: 'm-p2',
            question: 'In a right triangle, which side length must be designated as "c" inside of standard mathematical equations?',
            options: ['The shortest side', 'The side adjacent to the smallest acute angle', 'The hypotenuse (longest side opposite 90° angle)', 'The vertical height of the triangle'],
            correctAnswerIndex: 2,
            explanation: 'The hypotenuse (c) is always the side opposite the 90° right angle and is mathematically the longest side of a right triangle.'
          }
        ]
      }
    ]
  },
  {
    id: 'physics',
    name: 'Physics',
    iconName: 'Atom',
    color: 'from-teal-600 to-cyan-600',
    gradient: 'linear-gradient(135deg, #0d9488, #0891b2)',
    topics: [
      {
        id: 'newtons-laws',
        name: "Newton's Laws of Motion",
        description: 'Analysing inertia, acceleration formulas (F = ma), and action-reaction pairings.',
        factsheet: `### Newton's Laws of Motion Factsheet

Formulated by Sir Isaac Newton in his 1687 masterwork *Principia Mathematica*, these three laws govern the mechanics of moving objects.

#### The Three Laws:
1. **Law of Inertia**: An object remains at rest or continues in uniform straight motion unless acted upon by an external net force.
2. **Law of Acceleration**: The net force acting on an object is equal to the rate of change of momentum, simplified for constant mass as:
   **F = ma**
   *(Where F = Force in Newtons [N], m = Mass in kg, a = Acceleration in m/s²)*
3. **Law of Action and Reaction**: For every action, there is an equal and opposite reaction. If Object A exerts a force on Object B, Object B exerts an equal force in the opposite direction.`,
        quizQuestions: [
          {
            id: 'p-n1',
            question: "How much net force is required to accelerate a 5 kg block across flat ice at 3 m/s²?",
            options: ['1.6 Newtons', '8 Newtons', '15 Newtons', '45 Newtons'],
            correctAnswerIndex: 2,
            explanation: 'Using Newton’s 2nd law: F = m * a = 5 kg * 3 m/s² = 15 Newtons.'
          },
          {
            id: 'p-n2',
            question: "A rocket pushes hot combustible gas downwards out of its engine nozzles. What is the reaction force?",
            options: [
              'Gravity drawing the rocket back towards land.',
              'Atmospheric air friction slowing the rocket down.',
              'The upward force propelling the rocket frame forward into air.',
              'The thermal energy heating the launch platform.'
            ],
            correctAnswerIndex: 2,
            explanation: 'According to Newton’s 3rd Law, the rocket pushing the gas downward (Action) results in the gas pushing the rocket upward with equal force (Reaction).'
          }
        ]
      }
    ]
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    iconName: 'Beaker',
    color: 'from-emerald-600 to-green-600',
    gradient: 'linear-gradient(135deg, #059669, #16a34a)',
    topics: [
      {
        id: 'chemical-bonding',
        name: 'Chemical Bonding Models',
        description: 'Characteristics of Ionic, Covalent, and Metallic molecular bonds.',
        factsheet: `### Chemical Bonding Factsheet

Chemical bonds form when atoms attract each other to produce molecules or network compounds, usually seeking a stable "Octet Configuration" (8 outer valence electrons).

#### 1. Ionic Bonding
- Formed by the **transfer** of electrons from a metal atom to a non-metal atom.
- Leads to positive ions (cations) and negative ions (anions).
- Highly crystalline, high melting points, conducts electricity when dissolved or molten. (Example: NaCl).

#### 2. Covalent Bonding
- Formed by the **sharing** of electron pairs between non-metal atoms.
- Can be polar (unequal sharing) or non-polar (equal sharing).
- Low melting points, poor electrical conductivity. (Example: H₂O).

#### 3. Metallic Bonding
- Electrons are delocalized in a shared "sea of electrons".
- Permits thermal and electrical conductivity, ductility, and malleability.`,
        quizQuestions: [
          {
            id: 'c-b1',
            question: 'Which type of atomic bond holds the atoms together in a glass of water (H₂O)?',
            options: ['Ionic Bond', 'Metallic Bond', 'Hydrogen dispersion lattice', 'Covalent Bond'],
            correctAnswerIndex: 3,
            explanation: 'Water comprises non-metal hydrogen and oxygen atoms which share pairs of valence electrons, defining covalent bonds.'
          },
          {
            id: 'c-b2',
            question: 'What is the governing rule of atoms seeking stability by acquiring eight valence electrons in their outer shell?',
            options: ['The Dalton Principle', 'The Avogadro Limit', 'The Octet Rule', 'The Bohr Equilibrium'],
            correctAnswerIndex: 2,
            explanation: 'The Octet Rule states that main-group atoms tend to bond in such a way that each atom has eight electrons in its outer valence shell, giving it the electronic configuration of a noble gas.'
          }
        ]
      }
    ]
  },
  {
    id: 'biology',
    name: 'Biology',
    iconName: 'Dna',
    color: 'from-amber-600 to-orange-600',
    gradient: 'linear-gradient(135deg, #d97706, #ea580c)',
    topics: [
      {
        id: 'cell-biology',
        name: 'Cellular Organelles',
        description: 'Inspecting mitochondria, nucleus, cytoplasm, and cell wall systems.',
        factsheet: `### Cellular Organelles Factsheet

Cells are the basic structural and functional units of all living organisms. They contain specialized subunits called organelles.

#### Critical Organelles:
1. **Nucleus**: The control hub storing genetic DNA material and directing cellular metabolism.
2. **Mitochondria**: The "powerhouse of the cell", producing ATP energy via aerobic cellular respiration.
3. **Ribosomes**: Tiny sites responsible for protein synthesis based on mRNA instructions.
4. **Chloroplasts**: Found only in plant cells; contains chlorophyll to convert sunlight into glucose energy via **photosynthesis**.
5. **Cell Wall**: Rigid exterior layer (composed of cellulose in plants) providing structural support. (Absent in animal cells).`,
        quizQuestions: [
          {
            id: 'b-c1',
            question: 'Which of the following cellular structures is present in onion plant cells but entirely missing from human skin cells?',
            options: ['Nucleus', 'Mitochondria', 'Cell membrane', 'Cell wall'],
            correctAnswerIndex: 3,
            explanation: 'Plant cells have a rigid outer cell wall for support, whereas animal cells do not possess cell walls.'
          },
          {
            id: 'b-c2',
            question: 'What chemical molecule carries energy within cells and is manufactured in large volumes by the mitochondria?',
            options: ['ATP', 'DNA', 'Glucose', 'Hemoglobin'],
            correctAnswerIndex: 0,
            explanation: 'Adenosine Triphosphate (ATP) is the chemical fuel currency of the cell, generated via cellular respiration within mitochondria.'
          }
        ]
      }
    ]
  },
  {
    id: 'history',
    name: 'History',
    iconName: 'BookOpen',
    color: 'from-fuchsia-600 to-pink-600',
    gradient: 'linear-gradient(135deg, #c026d3, #db2777)',
    topics: [
      {
        id: 'french-revolution',
        name: 'The French Revolution',
        description: 'Analyzing the systemic tax struggles, Estates-General, and social changes of 1789.',
        factsheet: `### French Revolution Factsheet

The French Revolution was a period of radical social and political upheaval in France from 1789 to 1799, fundamentally altering modern European history.

#### Structural Causes (The Three Estates):
- **First Estate**: The Clergy (approx. 0.5% population, paid no taxes).
- **Second Estate**: The Nobility (approx. 1.5% population, exempt from most taxes).
- **Third Estate**: Everyone else - peasants, merchants, bourgeoisie (98% population, bore the total tax burden).

#### Trigger Events:
- **Financial Crisis**: Royal debt due to active support of the American Revolution and luxurious royal expenditures.
- **Meeting of the Estates-General (May 1789)**: Called by King Louis XVI to approve new taxes; stalemate over voting systems led the Third Estate to form the **National Assembly**.
- **Storming of the Bastille (July 14, 1789)**: French citizens stormed the royal fortress seeking gunpowder, marking the dawn of violent popular revolt.`,
        quizQuestions: [
          {
            id: 'h-f1',
            question: 'Which tax stratum representing 98% of the pre-revolutionary French population bore almost the entire national tax burden?',
            options: ['The First Estate (Clergy)', 'The Second Estate (Nobles)', 'The Court of Versailles', 'The Third Estate (Peasants, Merchants, Bourgeoisie)'],
            correctAnswerIndex: 3,
            explanation: 'The Third Estate comprised the vast majority of the population who possessed the least political representation but paid virtually all the taxes.'
          },
          {
            id: 'h-f2',
            question: 'What major historical event on July 14, 1789, is celebrated as the spark of the French Revolution?',
            options: ['The Execution of Louis XVI', 'The Tennis Court Oath', 'The Storming of the Bastille', 'The Reign of Terror'],
            correctAnswerIndex: 2,
            explanation: 'Citizens stormed the Bastille fortress on July 14, 1789, to seize armed supplies, marking an explosive shift of power to the revolutionary masses.'
          }
        ]
      }
    ]
  },
  {
    id: 'english-literature',
    name: 'English Literature',
    iconName: 'PenTool',
    color: 'from-violet-600 to-purple-600',
    gradient: 'linear-gradient(135deg, #7c3aed, #9333ea)',
    topics: [
      {
        id: 'rhetorical-devices',
        name: 'Rhetorical Tools & Poetic Phrasing',
        description: 'Practicing similes, metaphors, alliteration, hyperbole, and personification.',
        factsheet: `### Rhetorical Tools Factsheet

Writers and poets employ stylistic devices to enrich narrative textures, evoke sensory images, and persuade readers.

#### Essential Literary Devices:
- **Simile**: A comparison between two distinct things using "like" or "as".
  - *Example: "Her heart was like gold."*
- **Metaphor**: A direct equation statement claiming one thing *is* another (not literally).
  - *Example: "This classroom is a zoo."*
- **Personification**: Assigning human-like behaviors or attributes to inert non-human objects.
  - *Example: "The wind whispered long secrets through the branches."*
- **Alliteration**: Sequential repetition of similar initial consonant sounds.
  - *Example: "Sally sells seashells by the seashore."*
- **Hyperbole**: An extreme exaggeration used to emphasize a thematic point.
  - *Example: "I have told you this homework rule a million times."*`,
        quizQuestions: [
          {
            id: 'l-r1',
            question: 'Which literary device is shown in: "The heavy storm door groaned in agony as the strong wind pushed it open"?',
            options: ['Alliteration', 'Personification', 'Simile', 'Hyperbole'],
            correctAnswerIndex: 1,
            explanation: 'The door is given a human capacity ("groaned in agony"), which constitutes Personification.'
          },
          {
            id: 'l-r2',
            question: 'What constitutes the critical difference between a simile and a metaphor?',
            options: [
              'A simile is only used in poetry, whereas metaphors are exclusively used in prose.',
              'A simile compare things directly; a metaphor explains chronological history.',
              'A simile uses comparative language such as "like" or "as"; a metaphor states a direct substitution.',
              'There is no functional literary difference between the two terms.'
            ],
            correctAnswerIndex: 2,
            explanation: 'Similes compare explicitly using connectors like "like" or "as" (e.g., "fast as a cheetah"), whereas metaphors declare a substitution directly (e.g., "he is a cheetah on the field").'
          }
        ]
      }
    ]
  }
];

export const OFFLINE_RIDDLES: Riddle[] = [
  {
    question: "I am a constant in the vacuum, symbolized by the letter 'c'. According to my mechanics, as you accelerate a particle closer to my universal speed limit, its mass approaches infinity, and relative time grinds to a standstill. What am I representing?",
    options: [
      "The Constant of Gravity (G)",
      "The Speed of Light in a Vacuum",
      "Planck’s Constant (h)",
      "Absolute Zero Temperature"
    ],
    correctAnswerIndex: 1,
    explanation: "Albert Einstein’s Special Theory of Relativity posits that the speed of light in vacuum (c) is the ultimate speed limit. As objects speed up, time dilates and relativistic mass increases.",
    avatar: 'einstein'
  },
  {
    question: "An apple falling down to earth inspired my universal law. If a system of equal mass receives identical forces, the acceleration is strictly proportional to the magnitude of that force. Under my third law, what is the reaction to step-on massive ground?",
    options: [
      "An equal thermal heat loss in the immediate area",
      "An equal and opposite force pushing back against your foot",
      "An increase in local gravitational acceleration",
      "Absolutely no reaction because earth mass is infinite"
    ],
    correctAnswerIndex: 1,
    explanation: "Sir Isaac Newton’s Third Law of Motion states: 'For every action, there is an equal and opposite reaction.' The earth pushes back on your foot with the exact same magnitude.",
    avatar: 'newton'
  },
  {
    question: "In atomic physics, I represent the state of an atom where all electrons reside in the lowest possible energy levels, completely stable and peaceful. What ground level am I?",
    options: [
      "The Excited State",
      "The Ionic State",
      "The Ground State",
      "The Plasma State"
    ],
    correctAnswerIndex: 2,
    explanation: "The Ground State refers to the lowest energy state of an atom structure, representing the most stable thermodynamic condition.",
    avatar: 'einstein'
  },
  {
    question: "In thermodynamics, I measure the degree of disorder or decay in a closed physical system. My law states that the net value of this parameter must always rise in the universe over time. What am I?",
    options: [
      "Velocity",
      "Enthalpy",
      "Entropy",
      "Kinetic Force"
    ],
    correctAnswerIndex: 2,
    explanation: "Entropy is the mathematical measurement of random disorder inside a physical system, governed by the Second Law of Thermodynamics.",
    avatar: 'newton'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Complete Math Quadratic Equation problems 1-10',
    subject: 'Mathematics',
    priority: 'high',
    dueDate: '2026-06-02',
    completed: false
  },
  {
    id: 't-2',
    title: 'Draw the diagram of Mitochondria structure',
    subject: 'Biology',
    priority: 'medium',
    dueDate: '2026-06-05',
    completed: false
  },
  {
    id: 't-3',
    title: 'Read Chapter 4 of WW1 Historical triggers',
    subject: 'History',
    priority: 'low',
    dueDate: '2026-06-12',
    completed: true
  }
];
