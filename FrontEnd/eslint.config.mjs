import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const config = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      ".next/**",
      "next-env.d.ts",
      "components/ui/**",
      "hooks/use-mobile.ts",
      "hooks/use-toast.ts",
    ],
  },
]

export default config
