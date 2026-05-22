export type SEO = {
  title?: string
  description?: string
  canonical?: string
  noIndex?: boolean
}

export type MediaAsset = {
  id?: string
  url: string
  altText?: string
  mimeType?: string
}

export type ContentNode = {
  id: string
  parentId?: string
  slug: string
  fullPath: string
  title: string
  summary?: string
  content?: unknown
  imageUrl?: string
  gallery?: MediaAsset[]
  specs?: Record<string, string>
  datasheetUrl?: string
  status: string
  publishedAt?: string
  sortOrder: number
  depth: number
  seo?: SEO
  version?: number
  children?: ContentNode[]
}

export type NewsItem = {
  id: string
  slug: string
  title: string
  excerpt?: string
  body?: { blocks?: Array<{ type: string; text: string }> }
  category?: string
  tags?: string[]
  featuredImageUrl?: string
  featured: boolean
  status: string
  publishedAt?: string
  seo?: SEO
  version?: number
}

export type Career = {
  id: string
  slug: string
  title: string
  summary?: string
  description?: { blocks?: Array<{ type: string; text: string }> }
  department: string
  location: string
  employmentType: string
  applyUrl?: string
  deadline?: string
  status: string
  publishedAt?: string
  seo?: SEO
  version?: number
}

export type PageContent = {
  id: string
  key: string
  title: string
  content: Record<string, unknown>
  status: string
  publishedAt?: string
  seo?: SEO
  version: number
}

export type Navigation = {
  services: ContentNode[]
  products: ContentNode[]
}

export type ListResponse<T> = {
  data: T[]
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

const API_BASE =
  process.env.CMS_API_BASE_URL ??
  process.env.NEXT_PUBLIC_CMS_API_BASE_URL ??
  "http://localhost:8080/api/v1/public"

export const fallbackServices: ContentNode[] = [
  {
    id: "service-electrical",
    slug: "electrical-engineering",
    fullPath: "electrical-engineering",
    title: "Electrical Engineering",
    summary: "Complete electrical lifecycle support for industrial and infrastructure facilities.",
    imageUrl: "/placeholder.jpg",
    status: "published",
    sortOrder: 1,
    depth: 0,
  },
  {
    id: "service-automation",
    slug: "automation",
    fullPath: "automation",
    title: "Automation",
    summary: "PLC, HMI, SCADA, monitoring, and control system integration.",
    imageUrl: "/placeholder.jpg",
    status: "published",
    sortOrder: 2,
    depth: 0,
  },
  {
    id: "service-maintenance",
    slug: "maintenance",
    fullPath: "maintenance",
    title: "Maintenance",
    summary: "Predictive, preventive, and operational maintenance services.",
    imageUrl: "/placeholder.jpg",
    status: "published",
    sortOrder: 3,
    depth: 0,
  },
]

export const fallbackProducts: ContentNode[] = [
  {
    id: "product-testing",
    slug: "testing-equipment",
    fullPath: "testing-equipment",
    title: "Testing Equipment",
    summary: "Electrical testing equipment and commissioning tools.",
    imageUrl: "/placeholder.jpg",
    specs: { Category: "Testing" },
    status: "published",
    sortOrder: 1,
    depth: 0,
  },
  {
    id: "product-relay",
    slug: "protection-relay",
    fullPath: "protection-relay",
    title: "Protection Relay",
    summary: "Protection relay devices and related engineering support.",
    imageUrl: "/placeholder.jpg",
    specs: { Category: "Protection" },
    status: "published",
    sortOrder: 2,
    depth: 0,
  },
  {
    id: "product-instrumentation",
    slug: "instrumentation",
    fullPath: "instrumentation",
    title: "Instrumentation",
    summary: "Instrumentation devices for monitoring and control.",
    imageUrl: "/placeholder.jpg",
    specs: { Category: "Instrumentation" },
    status: "published",
    sortOrder: 3,
    depth: 0,
  },
]

export const fallbackNews: ListResponse<NewsItem> = {
  data: [
    {
      id: "news-energy",
      slug: "energy-monitoring-system-launch",
      title: "Launching our Energy Monitoring System for ESG-ready facilities",
      excerpt:
        "A turnkey solution helps plants track real-time consumption and produce ESG-grade sustainability reports.",
      body: {
        blocks: [
          {
            type: "paragraph",
            text: "Our Energy Monitoring System helps facilities understand usage patterns, reduce waste, and report energy performance with confidence.",
          },
        ],
      },
      category: "Company",
      featuredImageUrl: "/placeholder.jpg",
      featured: true,
      status: "published",
      publishedAt: "2026-03-18T00:00:00Z",
    },
    {
      id: "news-substation",
      slug: "20mw-substation-commissioning-east-java",
      title: "Successful commissioning of a 20 MW substation in East Java",
      excerpt:
        "Our team completed end-to-end testing, protection coordination, and commissioning for an industrial client.",
      body: {
        blocks: [
          {
            type: "paragraph",
            text: "The commissioning scope covered protection coordination, testing, and energization support.",
          },
        ],
      },
      category: "Project",
      featuredImageUrl: "/placeholder.jpg",
      featured: false,
      status: "published",
      publishedAt: "2026-02-27T00:00:00Z",
    },
  ],
  pagination: { page: 1, perPage: 10, total: 2, totalPages: 1 },
}

export const fallbackCareers: ListResponse<Career> = {
  data: [
    {
      id: "career-senior-electrical",
      slug: "senior-electrical-engineer",
      title: "Senior Electrical Engineer",
      summary: "Lead medium-voltage system design, protection coordination, and commissioning.",
      description: {
        blocks: [{ type: "paragraph", text: "Lead electrical design and commissioning work for industrial clients." }],
      },
      department: "Engineering",
      location: "Surabaya, East Java",
      employmentType: "full_time",
      applyUrl: "mailto:hr@multidayamitra.co.id",
      status: "published",
      publishedAt: "2026-04-22T00:00:00Z",
    },
    {
      id: "career-automation",
      slug: "automation-engineer-plc-scada",
      title: "Automation Engineer (PLC & SCADA)",
      summary: "Design, program, and integrate PLC, HMI, and SCADA systems.",
      description: {
        blocks: [{ type: "paragraph", text: "Build reliable automation systems for power, oil and gas, and manufacturing clients." }],
      },
      department: "Engineering",
      location: "Surabaya, East Java",
      employmentType: "full_time",
      applyUrl: "mailto:hr@multidayamitra.co.id",
      status: "published",
      publishedAt: "2026-04-14T00:00:00Z",
    },
  ],
  pagination: { page: 1, perPage: 10, total: 2, totalPages: 1 },
}

export const fallbackNavigation: Navigation = {
  services: fallbackServices,
  products: fallbackProducts,
}

export const fallbackPages: Record<string, PageContent> = {
  about: {
    id: "page-about",
    key: "about",
    title: "About PT Multi Daya Mitra",
    status: "published",
    version: 1,
    content: {
      overview:
        "Established in 2013, PT Multi Daya Mitra delivers electrical, automation, and fire alarm solutions across Indonesia.",
      vision: "To become a global electrical, automation, and fire alarm services company.",
      mission: "Build mutual partnerships and deliver every engagement with professional excellence.",
      values: ["Safety", "Reliability", "Professionalism", "Partnership"],
    },
  },
  contact: {
    id: "page-contact",
    key: "contact",
    title: "Contact PT Multi Daya Mitra",
    status: "published",
    version: 1,
    content: {
      email: "info@multidayamitra.co.id",
      phone: "+62",
      offices: [{ name: "Head Office", address: "East Java, Indonesia" }],
    },
  },
}

export async function cmsFetch<T>(path: string, fallback: T, revalidate = 300): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    })
    if (!res.ok) return fallback
    return (await res.json()) as T
  } catch {
    return fallback
  }
}

