import { useState, useCallback } from "react"
import { useAuthStore } from "@/lib/store"

export function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const token = useAuthStore((state) => state.token)

  const execute = useCallback(
    async (options: RequestInit = {}) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
          },
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const result = await response.json()
        setData(result)
        return result
      } catch (e) {
        setError(e as Error)
        throw e
      } finally {
        setIsLoading(false)
      }
    },
    [url, token],
  )

  return { data, isLoading, error, execute }
}
