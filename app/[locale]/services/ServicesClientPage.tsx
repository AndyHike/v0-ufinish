"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"

export default function ServicesClientPage() {
  const t = useTranslations("services")

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
          className="h-10 w-10"
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
          className="h-10 w-10"
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
          className="h-10 w-10"
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
          className="h-10 w-10"
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
          className="h-10 w-10"
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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <Link
            key={service.id}
            href={`#${service.id}`}
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="mr-4 text-blue-600">{service.icon}</div>
              <h2 className="text-xl font-semibold">{t(`${service.id}.title`)}</h2>
            </div>
            <p className="text-gray-600">{t(`${service.id}.shortDescription`)}</p>
          </Link>
        ))}
      </div>

      <div className="mt-16 space-y-16">
        {services.map((service) => (
          <div key={service.id} id={service.id} className="scroll-mt-24 bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-6">
              <div className="mr-4 text-blue-600">{service.icon}</div>
              <h2 className="text-2xl font-bold">{t(`${service.id}.title`)}</h2>
            </div>
            <p className="text-gray-700 mb-6 text-lg">{t(`${service.id}.fullDescription`)}</p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700"
              >
                {t("contactUs")}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
