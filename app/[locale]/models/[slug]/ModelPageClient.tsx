"use client"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { createServerClient } from "@/utils/supabase/server"
import { formatCurrency } from "@/lib/format-currency"
import { formatImageUrl } from "@/utils/image-url"
import { useEffect } from "react"

type Props = {
  params: {
    locale: string
    slug: string
  }
}

export default function ModelPageClient({ params }: Props) {
  const { slug, locale } = params

  useEffect(() => {
    const fetchData = async () => {
      const t = await getTranslations({ locale, namespace: "Models" })
      const commonT = await getTranslations({ locale, namespace: "Common" })

      const supabase = createServerClient()

      console.log(`[ModelPage] Fetching model with ID or slug: ${slug}, locale: ${locale}`)

      // Спочатку спробуємо знайти за слагом
      let { data: model, error: modelError } = await supabase
        .from("models")
        .select("*, brands(id, name, slug, logo_url)")
        .eq("slug", slug)
        .single()

      // Якщо не знайдено за слагом, спробуємо знайти за ID
      if (!model) {
        const { data, error } = await supabase
          .from("models")
          .select("*, brands(id, name, slug, logo_url)")
          .eq("id", slug)
          .single()

        model = data
        modelError = error
      }

      if (modelError || !model) {
        console.error("[ModelPage] Error fetching model:", modelError)
        notFound()
      }

      console.log("[ModelPage] Fetched model:", model)

      // Fetch services for this model with translations
      console.log(`[ModelPage] Fetching model services for model ID: ${model.id}, locale: ${locale}`)
      const { data: modelServices, error: modelServicesError } = await supabase
        .from("model_services")
        .select(`
          id, 
          price, 
          model_id, 
          service_id, 
          services(
            id, 
            position,
            services_translations(
              name,
              description,
              locale
            )
          )
        `)
        .eq("model_id", model.id)
        .order("services(position)", { ascending: true })

      if (modelServicesError) {
        console.error("[ModelPage] Error fetching model services:", modelServicesError)
      }

      console.log(`[ModelPage] Fetched ${modelServices?.length || 0} model services`)

      // Transform model services data
      const transformedModelServices = modelServices
        ?.map((modelService) => {
          // Filter translations for the requested locale
          const translations = modelService.services.services_translations.filter(
            (translation: any) => translation.locale === locale,
          )

          if (translations.length === 0) {
            console.warn(`[ModelPage] No translations found for service ${modelService.service_id} in locale ${locale}`)
            return null
          }

          return {
            id: modelService.id,
            model_id: modelService.model_id,
            service_id: modelService.service_id,
            price: modelService.price,
            service: {
              id: modelService.services.id,
              position: modelService.services.position,
              name: translations[0]?.name || "",
              description: translations[0]?.description || "",
            },
          }
        })
        .filter(Boolean) // Remove null items

      console.log(`[ModelPage] Transformed ${transformedModelServices?.length || 0} model services`)

      // Now that we have the data, render the UI
      // This is just a placeholder, replace with your actual UI rendering logic
      renderUI(t, commonT, model, transformedModelServices, locale)
    }

    fetchData()
  }, [locale, slug])

  // Placeholder function to render the UI
  const renderUI = async (t: any, commonT: any, model: any, transformedModelServices: any, locale: string) => {
    const element = document.getElementById("model-page-content")
    if (!element) return

    element.innerHTML = `
      <div className="container px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-5xl">
          <Link
            href={\`/\${locale}/brands/\${model.brands?.slug || model.brand_id}\`}
            className="mb-8 flex items-center text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            ${t("backToBrand", { brand: model.brands?.name })}
          </Link>

          <div className="mb-12 flex flex-col items-center gap-6 md:flex-row">
            <div className="relative h-40 w-40 overflow-hidden rounded-lg">
              <img
                src={\`${formatImageUrl(model.image_url) || "/placeholder.svg?height=160&width=160&query=phone+model"}\`}
                alt={model.name}
                width={160}
                height={160}
                className="h-full w-full object-contain"
                style={{ display: "block" }}
              />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                ${
                  model.brands?.logo_url
                    ? `
                  <div className="relative h-6 w-6 overflow-hidden rounded-full">
                    <img
                      src={\`${formatImageUrl(model.brands.logo_url) || "/placeholder.svg"}\`}
                      alt={model.brands.name}
                      width={24}
                      height={24}
                      className="h-full w-full object-contain"
                      style={{ display: "block" }}
                    />
                  </div>
                `
                    : ""
                }
                <span className="text-sm text-muted-foreground">${model.brands?.name}</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">${model.name}</h1>
              <p className="mt-2 max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                ${t("modelPageDescription", { model: model.name, brand: model.brands?.name })}
              </p>
            </div>
          </div>

          <h2 className="mb-6 text-2xl font-bold">${t("availableServices")}</h2>

          ${
            transformedModelServices && transformedModelServices.length > 0
              ? `
            <div className="grid gap-4">
              ${transformedModelServices
                .map(
                  (modelService: any) => `
                <div 
                  key={modelService.id} 
                  className="flex flex-col rounded-lg border p-6 shadow-sm"
                  id={\`service-\${modelService.service.id}\`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-medium">${modelService.service.name}</h3>
                      <p className="mt-2 text-muted-foreground">${modelService.service.description}</p>
                    </div>
                    <div className="text-xl font-bold">
                      ${modelService.price !== null ? formatCurrency(modelService.price) : t("priceOnRequest")}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      asChild
                      onClick={() => {
                        // Додаємо клієнтський скрипт для відстеження кліку на кнопку "Замовити послугу"
                        if (typeof window !== 'undefined') {
                          // Для Facebook Pixel
                          (window as any).fbq?.('track', 'InitiateCheckout', {
                            content_name: modelService.service.name,
                            content_type: 'service',
                            content_category: \`\${model.brands?.name} - \${model.name}\`,
                            value: modelService.price,
                            currency: 'CZK'
                          });
                          
                          // Для Google Analytics
                          (window as any).gtag?.('event', 'begin_checkout', {
                            event_category: 'Service Requests',
                            event_label: \`\${model.brands?.name} - \${model.name} - \${modelService.service.name}\`,
                            brand: model.brands?.name,
                            model: model.name,
                            service: modelService.service.name,
                            price: modelService.price
                          });
                        }
                      }}
                    >
                      <Link
                        href={\`/\${locale}/contact?service=\${encodeURIComponent(modelService.service.name)}&model=\${encodeURIComponent(model.name)}\`}
                      >
                        ${commonT("requestService")}
                      </Link>
                    </Button>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          `
              : `
            <p>${t("noServicesAvailable")}</p>
          `
          }
        </div>
      </div>
    `
  }

  return <div id="model-page-content">Loading...</div>
}
