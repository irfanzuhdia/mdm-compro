export type Job = {
  slug: string
  title: string
  department: "Engineering" | "Operations" | "Project Management" | "HSE" | "Business Development"
  location: string
  type: "Full-time" | "Contract" | "Internship"
  level: "Entry" | "Mid" | "Senior"
  summary: string
  posted: string
}

export const jobs: Job[] = [
  {
    slug: "senior-electrical-engineer",
    title: "Senior Electrical Engineer",
    department: "Engineering",
    location: "Surabaya, East Java",
    type: "Full-time",
    level: "Senior",
    summary:
      "Lead medium-voltage system design, protection coordination, and commissioning for industrial and infrastructure projects.",
    posted: "April 22, 2026",
  },
  {
    slug: "automation-engineer-plc-scada",
    title: "Automation Engineer (PLC & SCADA)",
    department: "Engineering",
    location: "Surabaya, East Java",
    type: "Full-time",
    level: "Mid",
    summary:
      "Design, program, and integrate PLC, HMI, and SCADA systems for clients in oil & gas, power, and manufacturing.",
    posted: "April 14, 2026",
  },
  {
    slug: "fire-alarm-technician",
    title: "Fire Alarm Technician",
    department: "Operations",
    location: "Multiple sites, Indonesia",
    type: "Full-time",
    level: "Mid",
    summary:
      "Install, maintain, and troubleshoot fire alarm systems on industrial and commercial sites with certified safety standards.",
    posted: "April 02, 2026",
  },
  {
    slug: "hse-officer",
    title: "HSE Officer",
    department: "HSE",
    location: "East Java, Indonesia",
    type: "Full-time",
    level: "Mid",
    summary:
      "Champion site safety, audit subcontractors, and ensure HSE compliance across active electrical and automation projects.",
    posted: "March 28, 2026",
  },
  {
    slug: "project-manager-epc",
    title: "Project Manager (EPC)",
    department: "Project Management",
    location: "Jakarta / East Java",
    type: "Full-time",
    level: "Senior",
    summary:
      "Own delivery of multi-disciplinary EPC projects — schedule, cost, quality, and stakeholder management end-to-end.",
    posted: "March 15, 2026",
  },
  {
    slug: "business-development-executive",
    title: "Business Development Executive",
    department: "Business Development",
    location: "Surabaya, East Java",
    type: "Full-time",
    level: "Mid",
    summary:
      "Develop new client relationships across power, oil & gas, and manufacturing — from first contact through proposal.",
    posted: "March 02, 2026",
  },
  {
    slug: "electrical-engineering-intern",
    title: "Electrical Engineering Intern",
    department: "Engineering",
    location: "Surabaya, East Java",
    type: "Internship",
    level: "Entry",
    summary:
      "Hands-on internship working alongside our senior engineers on real installation, testing, and commissioning projects.",
    posted: "February 18, 2026",
  },
]
