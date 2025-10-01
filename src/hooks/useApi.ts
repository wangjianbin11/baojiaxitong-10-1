'use client'

import { useState, useCallback } from 'react'
import { PackageInfo, QuoteResult, ApiResponse, BaseData, QuoteResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiCall = useCallback(async <T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse<T> = await response.json()

      if (!data.success) {
        throw new Error(data.error || '请求失败')
      }

      return data.data!
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 获取报价
  const getQuote = useCallback(async (packageInfo: PackageInfo): Promise<QuoteResponse> => {
    return apiCall<QuoteResponse>('/quote', {
      method: 'POST',
      body: JSON.stringify({ packageInfo }),
    })
  }, [apiCall])

  // 获取基础数据（国家、公司等）
  const getBaseData = useCallback(async (): Promise<BaseData> => {
    return apiCall<BaseData>('/countries')
  }, [apiCall])

  // 获取渠道列表
  const getChannels = useCallback(async (filters?: {
    country?: string
    company?: string
    transportType?: string
    cargoType?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (filters?.country) queryParams.append('country', filters.country)
    if (filters?.company) queryParams.append('company', filters.company)
    if (filters?.transportType) queryParams.append('transportType', filters.transportType)
    if (filters?.cargoType) queryParams.append('cargoType', filters.cargoType)

    const queryString = queryParams.toString()
    const endpoint = `/channels${queryString ? `?${queryString}` : ''}`

    return apiCall(endpoint)
  }, [apiCall])

  return {
    loading,
    error,
    getQuote,
    getBaseData,
    getChannels,
  }
}