-- ===================================================================
-- INITIAL DATA SEEDING
-- ===================================================================
-- Seeds the database with initial data for the multi-blog system
-- Includes 10 subdomains and sample content
-- ===================================================================

-- ===================================================================
-- 1. SEED SUBDOMAINS (10 subdomains as per PRD)
-- ===================================================================
INSERT INTO public.subdomains (name, display_name, theme_color, description, icon_emoji) VALUES
('tech', 'Technology', 'primary', 'Latest innovations, gadgets, and tech trends shaping our digital future', '💻'),
('food', 'Food & Culture', 'success', 'Global cuisines, recipes, and culinary traditions from around the world', '🍽️'),
('travel', 'Travel', 'warning', 'Destinations, travel tips, and adventure stories for wanderlust souls', '✈️'),
('lifestyle', 'Lifestyle', 'info', 'Health, wellness, and modern living tips for a balanced life', '🌟'),
('business', 'Business', 'dark', 'Market trends, entrepreneurship, and finance insights for success', '📈'),
('health', 'Health', 'success', 'Medical breakthroughs, wellness tips, and health-conscious living', '🏥'),
('sports', 'Sports', 'danger', 'Athletic achievements, sporting events, and fitness inspiration', '⚽'),
('entertainment', 'Entertainment', 'primary', 'Movies, music, celebrities, and pop culture news', '🎬'),
('fashion', 'Fashion', 'primary', 'Style trends, designer showcases, and fashion week highlights', '👗'),
('science', 'Science', 'secondary', 'Research discoveries, scientific breakthroughs, and innovation', '🔬');

-- ===================================================================
-- 2. SEED SAMPLE POSTS (2-3 posts per subdomain for testing)
-- ===================================================================

-- Technology Posts
INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, status, meta_title, meta_description, tags, published_at) VALUES
(
    (SELECT id FROM public.subdomains WHERE name = 'tech'),
    'Artificial Intelligence Revolution: What 2024 Holds',
    'ai-revolution-2024',
    'Artificial Intelligence continues to transform industries at an unprecedented pace. From generative AI to autonomous systems, 2024 promises to be a landmark year for technological advancement.

## The Current State of AI

The AI landscape has evolved dramatically over the past year. Large Language Models (LLMs) have become more sophisticated, while specialized AI applications are finding their way into everyday business operations.

## Key Trends to Watch

1. **Multimodal AI Systems**: Integration of text, image, and audio processing
2. **AI Governance**: Increased focus on ethical AI and regulation
3. **Edge AI**: Bringing AI processing closer to data sources
4. **AI Democratization**: Making AI accessible to smaller businesses

## Impact on Industries

Healthcare, finance, education, and manufacturing are all experiencing AI-driven transformations. Companies that adapt quickly are gaining significant competitive advantages.

The future of AI is not just about technology—it''s about how we integrate these powerful tools into our daily lives and work processes.',
    'Explore the latest AI trends and technological breakthroughs shaping 2024, from multimodal systems to AI governance.',
    'published',
    'AI Revolution 2024: Latest Trends & Breakthroughs',
    'Discover the AI trends shaping 2024, including multimodal systems, governance, and industry transformations.',
    '{"artificial-intelligence", "technology", "trends", "2024", "innovation"}',
    NOW() - INTERVAL '2 days'
),
(
    (SELECT id FROM public.subdomains WHERE name = 'tech'),
    'The Future of Quantum Computing: Beyond the Hype',
    'quantum-computing-future',
    'Quantum computing is moving from theoretical concept to practical reality. Major tech companies are investing billions in quantum research, and the first commercial applications are emerging.

## Understanding Quantum Advantage

Unlike classical computers that use bits (0 or 1), quantum computers use quantum bits (qubits) that can exist in multiple states simultaneously. This property, called superposition, enables quantum computers to process certain types of calculations exponentially faster.

## Current Developments

- **IBM Quantum Network**: Over 140 organizations collaborating on quantum research
- **Google''s Quantum Supremacy**: Achieving computational tasks impossible for classical computers
- **Microsoft Azure Quantum**: Cloud-based quantum computing services

## Real-World Applications

### Drug Discovery
Pharmaceutical companies are using quantum simulation to model molecular interactions, potentially reducing drug development time from decades to years.

### Financial Modeling
Banks are exploring quantum algorithms for risk analysis, portfolio optimization, and fraud detection.

### Cryptography
Quantum computing poses both opportunities and challenges for cybersecurity, requiring new encryption methods.

The quantum revolution is not a distant future—it''s happening now.',
    'Quantum computing is transitioning from theory to practice. Explore current developments and real-world applications in this comprehensive guide.',
    'published',
    'Quantum Computing: From Theory to Practice',
    'Explore quantum computing developments, applications in drug discovery, finance, and cybersecurity.',
    '{"quantum-computing", "technology", "innovation", "science", "future"}',
    NOW() - INTERVAL '5 days'
);

