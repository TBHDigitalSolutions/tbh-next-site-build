
export interface CTA {
  text: string;
  link: string;
}

export interface VideoBlock {
  src: string;
  fallbackImage: string;
  alt: string;
}

export interface CompanyStory {
  id: string;
  variant: string;
  title: string;
  description: string;
  highlight: string;
  cta: CTA;
  video: VideoBlock;
}

export interface CoreValue {
  title: string;
  description: string;
}

export interface TeamMember {
  id: string;
  variant: string;
  nameTeam: string;
  position: string;
  description: string;
  bio: string;
  image: string;
}

export interface Testimonial {
  variant: string;
  id: string;
  nameReview: string;
  company: string;
  service: string;
  quote: string;
  rating: number;
  image: string;
  date: string;
}

export interface AboutPageData {
  testimonialsSection: {
    title: string;
    description: string;
  };
  testimonials: Testimonial[];
  joinUsCTA: {
    title: string;
    description: string;
    cta: CTA;
  };
  teamSection: {
    title: string;
    description: string;
  };
  teamMembers: TeamMember[];
  companyStory: CompanyStory;
  coreValues: CoreValue[];
}

const aboutPageData: AboutPageData = 
{
  "testimonialsSection": {
    "title": "What Our Clients Say",
    "description": "Hear from businesses who have transformed their digital presence with us."
  },
  "testimonials": [
    {
      "variant": "testimonial",
      "id": "t1",
      "nameReview": "John Doe",
      "company": "XYZ Health Systems",
      "service": "Custom CRM & SaaS Integration",
      "quote": "TBH Digital Solutions transformed how we manage patient referrals. Their custom CRM streamlined our workflow, reducing admin work by 40%.",
      "rating": 5,
      "image": "/images/team/employees/david.webp",
      "date": "2024-02-15"
    }, 
    {
      "variant": "testimonial",
      "id": "t2",
      "nameReview": "Sarah Thompson",
      "company": "Thompson & Co. Marketing",
      "service": "Full-Service Digital Marketing",
      "quote": "Their ad campaign strategies and advanced tracking boosted our ROI by 300%. TBH Digital Solutions is a game-changer!",
      "rating": 5,
      "image": "/images/team/employees/jane.webp",
      "date": "2024-01-28"
    },
    {
      "variant": "testimonial",
      "id": "t3",
      "nameReview": "Michael Roberts",
      "company": "Roberts E-Commerce",
      "service": "Website Development & SEO",
      "quote": "From design to deployment, TBH Digital Solutions built a high-converting e-commerce site for us. Sales are up 250%!",
      "rating": 5,
      "image": "/images/team/employees/michael.webp",
      "date": "2023-12-20"
    },
    {
      "variant": "testimonial",
      "id": "t4",
      "nameReview": "Lisa Carter",
      "company": "Carter Law Firm",
      "service": "Content Creation & Branding",
      "quote": "They helped rebrand our firm with stunning visuals and compelling content. We now rank #1 on Google for our services!",
      "rating": 5,
      "image": "/images/team/employees/john.webp",
      "date": "2023-11-10"
    },
    {
      "variant": "testimonial",
      "id": "t5",
      "nameReview": "James Peterson",
      "company": "Peterson AI Solutions",
      "service": "Full-Stack Web & SaaS Development",
      "quote": "TBH Digital Solutions built a scalable AI SaaS platform that\u2019s now attracting Fortune 500 clients. Incredible work!",
      "rating": 5,
      "image": "/images/team/employees/jimmy.webp",
      "date": "2023-10-05"
    }
  ],
  "joinUsCTA": {
    "title": "Ready to Join Us?",
    "description": "Explore our career opportunities and become part of our innovative team.",
    "cta": {
      "text": "View Open Positions \u2192",
      "link": "/careers"
    }
  },
  "teamSection": {
    "title": "Meet the Team",
    "description": "Our team of experts is dedicated to delivering cutting-edge digital solutions with creativity and precision."
  },
  "teamMembers": [
    {
      "id": "team6",
      "variant": "team",
      "nameTeam": "John Doe",
      "position": "Founder & CEO",
      "description": "Leading TBH Digital Solutions with innovation and strategic growth.",
      "bio": "John Doe brings over 15 years of technology leadership experience to TBH Digital Solutions. As founder and CEO, he has successfully led the company from a startup to an industry leader in digital transformation. With a background in both software engineering and business administration, John combines technical expertise with strategic vision to drive innovation and sustainable growth. His passion for emerging technologies and commitment to fostering a culture of creativity has been instrumental in shaping the company's success.",
      "image": "/images/team/employees/john.webp"
    },
    {
      "id": "team5",
      "variant": "team",
      "nameTeam": "Jane Smith",
      "position": "Head of Development",
      "description": "Building world-class web experiences and ensuring top-notch performance.",
      "bio": "Jane Smith is a seasoned technology leader with a proven track record in developing scalable web applications and managing high-performing development teams. Her expertise spans full-stack development, cloud architecture, and agile methodologies. Under her leadership, the development team has successfully delivered numerous enterprise-level projects and implemented cutting-edge technologies that have significantly improved our clients' digital presence.",
      "image": "/images/team/employees/jane.webp"
    },
    {
      "id": "team4",
      "variant": "team",
      "nameTeam": "Michael Johnson",
      "position": "Marketing Director",
      "description": "Driving brand engagement and customer outreach strategies.",
      "bio": "Michael Johnson is an innovative marketing strategist with expertise in digital marketing, brand development, and customer engagement. His data-driven approach to marketing has resulted in significant growth in market share and brand recognition. Michael has successfully led multiple award-winning campaigns and established strong partnerships with industry leaders. His focus on integrating traditional and digital marketing strategies has helped position TBH Digital Solutions as a thought leader in the industry.",
      "image": "/images/team/employees/michael.webp"
    },
    {
      "id": "team3",
      "variant": "team",
      "nameTeam": "Jimmy Davis",
      "position": "UI/UX Designer",
      "description": "Creating stunning, user-friendly designs that captivate audiences.",
      "bio": "Jimmy Davis is a creative force in UI/UX design, bringing a unique blend of artistic vision and user-centered design principles to every project. With a background in psychology and digital design, Jimmy excels at creating intuitive, accessible, and visually appealing interfaces. His work has been recognized by multiple design awards, and he regularly speaks at industry conferences about the importance of user-centered design in digital products.",
      "image": "/images/team/employees/jimmy.webp"
    },
    {
      "id": "team2",
      "variant": "team",
      "nameTeam": "Kilo Smith",
      "position": "Senior Developer",
      "description": "Building world-class web experiences and ensuring top-notch performance.",
      "bio": "Kilo Smith is a highly skilled senior developer with deep expertise in modern web technologies and frameworks. Their innovative approach to problem-solving and passion for clean, efficient code has been crucial in developing robust, scalable solutions. Kilo leads various technical initiatives and mentors junior developers, contributing significantly to the team's technical growth and project success.",
      "image": "/images/team/employees/kilo.webp"
    },
    {
      "id": "team1", 
      "variant": "team",
      "nameTeam": "David Tim",
      "position": "Product Director",
      "description": "Driving brand engagement and customer outreach strategies.",
      "bio": "Michael Tim brings a wealth of product management experience to the team, with a particular focus on user-centric product development and market analysis. Their strategic approach to product development has helped launch several successful digital products. Michael's ability to bridge the gap between technical capabilities and market needs has been instrumental in developing products that truly resonate with our users.",
      "image": "/images/team/employees/david.webp"
    }
  ],
  "companyStory": {
    "id": "company-story",
    "variant": "story",
    "title": "Our Story",
    "description": "Founded in 2018, TBH Digital Solutions set out with a vision to revolutionize digital experiences. Our expertise in innovation, creativity, and technology empowers brands to thrive in the digital landscape.",
    "highlight": "Follow the link below to continue reading.",
    "cta": {
      "text": "Learn More",
      "link": "/about"
    },
    "video": {
      "src": "/videos/Website-Videos/website-marketing-crm-1-1.mp4",
      "fallbackImage": "/images/keyboard-temp-2.jpg",
      "alt": "Company Introduction Video"
    }
  },
  "coreValues": [
    {
      "title": "Innovation",
      "description": "We embrace new technologies and drive change to create cutting-edge solutions."
    },
    {
      "title": "Transparency",
      "description": "We believe in open communication and honesty to build trust with our clients."
    },
    {
      "title": "Excellence",
      "description": "We deliver high-quality, precise solutions that exceed expectations."
    },
    {
      "title": "Collaboration",
      "description": "We value teamwork and collective success, working together to achieve great results."
    },
    {
      "title": "Customer Focus",
      "description": "Our clients' success is our priority, ensuring solutions that drive real impact."
    },
    {
      "title": "Adaptability",
      "description": "We continuously evolve, staying ahead of industry trends and embracing new challenges."
    }
  ]
}

export default aboutPageData;
