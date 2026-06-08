export type JobSection = {
  heading: string;
  items?: string[];
  body?: string;
};

export type JobPosting = {
  id: string;
  title: string;
  location: string;
  type: string;
  department?: string;
  reportsTo?: string;
  summary: string;
  aboutUs?: string;
  sections?: JobSection[];
  qualificationsHeading?: string;
  qualifications?: string[];
};

export const JOB_POSTINGS: JobPosting[] = [
  {
    id: "interior-designer",
    title: "Interior Designer",
    location: "Panjim / On site",
    type: "Full Time / Permanent",
    department: "Projects & Operations",
    reportsTo: "CEO",
    summary:
      "Creative interior designer for hospitality and hotel setup — indoor luxury, outdoor landscaping, and 4–5 star compliance.",
    aboutUs:
      "GHD Hotels LLP is seeking a creative, detail-oriented, and experienced Interior Designer with expertise in hospitality and hotel setup projects. We are seeking a passionate, detail-oriented, and visionary Interior Designer to join our team. This role demands a professional who understands that premium hotel design is an interconnected ecosystem—where the transition from outdoor landscaping to indoor luxury must be flawless, durable, operationally efficient, and in strict compliance with 4-star and 5-star standards.",
    sections: [
      {
        heading: "1. Concept Development & Space Planning",
        items: [
          "Holistic Hospitality Design: Create unique, functional, and visually striking concepts for indoor spaces (guest rooms, lobbies, F&B outlets, MICE facilities) and outdoor spaces (entryways, courtyards, poolside areas, gardens, alfresco dining).",
          "Space Optimization: Analyze and optimize spatial layouts to ensure maximum functionality, safety, compliance, and aesthetic appeal.",
          "Sketching & Rendering: Produce high-quality 2D layouts, 3D renderings, and spatial visualizations to effectively communicate design intent to hospitality background.",
          "Design Concept: Ensure designs align with brand standards, luxury hospitality aesthetics, and operational functionality.",
          "Mood Boards & 3D Renderings: Develop comprehensive interior and landscape mood boards, material matrices, 2D site layouts, and 3D renderings to present unified design intents to executive leadership.",
        ],
      },
      {
        heading: "2. Deep Landscape Design & Horticulture Execution",
        items: [
          "Hardscape & Softscape Mastery: Design detailed layouts for hardscaping (pathways, retaining walls, water features, outdoor lighting, decks) and softscaping (strategic plant, tree, and turf selection based on local climate, soil conditions, and shade patterns).",
          "Microclimate & Topography Management: Assess site topography, drainage requirements, and microclimates to ensure outdoor layouts are structurally sound, erosion-resistant, and visually enduring.",
          "Sensory Guest Experience: Curate outdoor flora and water features that align with a premium hospitality aesthetic, managing privacy screening, acoustic buffering from external roads, and seasonal blooming cycles.",
          "Outdoor Design: Design and coordinate outdoor areas including gardens, poolside spaces, entrance areas, pathways, courtyards, terraces, and recreational zones; coordinate with landscape consultants, vendors, and project teams to ensure proper execution of outdoor development works that complement the overall hospitality theme, guest experience, and luxury standards.",
        ],
      },
      {
        heading: "3. Technical Design & Documentation",
        items: [
          "Construction Drawings: Prepare detailed design documentation packages, including floor plans, elevations, reflected ceiling plans (RCP), electrical/lighting layouts, and joinery/millwork details.",
          "Material Specification: Source and specify appropriate finishes, fixtures, furniture, equipment (FF&E), lighting, and materials, ensuring they meet quality, budget, and regulatory standards.",
          "Codes & Compliance: Ensure all designs comply with local building regulations, accessibility standards (e.g., ADA), and health and safety codes.",
        ],
      },
      {
        heading: "4. Project Setup, Vendor Management & Site Oversight",
        items: [
          "Pre-Opening Site Execution: Supervise on-site contractors, horticulturists, civil workers, and millwork fabricators to ensure physical execution matches the approved blueprint layouts and strict project timelines.",
          "Site Inspections: Conduct routine site assessments to handle unforeseen structural or landscape grading challenges, managing rigorous snag lists before property handover.",
        ],
      },
      {
        heading: "5. Brand Standards & Regulatory Compliance",
        items: [
          "Star-Category Standards: Adhere strictly to the service conduct, safety parameters, clearances, and aesthetic benchmarks required of premium 4-star and 5-star hospitality properties.",
          "Environmental & Building Codes: Ensure all structural landscape elements, water features, and interior layouts comply fully with local building codes, statutory requirements, environmental/coastal regulations, fire norms, accessibility standards, and local statutory guidelines.",
        ],
      },
      {
        heading: "6. Design Planning & Layout Expertise",
        items: [
          "Demonstrate in-depth knowledge of interior design layouts, space planning, circulation flow, and functional hospitality design concepts.",
          "Prepare detailed design layouts for furniture layouts, ceiling plans, lighting plans, and guest area zoning for operational efficiency.",
          "Develop detailed BOQs, material specifications, and execution drawings for project implementation. Strong understanding of design detailing, color coordination, textures, finishes, lighting concepts, and furniture placement.",
        ],
      },
      {
        heading: "7. Project Execution & Site Supervision",
        items: [
          "Site Inspections: Conduct regular site visits during the construction phase to ensure execution matches the approved design intent and construction documents.",
          "Snagging/Punch Lists: Identify defects or deviations on-site and manage the rectification process with contractors before project handover.",
          "FF&E Styling: Oversee the installation, styling, and final handover of furniture, artwork, and accessories to deliver a turnkey experience as per hospitality norms.",
        ],
      },
    ],
    qualificationsHeading: "Requirements & Qualifications",
    qualifications: [
      "Experience: 5–6 years of proven experience working as an Interior Designer, preferably with a portfolio spanning hospitality, hotel, resort, villa, or commercial interior projects. Experience in hotel pre-opening and hospitality setup projects preferred.",
      "Education: Bachelor's degree or Diploma in Interior Design, Architecture, or a closely related creative field.",
      "Technical Skills: Mastery of industry-standard design software — AutoCAD, SketchUp, Revit, or Rhino. Proficiency in 3D rendering tools — V-Ray, Enscape, or Lumion. Strong command of the Adobe Creative Suite (Photoshop, InDesign) for presentation layouts.",
      "Industry Certifications: Active certification or license (e.g., NCIDQ, ASID, or local equivalent body) is highly preferred but not mandatory.",
      "Soft Skills: Exceptional spatial awareness and an eagle eye for detail, color, and texture. Understanding of hotel operational flow and guest experience design. Excellent time-management skills with the ability to juggle multiple project deadlines simultaneously.",
    ],
  },
  {
    id: "marketing-manager",
    title: "Marketing Manager / Senior Marketing Executive",
    location: "Panjim, Goa",
    type: "Full-Time",
    department: "Hospitality / Hotels",
    summary:
      "Lead brand-building, digital campaigns, and promotional activities across our hospitality portfolio.",
    aboutUs:
      "We are looking for a creative and strategic Marketing Manager / Senior Marketing Executive to lead brand-building initiatives, digital marketing campaigns, and promotional activities across our hospitality portfolio. The ideal candidate should be passionate about storytelling, customer engagement, and driving measurable business results.",
    sections: [
      {
        heading: "Key Responsibilities",
        items: [
          "Plan, execute, and optimize marketing campaigns to enhance brand visibility and revenue.",
          "Manage social media platforms, digital marketing activities, and online reputation.",
          "Coordinate with external agencies, vendors, agents, media partners, and influencers.",
          "Develop engaging content for digital, print, and promotional channels.",
          "Monitor campaign performance and prepare marketing reports and insights.",
          "Execute promotional initiatives for rooms, dining, events, weddings, and experiences.",
          "Support website content management, SEO initiatives, and online marketing efforts.",
          "Develop customer engagement strategies to increase brand awareness and guest loyalty.",
        ],
      },
    ],
    qualificationsHeading: "Desired Qualifications",
    qualifications: [
      "Bachelor's degree in Marketing, Communications, Hospitality, or a related field.",
      "Experience in hospitality, travel, lifestyle, or digital marketing preferred.",
      "Strong understanding of social media, content marketing, and performance marketing.",
      "Excellent written and verbal communication skills.",
      "Creative mindset with strong analytical abilities.",
    ],
  },
  {
    id: "sales-executive",
    title: "Sales Executive",
    location: "Panjim, Goa",
    type: "Full-Time",
    department: "Sales · Hotel Nivaara by GHD",
    summary:
      "Drive reservations and revenue at our boutique Nerul property — 16 rooms, minutes from Candolim, Fort Aguada, and Panaji.",
    aboutUs:
      "GHD Hotels LLP is hiring a Sales Executive for Hotel Nivaara by GHD in Nerul, North Goa. You will convert leads, nurture travel-trade and corporate relationships, and confidently present the property, its surroundings, and guest experiences to drive occupancy and revenue.",
    sections: [
      {
        heading: "Local Attractions & Points of Interest",
        items: [
          "Coco Beach – 2.5 km",
          "Reis Magos Fort – 3.5 km",
          "Candolim Beach – 5 km",
          "Sinquerim Beach – 5.5 km",
          "Fort Aguada – 6 km",
          "Panaji City Centre – 8 km",
          "Calangute Beach – 8 km",
          "Baga Beach – 10 km",
          "Basilica of Bom Jesus – 14 km",
          "Old Goa Heritage Churches – 15 km",
        ],
      },
      {
        heading: "Directions & Transportation",
        items: [
          "Manohar International Airport (GOX) – 32 km",
          "Goa International Airport (GOI) – 34 km",
          "Karmali Railway Station – 16 km",
          "Thivim Railway Station – 20 km",
          "Panaji Bus Stand – 8 km",
        ],
        body: "Taxi services, self-drive vehicles, and airport transfers are easily available upon request.",
      },
      {
        heading: "Onsite & Nearby Activities",
        items: [
          "Relax and unwind in a peaceful setting surrounded by lush greenery",
          "Explore nearby beaches including Candolim, Sinquerim, Calangute, and Baga",
          "Enjoy dolphin-watching tours and boat rides from Coco Beach",
          "Visit historic attractions such as Fort Aguada and Reis Magos Fort",
          "Experience local markets, shopping, and authentic Goan cuisine",
          "Indulge in water sports, beach activities, and sightseeing tours",
          "Discover Goa's vibrant nightlife, beach clubs, and entertainment venues",
          "Take scenic walks and enjoy sunset views along the coastline",
        ],
      },
      {
        heading: "About the Property",
        body: "Hotel Nivaara by GHD is a contemporary boutique hotel located in the serene village of Nerul, North Goa. Featuring 16 well-appointed rooms, the property offers a comfortable and relaxing stay with modern amenities and warm hospitality.\n\nConveniently located near Candolim Beach, Fort Aguada, Coco Beach, and Panaji City, the hotel provides easy access to Goa's popular beaches, heritage landmarks, dining destinations, and entertainment hubs. Whether travelling for leisure, a family vacation, or a business trip, guests can enjoy a peaceful retreat while staying close to the best attractions North Goa has to offer.",
      },
      {
        heading: "Famous Nearby Landmarks",
        items: [
          "Fort Aguada – 6 km",
          "Reis Magos Fort – 3.5 km",
          "Basilica of Bom Jesus – 14 km",
          "Old Goa Heritage Churches – 15 km",
          "Panaji Riverfront – 8 km",
          "Coco Beach – 2.5 km",
          "Candolim Beach – 5 km",
          "Sinquerim Beach – 5.5 km",
        ],
      },
    ],
  },
];
