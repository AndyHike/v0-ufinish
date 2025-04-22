"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Smartphone, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  const t = useTranslations("Footer")

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <span className="font-semibold">{t("siteTitle")}</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{t("description")}</p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">{t("quickLinks")}</h3>
            <ul className="grid gap-3">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("services")}
                </Link>
              </li>
              <li>
                <Link href="/brands" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("chooseModel")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">{t("contactUs")}</h3>
            <ul className="grid gap-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+380 12 345 6789</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@phonerepair.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>{t("address")}</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">{t("followUs")}</h3>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {t("siteTitle")}. {t("allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  )
}
