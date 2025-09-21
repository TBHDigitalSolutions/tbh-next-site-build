// website/src/mock/about/team.ts

// Use the shared, canonical types so the mock stays in lockstep
import type {
  TeamMember as AboutTeamMember,
  TeamSection as AboutTeamSection,
} from "@/data/page/main-pages/about/types";

// Section meta
export const teamSection: AboutTeamSection = {
  title: "Meet the Team",
  description:
    "Our team of experts is dedicated to delivering cutting-edge digital solutions with creativity and precision.",
} as const;

// Members (mapped to canonical shape: name, role, photo, bio, links?)
export const teamMembers: AboutTeamMember[] = [
  {
    id: "john-doe",
    name: "John Doe",
    role: "Founder & CEO",
    bio: "John brings 15+ years of technology leadership to TBH Digital Solutions. With a background in software engineering and business, he blends technical rigor with strategic vision to drive sustainable growth.",
    photo: "/images/team/employees/john.webp",
    links: [{ label: "LinkedIn", url: "https://www.linkedin.com/" }],
  },
  {
    id: "jane-smith",
    name: "Jane Smith",
    role: "Head of Development",
    bio: "A seasoned technology leader in scalable web apps, cloud architecture, and agile delivery. Jane has shipped numerous enterprise projects and mentors high-performing engineering teams.",
    photo: "/images/team/employees/jane.webp",
  },
  {
    id: "michael-johnson",
    name: "Michael Johnson",
    role: "Marketing Director",
    bio: "Innovative strategist across digital marketing, brand development, and customer engagement. Michael’s data-driven programs have accelerated growth and strengthened brand equity.",
    photo: "/images/team/employees/michael.webp",
  },
  {
    id: "jimmy-davis",
    name: "Jimmy Davis",
    role: "UI/UX Designer",
    bio: "Combines user-centered design with a keen visual eye. Jimmy crafts intuitive, accessible interfaces and speaks regularly about practical UX in product development.",
    photo: "/images/team/employees/jimmy.webp",
  },
  {
    id: "kilo-smith",
    name: "Kilo Smith",
    role: "Senior Developer",
    bio: "Modern web specialist known for clean, scalable code and pragmatic solutions. Leads technical initiatives and mentors junior devs to raise the bar across the team.",
    photo: "/images/team/employees/kilo.webp",
  },
  {
    id: "david-tim",
    name: "David Tim",
    role: "Product Director",
    bio: "Bridges market insight with technical capability to ship user-focused products. David has guided several successful launches through disciplined product strategy.",
    photo: "/images/team/employees/david.webp",
  },
] as const;

// Default export matches how the real data module structures its barrel
export default { teamSection, teamMembers };