export async function getNavigation() {
  return cmsFetch<Navigation>("/navigation", fallbackNavigation)
}

export async function getPage(key: string) {
  const path = contentPath(key)
  return cmsFetch<PageContent | null>(`/pages/${path}`, fallbackPages[key] ?? null)
}

export async function getServices() {
  return cmsFetch<ContentNode[]>("/services", fallbackServices)
}

export async function getService(path: string) {
  const fallback = findByPath(fallbackServices, path)
  return cmsFetch<ContentNode | null>(`/services/${contentPath(path)}`, fallback)
}

export async function getProducts() {
  return cmsFetch<ContentNode[]>("/products", fallbackProducts)
}

export async function getProduct(path: string) {
  const fallback = findByPath(fallbackProducts, path)
  return cmsFetch<ContentNode | null>(`/products/${contentPath(path)}`, fallback)
}

export async function getNews(page = 1) {
  return cmsFetch<ListResponse<NewsItem>>(`/news?page=${page}&perPage=9`, fallbackNews)
}

export async function getNewsItem(slug: string) {
  const fallback = fallbackNews.data.find((item) => item.slug === slug) ?? null
  return cmsFetch<NewsItem | null>(`/news/${encodeURIComponent(slug)}`, fallback)
}

export async function getCareers(page = 1) {
  return cmsFetch<ListResponse<Career>>(`/careers?page=${page}&perPage=20`, fallbackCareers)
}

export async function getCareer(slug: string) {
  const fallback = fallbackCareers.data.find((item) => item.slug === slug) ?? null
  return cmsFetch<Career | null>(`/careers/${encodeURIComponent(slug)}`, fallback)
}

function contentPath(path: string) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment.trim()))
    .filter(Boolean)
    .join("/")
}

export function flattenContent(items: ContentNode[]): ContentNode[] {
  return items.flatMap((item) => [item, ...flattenContent(item.children ?? [])])
}

export function formatDate(value?: string) {
  if (!value) return "Unscheduled"
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value))
}

export function employmentTypeLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function findByPath(items: ContentNode[], path: string): ContentNode | null {
  return flattenContent(items).find((item) => item.fullPath === path) ?? null
}
