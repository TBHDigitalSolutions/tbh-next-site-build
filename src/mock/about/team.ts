// website/src/mock/about/team.ts

export interface TeamMember {
  id: string;
  variant: "team";
  nameTeam: string;
  position: string;
  description: string;
  bio: string;
  image: string;
}

export interface TeamSection {
  section: {
    title: string;
    description: string;
  };
  members: TeamMember[];
}

export const teamData: TeamSection = {
  section: {
    title: "Meet the Team",
    description:
      "Our team of experts is dedicated to delivering cutting-edge digital solutions with creativity and precision.",
  },
  members: [
    {
      id: "team6",
      variant: "team",
      nameTeam: "John Doe",
      position: "Founder & CEO",
      description:
        "Leading TBH Digital Solutions with innovation and strategic growth.",
      bio: "John Doe brings over 15 years of technology leadership experience to TBH Digital Solutions. As founder and CEO, he has successfully led the company from a startup to an industry leader in digital transformation. With a background in both software engineering and business administration, John combines technical expertise with strategic vision to drive innovation and sustainable growth. His passion for emerging technologies and commitment to fostering a culture of creativity has been instrumental in shaping the company's success.",
      image: "/images/team/employees/john.webp",
    },
    {
      id: "team5",
      variant: "team",
      nameTeam: "Jane Smith",
      position: "Head of Development",
      description:
        "Building world-class web experiences and ensuring top-notch performance.",
      bio: "Jane Smith is a seasoned technology leader with a proven track record in developing scalable web applications and managing high-performing development teams. Her expertise spans full-stack development, cloud architecture, and agile methodologies. Under her leadership, the development team has successfully delivered numerous enterprise-level projects and implemented cutting-edge technologies that have significantly improved our clients' digital presence.",
      image: "/images/team/employees/jane.webp",
    },
    {
      id: "team4",
      variant: "team",
      nameTeam: "Michael Johnson",
      position: "Marketing Director",
      description:
        "Driving brand engagement and customer outreach strategies.",
      bio: "Michael Johnson is an innovative marketing strategist with expertise in digital marketing, brand development, and customer engagement. His data-driven approach to marketing has resulted in significant growth in market share and brand recognition. Michael has successfully led multiple award-winning campaigns and established strong partnerships with industry leaders. His focus on integrating traditional and digital marketing strategies has helped position TBH Digital Solutions as a thought leader in the industry.",
      image: "/images/team/employees/michael.webp",
    },
    {
      id: "team3",
      variant: "team",
      nameTeam: "Jimmy Davis",
      position: "UI/UX Designer",
      description:
        "Creating stunning, user-friendly designs that captivate audiences.",
      bio: "Jimmy Davis is a creative force in UI/UX design, bringing a unique blend of artistic vision and user-centered design principles to every project. With a background in psychology and digital design, Jimmy excels at creating intuitive, accessible, and visually appealing interfaces. His work has been recognized by multiple design awards, and he regularly speaks at industry conferences about the importance of user-centered design in digital products.",
      image: "/images/team/employees/jimmy.webp",
    },
    {
      id: "team2",
      variant: "team",
      nameTeam: "Kilo Smith",
      position: "Senior Developer",
      description:
        "Building world-class web experiences and ensuring top-notch performance.",
      bio: "Kilo Smith is a highly skilled senior developer with deep expertise in modern web technologies and frameworks. Their innovative approach to problem-solving and passion for clean, efficient code has been crucial in developing robust, scalable solutions. Kilo leads various technical initiatives and mentors junior developers, contributing significantly to the team's technical growth and project success.",
      image: "/images/team/employees/kilo.webp",
    },
    {
      id: "team1",
      variant: "team",
      nameTeam: "David Tim",
      position: "Product Director",
      description:
        "Driving brand engagement and customer outreach strategies.",
      bio: "Michael Tim brings a wealth of product management experience to the team, with a particular focus on user-centric product development and market analysis. Their strategic approach to product development has helped launch several successful digital products. Michael's ability to bridge the gap between technical capabilities and market needs has been instrumental in developing products that truly resonate with our users.",
      image: "/images/team/employees/david.webp",
    },
  ],
};
