import type {
  SiteSettings,
  NoteItem,
  StudyPdfItem,
  QuizCollection,
  PastPaperItem,
  JobListing,
  AnnouncementItem,
  ContactSubmission,
} from '../utils/examoraLogic';

export interface ExamoraDatabase {
  settings: SiteSettings;
  notes: NoteItem[];
  pdfs: StudyPdfItem[];
  quizzes: QuizCollection[];
  pastPapers: PastPaperItem[];
  jobs: JobListing[];
  announcements: AnnouncementItem[];
  contactSubmissions: ContactSubmission[];
}

/**
 * Generates an elegant, high-contrast academic book/note cover SVG as a Data URL.
 */
export function createAcademicCoverSvgDataUrl(
  badge: string,
  title: string,
  subtitle: string,
  accentScheme: 'navy' | 'gold' | 'emerald' | 'crimson' | 'royal' = 'navy'
): string {
  const schemes = {
    navy: { bg1: '#123675', bg2: '#091D49', accent: '#EAB52F', text: '#FFFDFA' },
    gold: { bg1: '#1A3A6E', bg2: '#0B1F47', accent: '#F3C44E', text: '#FFFDFA' },
    emerald: { bg1: '#0F3D3E', bg2: '#072227', accent: '#EAB52F', text: '#FFFDFA' },
    crimson: { bg1: '#3B1829', bg2: '#1D0B14', accent: '#EAB52F', text: '#FFFDFA' },
    royal: { bg1: '#192A56', bg2: '#0C1633', accent: '#EAB52F', text: '#FFFDFA' },
  };
  const s = schemes[accentScheme] || schemes.navy;
  const safeBadge = badge.replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 28);
  const words = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').split(' ');
  const lines: string[] = [];
  let curr = '';
  for (const w of words) {
    if ((curr + ' ' + w).trim().length <= 22) {
      curr = (curr + ' ' + w).trim();
    } else {
      if (curr) lines.push(curr);
      curr = w;
    }
  }
  if (curr) lines.push(curr);
  const displayLines = lines.slice(0, 3);
  const safeSub = subtitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 42);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320" width="480" height="320">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${s.bg1}" />
        <stop offset="100%" stop-color="${s.bg2}" />
      </linearGradient>
    </defs>
    <rect width="480" height="320" fill="url(#bg)" />
    <rect x="20" y="20" width="440" height="280" rx="14" fill="none" stroke="${s.accent}" stroke-opacity="0.35" stroke-width="1.5" />
    <circle cx="420" cy="60" r="90" fill="${s.accent}" fill-opacity="0.07" />
    <circle cx="60" cy="270" r="70" fill="#ffffff" fill-opacity="0.04" />
    <rect x="40" y="42" width="8" height="28" rx="4" fill="${s.accent}" />
    <text x="58" y="61" fill="${s.accent}" font-family="'Plus Jakarta Sans', 'Manrope', sans-serif" font-size="13" font-weight="800" letter-spacing="1.5">${safeBadge.toUpperCase()}</text>
    ${displayLines
      .map(
        (line, idx) =>
          `<text x="40" y="${118 + idx * 36}" fill="${s.text}" font-family="'Plus Jakarta Sans', 'Manrope', sans-serif" font-size="27" font-weight="800">${line}</text>`
      )
      .join('')}
    <line x1="40" y1="238" x2="160" y2="238" stroke="${s.accent}" stroke-width="2.5" />
    <text x="40" y="266" fill="#D5DFEE" font-family="'Manrope', sans-serif" font-size="13" font-weight="700">${safeSub}</text>
    <text x="330" y="266" fill="${s.accent}" font-family="'Plus Jakarta Sans', 'Manrope', sans-serif" font-size="12" font-weight="800">EXAMORA PK</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getInitialDatabase(): ExamoraDatabase {
  const now = '2026-10-20T09:00:00.000Z';

  return {
    settings: {
      academyName: 'EXAMORA PAKISTAN',
      logoUrl: '/assets/aistudio/WhatsApp_Image_2026-10-23_at_8.21.26_PM_5ce025df.jpeg',
      heroWelcomeLabel: 'WELCOME TO',
      heroTitle: 'EXAMORA PAKISTAN',
      heroDescription:
        'Your daily partner for exam preparation — notes, quizzes, past papers and job updates.',
      heroPrimaryBtnLabel: 'Explore Study Material',
      heroSecondaryBtnLabel: "Take Today's Quiz",
      aboutHeading: 'About EXAMORA PAKISTAN',
      aboutContent:
        'EXAMORA PAKISTAN helps students and competitive examination candidates across Pakistan prepare systematically for CSS, PMS, PPSC, FPSC, NTS, and provincial recruitment tests. Every day we curate exam-focused study notes, full-length PDF reference books, interactive MCQ quizzes, authentic past papers, and verified job updates.',
      footerDescription:
        'Empowering CSS, PMS, FPSC, PPSC, and NTS aspirants across Pakistan with structured academic notes, interactive daily quizzes, past papers, and verified career updates.',
      emailAddress: 'support@examorapakistan.edu.pk',
      whatsappNumber: '+923001234567',
      whatsappCommunityUrl: 'https://chat.whatsapp.com/examora-pakistan-community',
      whatsappChannelUrl: 'https://whatsapp.com/channel/examora-pakistan',
      instagramUrl: 'https://instagram.com/examorapakistan',
      facebookUrl: 'https://facebook.com/examorapakistan',
      youtubeUrl: 'https://youtube.com/@examorapakistan',
      tiktokUrl: 'https://tiktok.com/@examorapakistan',
      updatedAt: now,
    },
    notes: [
      {
        id: 'note-lahore-resolution-1940',
        title: 'Lahore Resolution 1940 — Constitutional & Historical Analysis',
        category: 'Pakistan Studies',
        coverUrl: createAcademicCoverSvgDataUrl(
          'Pakistan Studies',
          'Lahore Resolution 1940',
          '23 March 1940 • Minto Park Session',
          'navy'
        ),
        accessType: 'free',
        published: true,
        summary:
          'Passed on 23 March 1940 at Minto Park (now Iqbal Park), Lahore. Presented by A.K. Fazlul Haq demanding independent states for Muslims in the north-western and eastern zones of British India.',
        pageCount: 4,
        pages: [
          {
            pageNumber: 1,
            heading: 'Historical Context & The 27th Annual Session of All-India Muslim League',
            subheading: 'Pakistan Studies • CSS / PMS / FPSC Core Syllabus',
            paragraphs: [
              'The Lahore Resolution (Qarardad-e-Lahore), later popularly known as the Pakistan Resolution, was formally adopted during the three-day 27th Annual Session of the All-India Muslim League held at Minto Park (now Greater Iqbal Park), Lahore, from 22 to 24 March 1940.',
              'Following the resignation of Congress Provincial Ministries in 1939 and the outbreak of World War II, Quaid-e-Azam Muhammad Ali Jinnah presided over the historic gathering of over 100,000 delegates from across British India.',
              'Sher-e-Bangla A.K. Fazlul Haq, the Premier of Bengal, moved the formal resolution on 23 March 1940, which was seconded by Chaudhry Khaliquzzaman, Maulana Zafar Ali Khan, Sardar Aurangzeb Khan, and Sir Abdullah Haroon.',
            ],
            keyPoints: [
              'Session Dates: 22–24 March 1940 at Minto Park (Iqbal Park), Lahore.',
              'Presided Over By: Quaid-e-Azam Muhammad Ali Jinnah.',
              'Moved By: A.K. Fazlul Haq (Premier of United Bengal) on 23 March 1940.',
              'Commemorative Monument: Minar-e-Pakistan stands at the exact site.',
            ],
          },
          {
            pageNumber: 2,
            heading: 'Core Constitutional Principles of the 1940 Resolution',
            subheading: 'Territorial Readjustment & Autonomous Sovereign Units',
            paragraphs: [
              'The resolution declared that no constitutional plan would be workable in the country or acceptable to the Muslims unless geographical contiguous units are demarcated into regions which should be so constituted, with such territorial readjustments as may be necessary.',
              'Specifically, it stipulated that the areas in which the Muslims are numerically in a majority, as in the North-Western and Eastern Zones of India, should be grouped to constitute Independent States in which the constituent units shall be autonomous and sovereign.',
              'Furthermore, the resolution mandated that adequate, effective, and mandatory safeguards shall be specifically provided in the constitution for minorities in these units and in the regions for the protection of their religious, cultural, economic, political, and administrative rights.',
            ],
            keyPoints: [
              'Rejected the federal scheme of the Government of India Act 1935.',
              'Demanded demarcation of geographically contiguous Muslim-majority zones.',
              'Guaranteed constitutional safeguards for religious and cultural minorities.',
            ],
          },
          {
            pageNumber: 3,
            heading: 'Quaid-e-Azam’s Presidential Address & Two-Nation Theory',
            subheading: 'Ideological Foundation of the Pakistan Movement',
            paragraphs: [
              'In his landmark presidential address on 22 March 1940, Quaid-e-Azam articulated the Two-Nation Theory with unmatched constitutional clarity. He emphasized that Hindus and Muslims belong to two different religious philosophies, social customs, and literary traditions.',
              'He explained that Muslim India could not accept any constitution which must necessarily result in a Hindu-majority government across the entire subcontinent, transforming Muslims into a permanent constitutional minority.',
              'This shift marked the transition of the Muslim League from seeking federal safeguards within a united India to demanding sovereign statehood.',
            ],
            keyPoints: [
              'Defined Muslims as a ”nation by any definition of the word“ rather than a minority.',
              'Transformed the political trajectory of South Asia within seven years (1940–1947).',
            ],
          },
          {
            pageNumber: 4,
            heading: '1946 Delhi Legislators Convention & Past Exam MCQs',
            subheading: 'High-Yield FPSC / PPSC / CSS Revision Facts',
            paragraphs: [
              'In April 1946, at the All-India Muslim League Legislators Convention in Delhi, Hussain Shaheed Suhrawardy moved a resolution clarifying that the North-Western and Eastern zones would form a single sovereign state of Pakistan.',
              'Within seven years and five months of the Lahore Resolution, Pakistan emerged as an independent sovereign state on 14 August 1947.',
            ],
            keyPoints: [
              'Who translated the Lahore Resolution into Urdu? Maulana Zafar Ali Khan.',
              'Who seconded the resolution from Sindh? Sir Abdullah Haroon.',
              'Who seconded the resolution from Balochistan? Qazi Muhammad Isa.',
              'Foundation stone of Minar-e-Pakistan laid: 23 March 1960; completed: October 1968.',
            ],
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'note-human-blood-groups',
        title: 'Human Blood Groups, ABO System & Rh Factor',
        category: 'General Science',
        coverUrl: createAcademicCoverSvgDataUrl(
          'General Science',
          'Human Blood Groups & Rh Factor',
          'Karl Landsteiner • ABO Compatibility',
          'emerald'
        ),
        accessType: 'free',
        published: true,
        summary:
          'Complete Everyday Science notes covering antigens, antibodies, universal donor (O−), universal recipient (AB+), and Rh incompatibility.',
        pageCount: 3,
        pages: [
          {
            pageNumber: 1,
            heading: 'Discovery of the ABO Blood Group System',
            subheading: 'Everyday Science • CSS / PMS / PPSC General Ability',
            paragraphs: [
              'Human blood groups were discovered by Austrian immunologist Karl Landsteiner in 1901, for which he was awarded the Nobel Prize in Physiology or Medicine in 1930.',
              'Blood classification is determined by the presence or absence of specific inherited antigenic substances on the surface of Red Blood Cells (erythrocytes) and corresponding antibodies in the blood plasma.',
              'The four primary ABO blood groups are Group A, Group B, Group AB, and Group O.',
            ],
            keyPoints: [
              'Discoverer of ABO System: Karl Landsteiner (1901).',
              'Antigens (Agglutinogens): Located on the surface membrane of Red Blood Cells.',
              'Antibodies (Agglutinins): Circulate in the blood plasma.',
            ],
          },
          {
            pageNumber: 2,
            heading: 'Antigen-Antibody Matrix & Transfusion Compatibility',
            subheading: 'Universal Donor vs. Universal Recipient',
            paragraphs: [
              'Group A possesses A-antigens on red blood cells and anti-B antibodies in the plasma. Group B possesses B-antigens on red blood cells and anti-A antibodies in the plasma.',
              'Group AB possesses both A and B antigens on red blood cells and neither anti-A nor anti-B antibodies in plasma, making AB+ the Universal Plasma Donor and Universal Red Cell Recipient.',
              'Group O possesses neither A nor B antigens on the cell membrane, which prevents agglutination when transfused into patients of other blood types. Specifically, O-negative (O−) is the Universal Red Blood Cell Donor.',
            ],
            keyPoints: [
              'Universal Red Cell Donor: O Negative (O−) — lacks A, B, and Rh(D) antigens.',
              'Universal Red Cell Recipient: AB Positive (AB+) — lacks anti-A, anti-B, and anti-Rh antibodies.',
              'Average adult human blood volume: 4.5 to 5.5 liters (approx. 7% of body weight).',
            ],
          },
          {
            pageNumber: 3,
            heading: 'Rhesus (Rh) Factor & Erythroblastosis Fetalis',
            subheading: 'Clinical Significance & Competitive Exam Takeaways',
            paragraphs: [
              'The Rh factor (Rhesus factor) was discovered by Karl Landsteiner and Alexander S. Wiener in 1940 through experiments with Rhesus monkeys. Individuals who have the D-antigen on their RBCs are Rh-positive (Rh+), while those lacking it are Rh-negative (Rh−).',
              'Rh incompatibility (Erythroblastosis fetalis) can occur when an Rh-negative mother carries an Rh-positive fetus, prompting maternal anti-Rh IgG antibodies to cross the placenta in subsequent pregnancies unless prevented by Rho(D) immune globulin.',
            ],
            keyPoints: [
              'Normal pH of human arterial blood: 7.35 to 7.45 (slightly alkaline).',
              'Lifespan of human Red Blood Cells (Erythrocytes): 120 days.',
              'Graveyard of Red Blood Cells: Spleen.',
            ],
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'note-1973-constitution',
        title: '1973 Constitution of Pakistan — Fundamental Rights & Key Articles',
        category: 'Pakistan Studies',
        coverUrl: createAcademicCoverSvgDataUrl(
          'Pakistan Studies',
          '1973 Constitution of Pakistan',
          'Fundamental Rights • Articles 8 to 28',
          'royal'
        ),
        accessType: 'free',
        published: true,
        summary:
          'Article-by-article breakdown of Part II Chapter 1 (Fundamental Rights), Principles of Policy, and major constitutional amendments.',
        pageCount: 3,
        pages: [
          {
            pageNumber: 1,
            heading: 'Promulgation & Salient Features of the 1973 Constitution',
            subheading: 'Adopted 10 April 1973 • Enforced 14 August 1973',
            paragraphs: [
              'The Constitution of the Islamic Republic of Pakistan (1973) was unanimously passed by the National Assembly on 10 April 1973 and came into force on 14 August 1973.',
              'It established a parliamentary form of government with a bicameral legislature (Majlis-e-Shoora) comprising the National Assembly (Lower House) and the Senate (Upper House).',
            ],
            keyPoints: [
              'Total Articles: 280 Articles divided into 12 Parts and 5 Schedules.',
              'Article 2: Islam shall be the State religion of Pakistan.',
              'Article 2A: Objectives Resolution made a substantive part of the Constitution.',
            ],
          },
          {
            pageNumber: 2,
            heading: 'Fundamental Rights (Articles 8 to 28)',
            subheading: 'High-Frequency Articles Tested in FPSC, PPSC & CSS',
            paragraphs: [
              'Article 8 declares that any law or custom inconsistent with Fundamental Rights shall be void. Article 9 guarantees Security of Person, while Article 10 provides safeguards as to arrest and detention.',
              'Article 10A (inserted by the 18th Amendment) guarantees the Right to Fair Trial. Article 19 ensures Freedom of Speech, and Article 19A guarantees the Right to Information.',
              'Article 25 guarantees Equality of Citizens before the law, and Article 25A mandates the State to provide free and compulsory education to all children aged 5 to 16 years.',
            ],
            keyPoints: [
              'Article 6: High Treason for abrogating or subverting the Constitution.',
              'Article 10A: Right to Fair Trial and due process.',
              'Article 25A: Right to Free & Compulsory Education (ages 5–16).',
            ],
          },
          {
            pageNumber: 3,
            heading: 'Landmark Constitutional Amendments Overview',
            subheading: '18th Amendment (2010) & Provincial Autonomy',
            paragraphs: [
              'The 18th Constitutional Amendment (2010) restored the parliamentary character of the 1973 Constitution, abolished the Concurrent Legislative List, devolved ministries to the provinces, and renamed NWFP as Khyber Pakhtunkhwa.',
              'It also strengthened the Council of Common Interests (CCI) and reformed the judicial appointment procedure through Article 175A.',
            ],
            keyPoints: [
              '1st Amendment (1974): Redefined boundaries of Pakistan.',
              '8th Amendment (1985): Introduced Article 58(2)(b) presidential dissolution power.',
              '18th Amendment (2010): Restored parliamentary supremacy and provincial autonomy.',
            ],
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'note-css-essay-masterclass-paid',
        title: 'CSS Essay & Precis Structuring Blueprint (Premium Edition)',
        category: 'English Precis & Essay',
        coverUrl: createAcademicCoverSvgDataUrl(
          'Premium Note',
          'CSS Essay & Precis Blueprint',
          'Thesis Formulation • Outlines & Transitions',
          'gold'
        ),
        accessType: 'paid',
        published: true,
        summary:
          'Exclusive premium guide with 25 scored CSS essay outlines, thesis statement templates, paragraph coherence frameworks, and solved precis exercises.',
        pageCount: 18,
        pages: [
          {
            pageNumber: 1,
            heading: 'Mastering the CSS English Essay Outline & Thesis Statement',
            subheading: 'Protected Premium Study Material • EXAMORA PAKISTAN',
            paragraphs: [
              'A winning CSS Essay requires an arguable thesis statement, mutually exclusive and collectively exhaustive (MECE) outline headings, and smooth discourse markers connecting each paragraph.',
            ],
            keyPoints: ['Exclusive Paid Material — Authorized Access Only.'],
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'note-indus-water-treaty-paid',
        title: 'Indus Waters Treaty 1960 & Hydropolitics of South Asia',
        category: 'Current Affairs',
        coverUrl: createAcademicCoverSvgDataUrl(
          'Current Affairs',
          'Indus Waters Treaty & Hydropolitics',
          'Eastern vs Western Rivers • Dispute Resolution',
          'crimson'
        ),
        accessType: 'paid',
        published: true,
        summary:
          'Comprehensive dossier on the 1960 Indus Waters Treaty, Kishanganga and Ratle hydroelectric disputes, Permanent Indus Commission, and climate resilience.',
        pageCount: 14,
        pages: [
          {
            pageNumber: 1,
            heading: 'Architecture of the Indus Waters Treaty (1960)',
            subheading: 'Protected Premium Dossier • EXAMORA PAKISTAN',
            paragraphs: [
              'Signed in Karachi on 19 September 1960 by President Ayub Khan and Prime Minister Jawaharlal Nehru and brokered by the World Bank, the treaty allocated the three Eastern Rivers (Ravi, Beas, Sutlej) to India and the three Western Rivers (Indus, Jhelum, Chenab) to Pakistan.',
            ],
            keyPoints: ['Exclusive Paid Material — Authorized Access Only.'],
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
    ],
    pdfs: [
      {
        id: 'pdf-pakistan-affairs-compendium',
        title: 'Pakistan Affairs — Complete Notes & Chronology (CSS / PMS)',
        category: 'CSS / PMS',
        authorOrSource: 'EXAMORA Academic Editorial Board',
        coverUrl: createAcademicCoverSvgDataUrl(
          'CSS / PMS Book',
          'Pakistan Affairs Complete Notes',
          '712 AD to Post-1947 Constitutional History',
          'navy'
        ),
        accessType: 'free',
        published: true,
        pageCount: 4,
        pages: [
          {
            pageNumber: 1,
            heading: 'Chapter 1: Reform Movements in South Asian Islam (1700–1900)',
            subheading: 'Shah Waliullah, Faraizi Movement & Aligarh Movement',
            paragraphs: [
              'Shah Waliullah (1703–1762) initiated intellectual and socio-political revival among Indian Muslims after the passing of Emperor Aurangzeb. He translated the Holy Quran into Persian (Fath-ur-Rahman) and authored Hujjatullah-il-Baligha.',
              'Haji Shariatullah founded the Faraizi Movement in Eastern Bengal (1818) to protect Muslim peasantry from agrarian exploitation and revive obligatory religious duties.',
              'Sir Syed Ahmad Khan (1817–1898) launched the Aligarh Movement after the War of Independence 1857, founding the Scientific Society (1864) and Muhammadan Anglo-Oriental College at Aligarh (1875).',
            ],
            keyPoints: [
              'Shah Waliullah born: 21 February 1703 (Delhi); real name: Qutb-ud-Din Ahmad.',
              'Asbab-e-Baghawat-e-Hind authored by Sir Syed Ahmad Khan in 1859.',
              'MAO College Aligarh elevated to Muslim University in 1920.',
            ],
          },
          {
            pageNumber: 2,
            heading: 'Chapter 2: Constitutional Milestones (1905–1935)',
            subheading: 'Partition of Bengal, Simla Deputation, Lucknow Pact & Fourteen Points',
            paragraphs: [
              'The Partition of Bengal took place on 16 October 1905 during the viceroyalty of Lord Curzon, creating Eastern Bengal and Assam with Dhaka as capital, before its annulment on 12 December 1911.',
              'On 1 October 1906, a 35-member Muslim delegation led by Sir Sultan Muhammad Shah (Aga Khan III) met Viceroy Lord Minto at Simla to demand separate electorates, which were granted in the Minto-Morley Reforms of 1909.',
              'The All-India Muslim League was founded at Dhaka on 30 December 1906 during the Muhammadan Educational Conference hosted by Nawab Salimullah Khan.',
            ],
            keyPoints: [
              'Lucknow Pact (1916): Earned Quaid-e-Azam the title Ambassador of Hindu-Muslim Unity.',
              'Delhi Muslim Proposals: Presented in March 1927.',
              'Quaid-e-Azam’s Fourteen Points: Presented on 28 March 1929 in response to the Nehru Report.',
            ],
          },
          {
            pageNumber: 3,
            heading: 'Chapter 3: Allama Iqbal’s Allahabad Address & Round Table Conferences',
            subheading: '1930–1937 Constitutional Evolution',
            paragraphs: [
              'Delivering the presidential address at the 21st Annual Session of the All-India Muslim League at Allahabad on 29 December 1930, Allama Muhammad Iqbal proposed the amalgamation of Punjab, NWFP, Sindh, and Balochistan into a consolidated North-West Indian Muslim State.',
              'Three Round Table Conferences were held in London between 1930 and 1932, culminating in the Government of India Act 1935, which separated Sindh from Bombay Presidency and introduced provincial autonomy.',
            ],
            keyPoints: [
              'Choudhry Rahmat Ali coined the name PAKISTAN in the pamphlet "Now or Never" (28 January 1933).',
              '1937 Provincial Elections and Congress Rule (1937–1939); Day of Deliverance observed on 22 December 1939.',
            ],
          },
          {
            pageNumber: 4,
            heading: 'Chapter 4: Post-1947 Early Administrative & Constitutional Challenges',
            subheading: 'Objectives Resolution 1949 to the 1956 & 1962 Constitutions',
            paragraphs: [
              'Upon independence on 14 August 1947, Quaid-e-Azam Muhammad Ali Jinnah took oath as the first Governor-General of Pakistan and Nawabzada Liaquat Ali Khan as the first Prime Minister.',
              'On 12 March 1949, the First Constituent Assembly adopted the Objectives Resolution moved by Prime Minister Liaquat Ali Khan, establishing sovereignty of Allah Almighty and democratic principles of social justice.',
            ],
            keyPoints: [
              'Pakistan admitted to the United Nations: 30 September 1947.',
              'State Bank of Pakistan inaugurated by Quaid-e-Azam: 1 July 1948.',
              'First Constitution of Pakistan enforced: 23 March 1956.',
            ],
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'pdf-everyday-science-mcqs',
        title: 'Everyday Science & General Ability Handbook (1000+ Key Facts)',
        category: 'General Science',
        authorOrSource: 'EXAMORA Science Faculty',
        coverUrl: createAcademicCoverSvgDataUrl(
          'General Science',
          'Everyday Science MCQs & Facts',
          'Physics • Chemistry • Biology • Astronomy',
          'emerald'
        ),
        accessType: 'free',
        published: true,
        pageCount: 3,
        pages: [
          {
            pageNumber: 1,
            heading: 'Section 1: Physical Sciences, SI Units & Scientific Instruments',
            subheading: 'FPSC / PPSC / CSS General Science & Ability',
            paragraphs: [
              'The International System of Units (SI) defines seven base units: meter (length), kilogram (mass), second (time), ampere (electric current), kelvin (thermodynamic temperature), mole (amount of substance), and candela (luminous intensity).',
              'Scientific instruments frequently tested in competitive exams include the Barometer (atmospheric pressure, invented by Evangelista Torricelli), Hygrometer (relative humidity), Anemometer (wind speed), Lactometer (milk purity/density), and Seismograph (earthquake intensity).',
            ],
            keyPoints: [
              'Speed of light in vacuum: 2.998 × 10^8 m/s (approx. 300,000 km/s).',
              'Light-year measures astronomical distance (approx. 9.46 × 10^12 km).',
              '1 Astronomical Unit (AU): Mean Earth-Sun distance (~149.6 million km).',
            ],
          },
          {
            pageNumber: 2,
            heading: 'Section 2: Vitamins, Deficiencies & Human Physiology',
            subheading: 'Fat-Soluble (A, D, E, K) vs. Water-Soluble (B-Complex, C)',
            paragraphs: [
              'Vitamins are organic micronutrients essential for metabolic regulation. Fat-soluble vitamins (A, D, E, K) are stored in adipose tissue and the liver, whereas water-soluble vitamins (Vitamin B-complex and Vitamin C) must be replenished regularly in the diet.',
              'Deficiency of Vitamin A (Retinol) causes Night Blindness (Nyctalopia) and Xerophthalmia. Deficiency of Vitamin B1 (Thiamine) causes Beriberi. Deficiency of Vitamin C (Ascorbic Acid) causes Scurvy. Deficiency of Vitamin D (Calciferol) causes Rickets in children and Osteomalacia in adults.',
            ],
            keyPoints: [
              'Vitamin K (Phylloquinone) is essential for blood coagulation (prothrombin synthesis).',
              'Largest gland in the human body: Liver; Largest organ: Skin.',
              'Master endocrine gland: Pituitary gland (located at the base of the brain).',
            ],
          },
          {
            pageNumber: 3,
            heading: 'Section 3: Atmospheric Layers & Environmental Science',
            subheading: 'Troposphere, Stratosphere, Mesosphere, Thermosphere & Exosphere',
            paragraphs: [
              'Earth’s atmosphere consists of 78.08% Nitrogen, 20.95% Oxygen, 0.93% Argon, and ~0.04% Carbon Dioxide along with trace gases and water vapor.',
              'All weather phenomena occur in the Troposphere (0–12 km). The Stratosphere (12–50 km) contains the Ozone Layer (O3), which absorbs harmful solar ultraviolet (UV-B) radiation. The Mesosphere (50–85 km) is the coldest atmospheric layer where meteors burn up.',
            ],
            keyPoints: [
              'Montreal Protocol (1987): Global treaty to phase out ozone-depleting substances (CFCs).',
              'Kyoto Protocol (1997) & Paris Agreement (2015): Greenhouse gas emission frameworks.',
            ],
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'pdf-english-precis-vocabulary',
        title: 'English Precis, Idioms & Pair of Words Compendium',
        category: 'English',
        authorOrSource: 'EXAMORA Language Wing',
        coverUrl: createAcademicCoverSvgDataUrl(
          'English Compulsory',
          'English Precis & Vocabulary',
          'High-Yield Idioms • Corrections • Synonyms',
          'royal'
        ),
        accessType: 'free',
        published: true,
        pageCount: 3,
        pages: [
          {
            pageNumber: 1,
            heading: 'Part 1: Golden Rules of English Precis Writing',
            subheading: 'One-Third Length Rule, Third-Person Voice & Objective Tone',
            paragraphs: [
              'A precis is a clear, compact, and logical summary of a passage preserving its essential ideas in roughly one-third of the original word count.',
              'Always write in your own words, use indirect speech and the third-person pronoun, avoid personal commentary or examples not central to the thesis, and assign a concise title reflecting the central theme.',
            ],
            keyPoints: [
              'Target Word Count: Strictly 33% (±5 words) of the original passage.',
              'Avoid direct quotations, rhetorical questions, and first-person pronouns.',
            ],
          },
          {
            pageNumber: 2,
            heading: 'Part 2: High-Frequency CSS / FPSC Pair of Words',
            subheading: 'Distinguishing Homophones & Confusable Lexical Pairs',
            paragraphs: [
              '1. Affect (verb: to influence) vs. Effect (noun: result; verb: to bring about). 2. Allusion (indirect reference) vs. Illusion (deceptive appearance). 3. Apprise (to inform) vs. Appraise (to assess value).',
              '4. Compliment (expression of praise) vs. Complement (that which completes). 5. Eminent (distinguished/famous) vs. Imminent (about to happen). 6. Judicial (relating to courts) vs. Judicious (wise and prudent).',
            ],
            keyPoints: [
              'Discrete (separate/distinct) vs. Discreet (careful/tactful).',
              'Stationary (not moving) vs. Stationery (writing materials).',
            ],
          },
          {
            pageNumber: 3,
            heading: 'Part 3: Essential Idiomatic Expressions for Competitive Exams',
            subheading: 'Meanings & Contextual Usage',
            paragraphs: [
              '• A Pyrrhic victory: A victory won at such a devastating cost that it amounts to defeat.\n• To cross the Rubicon: To take an irrevocable step.\n• To bury the hatchet: To end a quarrel and make peace.\n• A white elephant: A costly possession that is burdensome to maintain.',
            ],
            keyPoints: [
              'To read between the lines: To discern a hidden or implicit meaning.',
              'Swan song: The final performance or farewell achievement of a career.',
            ],
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'pdf-islamiat-core-concepts',
        title: 'Islamic Studies (Islamiat) — Governance, Human Rights & Seerah',
        category: 'Islamiat',
        authorOrSource: 'EXAMORA Islamic Studies Panel',
        coverUrl: createAcademicCoverSvgDataUrl(
          'Islamiat Compulsory',
          'Islamic Studies Core Manual',
          'Seerah • Khulafa-e-Rashideen • Governance',
          'gold'
        ),
        accessType: 'free',
        published: true,
        pageCount: 2,
        pages: [
          {
            pageNumber: 1,
            heading: 'Charter of Madinah (Mithaq-e-Madinah) & Pluralistic Statecraft',
            subheading: 'First Written Constitution in World History (1 AH / 622 CE)',
            paragraphs: [
              'Following the Hijrah to Madinah in 622 CE, Prophet Muhammad (PBUH) promulgated the Charter of Madinah (Mithaq-e-Madinah), establishing a multi-religious commonwealth uniting the Muhajirun, Ansar, and Jewish tribes under common citizenship, mutual defense, and freedom of religion.',
            ],
            keyPoints: [
              'Total Clauses of Mithaq-e-Madinah: 47 (or 52 in detailed breakdowns).',
              'Treaty of Hudaybiyyah: Concluded in 6 AH (628 CE), termed "Fath-e-Mubeen" (Clear Victory).',
            ],
          },
          {
            pageNumber: 2,
            heading: 'The Last Sermon (Khutbah Hajjat-ul-Wida) — Universal Human Rights',
            subheading: 'Delivered on 9th Dhul-Hijjah 10 AH (632 CE) at Plain of Arafat',
            paragraphs: [
              'The Farewell Sermon abolished racial superiority, blood feuds of the Pre-Islamic era, and usury (Riba), while establishing the sanctity of life, property, and honor, and guaranteeing the rights of women and laborers.',
            ],
            keyPoints: [
              'Abolished Arab vs. non-Arab and white vs. black superiority; Taqwa is the sole criterion of honor.',
            ],
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
    ],
    quizzes: [
      {
        id: 'quiz-daily-gk-1',
        title: "Today's Competitive Exam General Knowledge Quiz",
        category: 'General Knowledge',
        instructions:
          'Select the single best answer for each question. Click Submit Quiz when finished to view your final score and detailed explanations.',
        published: true,
        createdAt: now,
        updatedAt: now,
        questions: [
          {
            id: 'q-poet-of-east',
            questionText: "Who is known as the 'Poet of the East'?",
            options: [
              'Faiz Ahmed Faiz',
              'Allama Muhammad Iqbal',
              'Mirza Ghalib',
              'Hafeez Jalandhari',
            ],
            correctIndex: 1,
            explanation:
              'Allama Muhammad Iqbal (1877–1938), the national poet and philosophical visionary of Pakistan, is revered as Shaykh-ul-Mashriq (Poet of the East).',
          },
          {
            id: 'q-lahore-resolution-mover',
            questionText:
              'Who moved the historic Lahore Resolution on 23 March 1940 at Minto Park?',
            options: [
              'Chaudhry Khaliquzzaman',
              'Nawabzada Liaquat Ali Khan',
              'A.K. Fazlul Haq',
              'Sardar Abdur Rab Nishtar',
            ],
            correctIndex: 2,
            explanation:
              'Sher-e-Bangla A.K. Fazlul Haq, then Premier of Bengal, formally presented the Lahore Resolution on 23 March 1940.',
          },
          {
            id: 'q-universal-donor',
            questionText:
              'Which human blood group is recognized as the Universal Red Blood Cell Donor?',
            options: ['AB Positive (AB+)', 'O Negative (O−)', 'A Positive (A+)', 'B Negative (B−)'],
            correctIndex: 1,
            explanation:
              'O Negative (O−) red blood cells lack A, B, and Rh(D) surface antigens, allowing safe emergency transfusion across blood types.',
          },
          {
            id: 'q-education-article',
            questionText:
              'Which Article of the 1973 Constitution guarantees Free and Compulsory Education for children aged 5 to 16?',
            options: ['Article 10A', 'Article 19A', 'Article 25A', 'Article 37'],
            correctIndex: 2,
            explanation:
              'Article 25A, inserted through the 18th Constitutional Amendment (2010), obligates the State to provide free and compulsory education to all children aged 5 to 16 years.',
          },
          {
            id: 'q-state-bank-inauguration',
            questionText:
              'When did Quaid-e-Azam Muhammad Ali Jinnah inaugurate the State Bank of Pakistan?',
            options: ['14 August 1947', '1 July 1948', '12 March 1949', '23 March 1956'],
            correctIndex: 1,
            explanation:
              'Quaid-e-Azam Muhammad Ali Jinnah inaugurated the State Bank of Pakistan in Karachi on 1 July 1948, with Zahid Husain as its first Governor.',
          },
        ],
      },
      {
        id: 'quiz-pakistan-affairs-2',
        title: 'CSS & PPSC Constitutional History & Geography Quiz',
        category: 'Pakistan Studies',
        instructions:
          'Test your command over Pakistan constitutional history, geography, and mountain ranges.',
        published: true,
        createdAt: now,
        updatedAt: now,
        questions: [
          {
            id: 'q-objectives-resolution',
            questionText: 'When did the First Constituent Assembly adopt the Objectives Resolution?',
            options: ['11 August 1947', '12 March 1949', '23 March 1956', '8 June 1962'],
            correctIndex: 1,
            explanation:
              'The Objectives Resolution was presented by Prime Minister Liaquat Ali Khan on 7 March 1949 and adopted by the Constituent Assembly on 12 March 1949.',
          },
          {
            id: 'q-k2-range',
            questionText:
              'K2 (Godwin-Austen), the second-highest peak in the world (8,611 m), is located in which mountain range?',
            options: ['Himalayas', 'Hindu Kush', 'Karakoram Range', 'Sulaiman Range'],
            correctIndex: 2,
            explanation:
              'K2 (8,611 meters) lies in the Karakoram Range in Gilgit-Baltistan.',
          },
          {
            id: 'q-indus-treaty-year',
            questionText:
              'In which year was the Indus Waters Treaty signed in Karachi between Pakistan and India?',
            options: ['1948', '1954', '1960', '1965'],
            correctIndex: 2,
            explanation:
              'The Indus Waters Treaty was signed on 19 September 1960 in Karachi by President Ayub Khan and Prime Minister Jawaharlal Nehru.',
          },
        ],
      },
    ],
    pastPapers: [
      {
        id: 'paper-css-pak-affairs-2025',
        title: 'CSS Competitive Examination — Pakistan Affairs Paper',
        examName: 'CSS',
        year: 2025,
        subject: 'Pakistan Affairs',
        coverUrl: createAcademicCoverSvgDataUrl(
          'CSS Past Paper',
          'CSS Pakistan Affairs 2025',
          'Part I (MCQs) & Part II (Subjective)',
          'navy'
        ),
        accessType: 'free',
        published: true,
        pageCount: 2,
        pages: [
          {
            pageNumber: 1,
            heading: 'Federal Public Service Commission — CSS Pakistan Affairs (2025)',
            subheading: 'Time Allowed: 3 Hours | Maximum Marks: 100 | Pass Marks: 40',
            paragraphs: [
              'PART-II (Subjective — 80 Marks): Attempt ONLY FOUR questions from Part-II. All questions carry equal marks (20 marks each).',
              'Q.2: Critically evaluate the role of the Aligarh Movement in bridging the educational and political transition of Indian Muslims during the late 19th century.',
              'Q.3: Analyze the constitutional evolution of Federalism in Pakistan with special reference to the 18th Constitutional Amendment and fiscal decentralization under the NFC Award.',
              'Q.4: Examine the strategic, economic, and regional connectivity implications of the China-Pakistan Economic Corridor (CPEC) Phase-II industrial cooperation.',
            ],
            keyPoints: [
              'Focus on analytical structure: Introduction, Historical/Legal Context, Critical Analysis, Way Forward, and Conclusion.',
            ],
          },
          {
            pageNumber: 2,
            heading: 'Part-II Continued & Examiner Scoring Rubric',
            subheading: 'Questions 5 to 8',
            paragraphs: [
              'Q.5: Discuss the challenges of climate change, glacial melt, and integrated water resource management in the Indus Basin.',
              'Q.6: Assess the key milestones of Pakistan’s foreign policy toward Central Asian Republics and the Middle East.',
              'Q.7: Deliberate on demographic youth dividends, technical vocational education, and digital economy exports in Pakistan.',
              'Q.8: Trace the ideological linkage between Allama Iqbal’s 1930 Allahabad Address and the 1940 Lahore Resolution.',
            ],
            keyPoints: [
              'Support arguments with constitutional articles, economic survey statistics, and authoritative historical citations.',
            ],
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'paper-css-english-precis-2025',
        title: 'CSS Competitive Examination — English Precis & Composition',
        examName: 'CSS',
        year: 2025,
        subject: 'English Precis & Composition',
        coverUrl: createAcademicCoverSvgDataUrl(
          'CSS Past Paper',
          'English Precis & Composition',
          'CSS 2025 • Precis, Comprehension & Idioms',
          'royal'
        ),
        accessType: 'free',
        published: true,
        pageCount: 2,
        pages: [
          {
            pageNumber: 1,
            heading: 'CSS English Precis & Composition Paper (2025)',
            subheading: 'Time Allowed: 3 Hours | Maximum Marks: 100',
            paragraphs: [
              'Q.2 (20 Marks): Write a precis of the given passage in about one-third of its original length and suggest a suitable title.',
              'Q.3 (20 Marks): Read the following philosophical passage carefully and answer the questions appended at the end in your own words.',
              'Q.4 (10 Marks): Correct ONLY FIVE of the following sentences, addressing syntax, subjunctive mood, and modifier placement.',
            ],
            keyPoints: [
              'Passing threshold in English Precis & Composition is 40/100.',
            ],
          },
          {
            pageNumber: 2,
            heading: 'Grammar, Pair of Words, Idioms & Translation Section',
            subheading: 'Questions 5 to 7',
            paragraphs: [
              'Q.5 (10 Marks): Punctuate the following passage and rewrite five sentences from Direct to Indirect Narration.',
              'Q.6 (10 Marks): Use ONLY FIVE pairs of words in sentences that clearly bring out their difference in meaning.',
              'Q.7 (10 Marks): Translate the following Urdu paragraph into idiomatic English preserving tense consistency.',
            ],
            keyPoints: [
              'Practice daily vocabulary and grammar rules in the EXAMORA Notes section.',
            ],
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'paper-pms-gk-2024',
        title: 'PMS Combined Competitive Exam — General Knowledge Paper',
        examName: 'PMS',
        year: 2024,
        subject: 'General Knowledge',
        coverUrl: createAcademicCoverSvgDataUrl(
          'PMS Past Paper',
          'PMS General Knowledge 2024',
          '100 MCQs • Current Affairs & Science',
          'emerald'
        ),
        accessType: 'free',
        published: true,
        pageCount: 2,
        pages: [
          {
            pageNumber: 1,
            heading: 'Provincial Management Service (PMS) — General Knowledge Paper (2024)',
            subheading: '100 Multiple Choice Questions | Time Allowed: 2 Hours',
            paragraphs: [
              '1. Which treaty established the modern system of sovereign nation-states in 1648? Answer: Peace of Westphalia.',
              '2. Where is the headquarters of the International Court of Justice (ICJ) located? Answer: The Hague, Netherlands.',
              '3. Which gas is predominantly responsible for the stratospheric ozone layer depletion? Answer: Chlorofluorocarbons (CFCs).',
              '4. Who was the first Chief Justice of Pakistan? Answer: Sir Abdul Rashid.',
            ],
            keyPoints: [
              'Note negative marking rules (0.25 deduction per wrong answer in PPSC/PMS objective tests).',
            ],
          },
          {
            pageNumber: 2,
            heading: 'Selected High-Yield Questions (Questions 5 to 12)',
            subheading: 'Geography, Computer Science & Pakistan Studies',
            paragraphs: [
              '5. Which pass connects Chitral with Gilgit? Answer: Shandur Pass.\n6. Which protocol is used to securely transfer hypertext over a network? Answer: HTTPS.\n7. Which dam is constructed on the River Jhelum? Answer: Mangla Dam.\n8. In which year did Pakistan become a member of the Shanghai Cooperation Organisation (SCO)? Answer: June 2017.',
            ],
            keyPoints: [
              'Focus on precision to avoid negative marking penalties.',
            ],
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'paper-fpsc-inspector-2024',
        title: 'FPSC General Recruitment — Inspector / Assistant Director Paper',
        examName: 'FPSC',
        year: 2024,
        subject: 'General Recruitment (BS-16/17)',
        coverUrl: createAcademicCoverSvgDataUrl(
          'FPSC Past Paper',
          'FPSC Assistant Director 2024',
          'English (20%) & General Intelligence (80%)',
          'navy'
        ),
        accessType: 'free',
        published: true,
        pageCount: 2,
        pages: [
          {
            pageNumber: 1,
            heading: 'FPSC Consolidated Screening Test (BS-17) — 2024',
            subheading: 'Part-I English (20 Marks) & Part-II General Intelligence (80 Marks)',
            paragraphs: [
              'Section A: English Grammar, Prepositions, and Vocabulary in Context (Questions 1–20).',
              'Section B: Pakistan Studies, Islamic Studies, Current Affairs, Everyday Science, and Basic Arithmetic (Questions 21–100).',
            ],
            keyPoints: [
              'FPSC screening tests do not carry negative marking.',
            ],
          },
          {
            pageNumber: 2,
            heading: 'Quantitative Reasoning & Everyday Science Solved Section',
            subheading: 'Ratios, Percentages, Averages & Algebra',
            paragraphs: [
              'Sample Problem 1: If the price of a commodity increases by 25%, by what percentage must a household reduce consumption to keep expenditure unchanged? Solution: [25 / (100 + 25)] × 100 = 20%.',
              'Sample Problem 2: A train 150m long is running at 54 km/h (15 m/s). How long does it take to cross a telegraph pole? Solution: 150m / 15 m/s = 10 seconds.',
            ],
            keyPoints: [
              'Convert km/h to m/s by multiplying by 5/18.',
            ],
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'paper-ppsc-lecturer-2024',
        title: 'PPSC Lecturer (BS-17) General Ability & Subject Paper',
        examName: 'PPSC',
        year: 2024,
        subject: 'General Ability & Pedagogy',
        coverUrl: createAcademicCoverSvgDataUrl(
          'PPSC Past Paper',
          'PPSC Lecturer (BS-17) 2024',
          'Subject Core (80%) & General Knowledge (20%)',
          'gold'
        ),
        accessType: 'free',
        published: true,
        pageCount: 1,
        pages: [
          {
            pageNumber: 1,
            heading: 'PPSC Lecturer Recruitment Examination Structure (2024)',
            subheading: '80% Subject Qualification + 20% General Knowledge & Urdu/English',
            paragraphs: [
              'The Punjab Public Service Commission Lecturer (BS-17) paper comprises 80 MCQs from the candidate’s core Master/BS discipline and 20 MCQs covering Pakistan Studies, Current Affairs, Geography, Everyday Science, Basic Computer Studies, and Urdu.',
            ],
            keyPoints: [
              'Time Allowed: 90 Minutes | Total Marks: 100.',
            ],
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'paper-nts-gat-general-2024',
        title: 'NTS GAT General — Verbal, Quantitative & Analytical Reasoning',
        examName: 'NTS',
        year: 2024,
        subject: 'Verbal & Analytical Aptitude',
        coverUrl: createAcademicCoverSvgDataUrl(
          'NTS Past Paper',
          'NTS GAT General 2024',
          'Verbal (35%) • Quantitative (35%) • Analytical (30%)',
          'crimson'
        ),
        accessType: 'free',
        published: true,
        pageCount: 1,
        pages: [
          {
            pageNumber: 1,
            heading: 'NTS Graduate Assessment Test (GAT-General) Overview',
            subheading: 'Verbal, Quantitative, and Analytical Reasoning Practice Set',
            paragraphs: [
              'Analytical Reasoning questions evaluate deductive logic through ordering games (linear sequencing) and grouping games (selection constraints). Always diagram constraints systematically before evaluating options.',
            ],
            keyPoints: [
              'Minimum qualifying score for M.Phil/MS admission & HEC scholarships is 50/100.',
            ],
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
    ],
    jobs: [
      {
        id: 'job-ppsc-lecturer-bs17',
        title: 'Lecturer (BS-17) — Various Subjects (Sample Recruitment Notice)',
        organization: 'PUNJAB PUBLIC SERVICE COMMISSION',
        location: 'Punjab',
        qualification: "Master's / BS (16 years) in Relevant Subject",
        publicationDate: '2026-10-20',
        deadline: '2026-11-05',
        summary:
          'Sample recruitment listing for Higher Education Department (Male & Female Wing) across multiple disciplines including English, Pakistan Studies, Biology, Chemistry, Physics, and Computer Science.',
        officialUrl: '',
        published: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'job-fpsc-assistant-director-bs17',
        title: 'Assistant Director (BS-17) — Consolidated Advertisement (Sample Listing)',
        organization: 'FEDERAL PUBLIC SERVICE COMMISSION',
        location: 'Islamabad / Nationwide',
        qualification: "Second Class or Grade 'C' Master's / BS (16 years)",
        publicationDate: '2026-10-20',
        deadline: '2026-11-18',
        summary:
          'Sample federal recruitment notice for general cadre administrative and investigation posts. Written test comprises English (20%) and General Intelligence (80%).',
        officialUrl: '',
        published: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'job-pms-combined-exam',
        title: 'PMS Combined Competitive Examination (Sample Schedule Notice)',
        organization: 'PUNJAB PUBLIC SERVICE COMMISSION',
        location: 'Lahore / Punjab',
        qualification: 'Graduation (14 or 16 years) from HEC-recognized university',
        publicationDate: '2026-10-18',
        deadline: '2026-11-28',
        summary:
          'Sample notice for Provincial Management Service (BS-17) competitive examination covering 600 marks of compulsory subjects and 600 marks of optional subjects.',
        officialUrl: '',
        published: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'job-kppsc-subject-specialist-expired',
        title: 'Subject Specialist (BS-17) — Elementary & Secondary Education (Sample Archive)',
        organization: 'KHYBER PAKHTUNKHWA PUBLIC SERVICE COMMISSION',
        location: 'Peshawar / KP',
        qualification: 'Master / BS (16 Years) with B.Ed',
        publicationDate: '2026-09-12',
        deadline: '2026-10-05',
        summary:
          'Archived sample listing illustrating deadline expiration tracking for completed recruitment cycles.',
        officialUrl: '',
        published: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    announcements: [
      {
        id: 'ann-lahore-resolution-note',
        typeBadge: 'Note',
        title: 'Lahore Resolution 1940 — Constitutional & Historical Analysis',
        publicationDate: '20 Oct 2026',
        targetPage: '/notes',
        published: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ann-blood-groups-note',
        typeBadge: 'Note',
        title: 'Human blood groups & Rh compatibility study note published',
        publicationDate: '20 Oct 2026',
        targetPage: '/notes',
        published: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ann-lecturer-job',
        typeBadge: 'Job',
        title: 'Lecturer (BS-17) — Various Subjects (Sample Notice)',
        publicationDate: '20 Oct 2026',
        targetPage: '/jobs',
        published: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ann-assistant-director-job',
        typeBadge: 'Job',
        title: 'Assistant Director (BS-17) — Federal Cadre (Sample Notice)',
        publicationDate: '20 Oct 2026',
        targetPage: '/jobs',
        published: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    contactSubmissions: [],
  };
}
