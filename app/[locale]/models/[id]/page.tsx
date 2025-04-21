import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createServerClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

type Props = {
  params: {
    locale: string
    id: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = params
  const t = await getTranslations({ locale, namespace: "Models" })

  const supabase = createServerClient()
  const { data: model } = await supabase.from("models").select("*, brands(name)").eq("id", id).single()

  if (!model) {
    return {
      title: t("modelNotFound"),
      description: t("modelNotFoundDesc"),
    }
  }

  return {
    title: `${model.name} - ${t("repairServices")}`,
    description: t("modelPageDescription", { model: model.name, brand: model.brands?.name }),
  }
}

export default async function ModelPage({ params }: Props) {
  const { id, locale } = params
  const t = await getTranslations({ locale, namespace: "Models" })
  const commonT = await getTranslations({ locale, namespace: "Common" })

  const supabase = createServerClient()

  // Fetch the model with its brand
  const { data: model, error: modelError } = await supabase
    .from("models")
    .select("*, brands(id, name, logo_url)")
    .eq("id", id)
    .single()

  if (modelError || !model) {
    notFound()
  }

  // Fetch services for this model
  const { data: modelServices } = await supabase
    .from("model_services")
    .select("*, services(id, name, description, position)")
    .eq("model_id", id)
    .order("services(position)", { ascending: true })

  // If no model services are found, fetch all services and display them without prices
  const { data: allServices } = await supabase.from("services").select("*").order("position", { ascending: true })

  // Determine which services to display
  const servicesToDisplay =
    modelServices && modelServices.length > 0
      ? modelServices
      : allServices?.map((service) => ({
          id: `temp-${service.id}`,
          services: service,
          price: null,
          model_id: id,
          service_id: service.id,
        }))

  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/${locale}/brands/${model.brand_id}`}
          className="mb-8 flex items-center text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t("backToBrand", { brand: model.brands?.name })}
        </Link>

        <div className="mb-12 flex flex-col items-center gap-6 md:flex-row">
          <div className="relative h-40 w-40 overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={model.image_url || "/placeholder.svg?height=160&width=160&query=phone+model"}
              alt={model.name}
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2">
              {model.brands?.logo_url && (
                <div className="relative h-6 w-6 overflow-hidden rounded-full">
                  <Image
                    src={model.brands.logo_url || "/placeholder.svg"}
                    alt={model.brands.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <span className="text-sm text-muted-foreground">{model.brands?.name}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{model.name}</h1>
            <p className="mt-2 max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t("modelPageDescription", { model: model.name, brand: model.brands?.name })}
            </p>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold">{t("availableServices")}</h2>

        {servicesToDisplay && servicesToDisplay.length > 0 ? (
          <div className="grid gap-4">
            {servicesToDisplay.map((modelService) => (
              <div key={modelService.id} className="flex flex-col rounded-lg border p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-medium">{modelService.services?.name}</h3>
                    <p className="mt-2 text-muted-foreground">{modelService.services?.description}</p>
                  </div>
                  <div className="text-xl font-bold">
                    {modelService.price
                      ? new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }).format(modelService.price)
                      : t("priceOnRequest")}
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" asChild>
                    <Link href={`/${locale}/contact?service=${modelService.services?.name}&model=${model.name}`}>
                      {t("requestService")}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>{t("noServicesAvailable")}</p>
        )}
      </div>
    </div>
  )
}
