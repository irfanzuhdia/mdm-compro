export type NewsItem = {
  slug: string
  title: string
  excerpt: string
  category: "Project" | "Company" | "Insight" | "Press Release"
  date: string
  readingTime: string
  image: string
  featured?: boolean
}

export const newsItems: NewsItem[] = [
  {
    slug: "energy-monitoring-system-launch",
    title: "Launching our Energy Monitoring System for ESG-ready facilities",
    excerpt:
      "A new turnkey solution helps plants track real-time consumption, optimize energy use, and produce ESG-grade sustainability reports.",
    category: "Company",
    date: "March 18, 2026",
    readingTime: "4 min read",
    image: "/placeholder.jpg",
    featured: true,
  },
  {
    slug: "20mw-substation-commissioning-east-java",
    title: "Successful commissioning of a 20 MW substation in East Java",
    excerpt:
      "Our team completed end-to-end testing, protection coordination, and commissioning of a medium-voltage substation for an industrial client.",
    category: "Project",
    date: "February 27, 2026",
    readingTime: "5 min read",
    image: "/placeholder.jpg",
  },
  {
    slug: "scada-upgrade-petrochemical-plant",
    title: "SCADA modernization at a petrochemical plant",
    excerpt:
      "Migration from legacy controllers to a redundant SCADA architecture improved uptime by 18% and reduced unplanned outages.",
    category: "Project",
    date: "January 14, 2026",
    readingTime: "6 min read",
    image: "/placeholder.jpg",
  },
  {
    slug: "iso-9001-recertification",
    title: "PT Multi Daya Mitra recertified to ISO 9001:2015",
    excerpt:
      "Renewed quality management certification reflects our continued commitment to standardized engineering and project execution.",
    category: "Press Release",
    date: "December 02, 2025",
    readingTime: "3 min read",
    image: "/placeholder.jpg",
  },
  {
    slug: "fire-alarm-best-practices",
    title: "5 fire alarm best practices for industrial facilities",
    excerpt:
      "From zoning strategy to inspection cadence — practical guidance from our certified life-safety engineers.",
    category: "Insight",
    date: "November 11, 2025",
    readingTime: "7 min read",
    image: "/placeholder.jpg",
  },
  {
    slug: "predictive-maintenance-thermography",
    title: "Predictive maintenance: how thermography prevents downtime",
    excerpt:
      "Infrared inspection programs help plants catch faults early, extend asset life, and avoid costly unplanned outages.",
    category: "Insight",
    date: "October 06, 2025",
    readingTime: "5 min read",
    image: "/placeholder.jpg",
  },
]
