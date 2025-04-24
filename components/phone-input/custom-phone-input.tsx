"use client"

import type React from "react"
import { useState, useCallback, forwardRef } from "react"
import { type CountryCode, getCountryCallingCode } from "libphonenumber-js"
import { AsYouType, parsePhoneNumber } from "libphonenumber-js"
import { Input } from "@/components/ui/input"
import { CustomCountrySelect } from "./custom-country-select"
import en from "react-phone-number-input/locale/en.json"
import { Label } from "@/components/ui/label"

interface CustomPhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  label?: string
  required?: boolean
  id?: string
}

export const CustomPhoneInput = forwardRef<HTMLInputElement, CustomPhoneInputProps>(
  ({ value, onChange, placeholder, disabled, error, label, required, id }, ref) => {
    // Extract country code from the phone number
    const getInitialCountry = (): CountryCode | undefined => {
      if (!value) return "CZ" as CountryCode // Default to Czech Republic
      try {
        const parsed = parsePhoneNumber(value)
        return parsed.country as CountryCode
      } catch (e) {
        return "CZ" as CountryCode
      }
    }

    const [country, setCountry] = useState<CountryCode | undefined>(getInitialCountry())
    const [nationalNumber, setNationalNumber] = useState<string>(() => {
      if (!value) return ""
      try {
        const parsed = parsePhoneNumber(value)
        return parsed.nationalNumber || ""
      } catch (e) {
        return value.replace(/^\+\d+/, "") // Remove country code if present
      }
    })

    // Update the full phone number when country or national number changes
    const updatePhoneNumber = useCallback(
      (newCountry: CountryCode | undefined, newNationalNumber: string) => {
        if (!newCountry || !newNationalNumber) {
          onChange(newNationalNumber ? newNationalNumber : "")
          return
        }

        try {
          const countryCallingCode = getCountryCallingCode(newCountry)
          const formatter = new AsYouType(newCountry)
          formatter.input(`+${countryCallingCode}${newNationalNumber}`)
          onChange(formatter.getNumberValue() || `+${countryCallingCode}${newNationalNumber}`)
        } catch (e) {
          onChange(`+${getCountryCallingCode(newCountry)}${newNationalNumber}`)
        }
      },
      [onChange],
    )

    // Handle country change
    const handleCountryChange = (newCountry: CountryCode) => {
      setCountry(newCountry)
      updatePhoneNumber(newCountry, nationalNumber)
    }

    // Handle national number change
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newNationalNumber = e.target.value.replace(/\D/g, "")
      setNationalNumber(newNationalNumber)
      updatePhoneNumber(country, newNationalNumber)
    }

    // Format the national number for display
    const formatNationalNumber = (number: string, countryCode: CountryCode | undefined) => {
      if (!number || !countryCode) return number
      try {
        const formatter = new AsYouType(countryCode)
        formatter.input(`+${getCountryCallingCode(countryCode)}${number}`)
        return formatter.getNationalNumber()
      } catch (e) {
        return number
      }
    }

    const displayNumber = formatNationalNumber(nationalNumber, country)

    // Validate phone number
    const isValid = () => {
      if (!value) return true // Consider empty input as valid

      return true
    }

    const isCurrentlyValid = isValid()

    return (
      <div className="space-y-2 phone-input-container">
        {label && (
          <Label htmlFor={id} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
            {label}
          </Label>
        )}
        <div className="flex space-x-2">
          <div className="w-[60px] flex-shrink-0">
            <CustomCountrySelect value={country} onChange={handleCountryChange} labels={en} disabled={disabled} />
          </div>
          <div className="flex-grow">
            <Input
              ref={ref}
              id={id}
              type="tel"
              value={displayNumber}
              onChange={handleNumberChange}
              placeholder={placeholder}
              disabled={disabled}
              className={error || !isCurrentlyValid ? "border-destructive" : ""}
            />
          </div>
        </div>
        {(error || !isCurrentlyValid) && value && (
          <p className="text-sm text-destructive">{error || "Invalid phone number"}</p>
        )}
      </div>
    )
  },
)

CustomPhoneInput.displayName = "CustomPhoneInput"