-- Food Posts
INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, status, meta_title, meta_description, tags, published_at) VALUES
(
    (SELECT id FROM public.subdomains WHERE name = 'food'),
    'Plant-Based Revolution: The Rise of Alternative Proteins',
    'plant-based-protein-revolution',
    'The food industry is experiencing a seismic shift towards plant-based alternatives. From impossible burgers to lab-grown meat, the future of protein is being reimagined.

## The Driving Forces

Several factors are propelling the plant-based movement:

### Environmental Impact
Animal agriculture contributes significantly to greenhouse gas emissions. Plant-based alternatives can reduce environmental footprint by up to 90%.

### Health Consciousness
Consumers are increasingly aware of the health benefits of plant-based diets, including reduced risk of heart disease and certain cancers.

### Technological Innovation
Advanced food technology is creating products that closely mimic the taste, texture, and cooking properties of traditional meat.

## Market Leaders

- **Beyond Meat**: Pioneer in plant-based burger patties
- **Impossible Foods**: Known for the "bleeding" plant-based burger
- **Oatly**: Leading oat milk brand
- **Perfect Day**: Creating dairy proteins without cows

## The Future of Food

As technology continues to advance, we can expect even more realistic alternatives to traditional animal products. Cultured meat, grown from animal cells without slaughter, represents the next frontier.

The plant-based revolution is not just a trend—it''s a fundamental shift in how we think about food production and consumption.',
    'Explore the plant-based food revolution driving environmental and health-conscious changes in our diet.',
    'published',
    'Plant-Based Revolution: Alternative Proteins Rise',
    'Discover the plant-based food revolution, environmental impact, and innovative companies changing how we eat.',
    '{"plant-based", "food", "environment", "health", "innovation"}',
    NOW() - INTERVAL '1 day'
);

-- Travel Posts
INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, status, meta_title, meta_description, tags, published_at) VALUES
(
    (SELECT id FROM public.subdomains WHERE name = 'travel'),
    'Sustainable Tourism: Traveling Responsibly in 2024',
    'sustainable-tourism-2024',
    'As travel rebounds post-pandemic, there''s a growing awareness of tourism''s environmental and social impact. Sustainable tourism is no longer a niche concept—it''s becoming the standard.

## What Is Sustainable Tourism?

Sustainable tourism aims to minimize negative impacts while maximizing benefits for local communities and environments. It encompasses:

- **Environmental Protection**: Reducing carbon footprint and preserving natural habitats
- **Cultural Respect**: Supporting local traditions and communities
- **Economic Benefits**: Ensuring tourism revenue reaches local populations

## Practical Tips for Sustainable Travel

### Transportation
- Choose direct flights when possible
- Consider train travel for shorter distances
- Use public transportation at destinations
- Walk or bike when exploring cities

### Accommodation
- Stay in eco-certified hotels
- Choose locally-owned accommodations
- Reduce water and energy consumption
- Participate in hotel recycling programs

### Activities
- Support local businesses and guides
- Respect wildlife and natural environments
- Learn about local culture and history
- Avoid overtourism hotspots

## Destinations Leading the Way

### Costa Rica
A pioneer in eco-tourism with extensive national parks and sustainable practices.

### New Zealand
Strong commitment to environmental protection and Maori cultural preservation.

### Bhutan
Gross National Happiness over GDP, with carbon-negative tourism policies.

The future of travel depends on our choices today. By traveling sustainably, we can explore the world while preserving it for future generations.',
    'Learn how to travel responsibly with sustainable tourism practices that protect environments and support local communities.',
    'published',
    'Sustainable Tourism: Responsible Travel Guide 2024',
    'Discover sustainable tourism practices, eco-friendly destinations, and tips for responsible travel.',
    '{"sustainable-tourism", "travel", "environment", "responsibility", "eco-friendly"}',
    NOW() - INTERVAL '3 days'
);

