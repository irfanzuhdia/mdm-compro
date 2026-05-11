import { getNavigation } from "@/lib/cms"
import { SiteHeaderClient } from "./site-header-client"

export async function SiteHeader() {
  const navigation = await getNavigation()
  return <SiteHeaderClient navigation={navigation} />
}
