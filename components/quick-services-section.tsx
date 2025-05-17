"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export function QuickServicesSection() {
  const t = useTranslations("services")
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [expandedService, setExpandedService] = useState<string | null>(null)

  const services = [
    {
      id: "screenReplacement",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
          <path d="M12 18h.01" />
        </svg>
      ),
    },
    {
      id: "batteryReplacement",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <rect width="16" height="10" x="2" y="7" rx="2" ry="2" />
          <line x1="22" x2="22" y1="11" y2="13" />
          <line x1="6" x2="6" y1="11" y2="13" />
          <line x1="10" x2="10" y1="11" y2="13" />
          <line x1="14" x2="14" y1="11" y2="13" />
        </svg>
      ),
    },
    {
      id: "boardRepair",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      ),
    },
    {
      id: "screenProtection",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
      ),
    },
    {
      id: "waterDamageRepair",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M12 2v6" />
          <path d="m4.93 10.93 1.41 1.41" />
          <path d="M2 18h2" />
          <path d="M20 18h2" />
          <path d="m19.07 10.93-1.41 1.41" />
          <path d="M22 22H2" />
          <path d="m16 6-4 4-4-4" />
          <path d="M16 18a4 4 0 0 0-8 0" />
        </svg>
      ),
    },
  ]

  const toggleService = (id: string) => {
    if (expandedService === id) {
      setExpandedService(null)
    } else {
      setExpandedService(id)
    }
  }

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("title")}</h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t("subtitle")}
            </p>
          </div>
        </div>
        {isMobile ? (
          <div className="grid gap-6">
            {services.map((service) => (
              <div key={service.id} className="rounded-lg border bg-white shadow-sm p-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleService(service.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      {service.icon}
                    </div>
                    <h3 className="font-semibold">{t(`${service.id}.title`)}</h3>
                  </div>
                  {expandedService === service.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                {expandedService === service.id && (
                  <div className="mt-3 pl-13">
                    <p className="text-sm text-gray-500 mb-3">{t(`${service.id}.shortDescription`)}</p>
                    <Link
                      href={`/services#${service.id}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {t("learnMore")}
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="rounded-lg border bg-white shadow-sm p-6 transition-all hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  {service.icon}
                </div>
                <h3 className="mt-4 font-semibold">{t(`${service.id}.title`)}</h3>
                <p className="mt-2 text-sm text-gray-500">{t(`${service.id}.shortDescription`)}</p>
                <div className="mt-4">
                  <Link href={`/services#${service.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {t("learnMore")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-center mt-8">
          <Link
            href="/services"
            className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700"
          >
            {t("viewAll")}
          </Link>
        </div>
      </div>
    </section>
  )
}