-- Lifestyle Posts
INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, status, meta_title, meta_description, tags, published_at) VALUES
(
    (SELECT id FROM public.subdomains WHERE name = 'lifestyle'),
    'Digital Wellness: Finding Balance in a Connected World',
    'digital-wellness-balance',
    'In our hyper-connected world, digital wellness has become as important as physical health. Learning to manage our relationship with technology is crucial for mental well-being.

## The Digital Dilemma

While technology enhances our lives, excessive screen time and constant connectivity can lead to:

- **Digital Fatigue**: Mental exhaustion from information overload
- **Sleep Disruption**: Blue light affecting circadian rhythms
- **Social Isolation**: Paradoxically feeling lonely despite constant connection
- **Attention Fragmentation**: Difficulty focusing on single tasks

## Strategies for Digital Wellness

### Create Boundaries
- Establish phone-free zones (bedroom, dining table)
- Set specific times for checking emails and social media
- Use "Do Not Disturb" modes during focused work or relaxation

### Mindful Consumption
- Curate your social media feeds to include positive, inspiring content
- Unsubscribe from unnecessary notifications
- Practice the "one-screen rule" - avoid multitasking with devices

### Digital Detox Practices
- Take regular breaks from screens (20-20-20 rule)
- Schedule device-free activities like reading, walking, or meditation
- Consider periodic digital detox weekends

### Optimize Your Environment
- Use blue light filters in the evening
- Create a charging station outside the bedroom
- Invest in analog alternatives (physical alarm clock, paper notebook)

## Building Healthy Habits

### Morning Routine
Start your day without immediately reaching for your phone. Instead, try:
- Meditation or breathing exercises
- Journaling
- Light exercise or stretching
- Enjoying breakfast mindfully

### Evening Wind-Down
Create a tech-free evening routine:
- Stop screen use 1 hour before bed
- Read physical books
- Practice gratitude or reflection
- Prepare for the next day

Digital wellness is not about rejecting technology but using it intentionally to enhance rather than detract from our lives.',
    'Discover practical strategies for digital wellness and finding balance in our hyper-connected world.',
    'published',
    'Digital Wellness: Balance in Connected World',
    'Learn digital wellness strategies to manage screen time, reduce digital fatigue, and improve mental health.',
    '{"digital-wellness", "lifestyle", "mental-health", "balance", "technology"}',
    NOW() - INTERVAL '4 days'
);

-- Add sample posts for other subdomains with shorter content
INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, status, meta_title, meta_description, tags, published_at) VALUES
-- Business
(
    (SELECT id FROM public.subdomains WHERE name = 'business'),
    'Remote Work Revolution: Building Distributed Teams',
    'remote-work-distributed-teams',
    'The pandemic accelerated the remote work trend, and now companies are discovering the benefits of distributed teams. This shift is reshaping how we think about workplace culture, productivity, and talent acquisition.',
    'Explore how remote work is transforming business operations and team dynamics.',
    'published',
    'Remote Work Revolution: Distributed Teams Guide',
    'Learn how to build successful distributed teams and navigate the remote work revolution.',
    '{"remote-work", "business", "teams", "productivity", "workplace"}',
    NOW() - INTERVAL '6 days'
),
-- Health
(
    (SELECT id FROM public.subdomains WHERE name = 'health'),
    'Mental Health in the Digital Age: Coping Strategies',
    'mental-health-digital-age',
    'As our lives become increasingly digital, mental health challenges are evolving. Understanding the impact of technology on our psychological well-being is crucial for developing effective coping strategies.',
    'Discover strategies for maintaining mental health in our digital world.',
    'published',
    'Mental Health Digital Age: Coping Strategies',
    'Learn about mental health challenges in the digital age and effective coping strategies.',
    '{"mental-health", "health", "digital", "wellness", "coping"}',
    NOW() - INTERVAL '7 days'
),
-- Sports
(
    (SELECT id FROM public.subdomains WHERE name = 'sports'),
    'Fitness Technology: Wearables and Performance Tracking',
    'fitness-technology-wearables',
    'Wearable technology is revolutionizing how athletes and fitness enthusiasts monitor their performance. From heart rate monitors to advanced sleep tracking, these devices provide unprecedented insights into our physical condition.',
    'Explore how wearable technology is transforming fitness and athletic performance.',
    'published',
    'Fitness Technology: Wearables Performance Guide',
    'Discover how wearable fitness technology is revolutionizing performance tracking and training.',
    '{"fitness", "technology", "wearables", "performance", "health"}',
    NOW() - INTERVAL '8 days'
);

-- ===================================================================
-- 3. CREATE DEFAULT ADMIN USER
-- ===================================================================
-- Note: In production, this should be done securely with proper password hashing
-- For demo purposes, we'll create a user with a simple hashed password
-- Password: "admin123" (in production, use much stronger passwords and proper hashing)

INSERT INTO public.admin_users (username, password_hash, email, full_name) VALUES (
    'admin',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for "password"
    'admin@magzin.blog',
    'Site Administrator'
);

-- ===================================================================
-- 4. UPDATE TABLE STATISTICS
-- ===================================================================
-- Update table statistics for better query performance
ANALYZE public.subdomains;
ANALYZE public.posts;
ANALYZE public.comments;
ANALYZE public.admin_users;
ANALYZE public.profiles;