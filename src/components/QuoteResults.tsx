'use client'

import { useState } from 'react'
import { QuoteResult, PackageInfo } from '@/types'

interface QuoteResultsProps {
  results: QuoteResult[]
  loading: boolean
  packageInfo: PackageInfo | null
}


export default function QuoteResults({ results, loading, packageInfo }: QuoteResultsProps) {
  const [sortBy, setSortBy] = useState<'price' | 'time' | 'company'>('price')
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'CNY'>('USD')
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const displayResults = results

  const sortedResults = [...displayResults].sort((a, b) => {
    if (sortBy === 'price') {
      return a.totalCost - b.totalCost
    } else if (sortBy === 'time') {
      const timeA = parseInt(a.channel.timeRange.split('-')[0])
      const timeB = parseInt(b.channel.timeRange.split('-')[0])
      return timeA - timeB
    } else {
      return a.channel.company.localeCompare(b.channel.company)
    }
  })

  const formatPrice = (price: number, currency: string) => {
    const currencySymbols = { USD: '$', EUR: '€', CNY: '¥' }
    return `${currencySymbols[currency as keyof typeof currencySymbols]}${price.toFixed(2)}`
  }

  const getBadgeColor = (result: QuoteResult) => {
    if (result.isCheapest) return 'bg-green-100 text-green-800 border-green-200'
    if (result.isFastest) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (result.isRecommended) return 'bg-purple-100 text-purple-800 border-purple-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getBadgeText = (result: QuoteResult) => {
    if (result.isCheapest) return '最便宜'
    if (result.isFastest) return '最快'
    if (result.isRecommended) return '推荐'
    return ''
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">正在获取报价...</span>
        </div>
      </div>
    )
  }

  if (displayResults.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无报价结果</h3>
        <p className="text-gray-500">请填写包裹信息并点击&ldquo;获取报价&rdquo;按钮</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          报价结果 ({displayResults.length}个渠道)
        </h2>

        <div className="flex items-center space-x-4">
          {/* 币种选择 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">币种:</span>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as 'USD' | 'EUR' | 'CNY')}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">美元 (USD)</option>
              <option value="EUR">欧元 (EUR)</option>
              <option value="CNY">人民币 (CNY)</option>
            </select>
          </div>

          {/* 排序选择 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">排序:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price' | 'time' | 'company')}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="price">价格</option>
              <option value="time">时效</option>
              <option value="company">公司</option>
            </select>
          </div>
        </div>
      </div>

      {/* 包裹信息摘要 */}
      {packageInfo && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">包裹信息</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700">目的地:</span>
              <span className="ml-2 font-medium">{packageInfo.country}</span>
            </div>
            <div>
              <span className="text-blue-700">重量:</span>
              <span className="ml-2 font-medium">{packageInfo.weight}kg</span>
            </div>
            <div>
              <span className="text-blue-700">尺寸:</span>
              <span className="ml-2 font-medium">
                {packageInfo.length}×{packageInfo.width}×{packageInfo.height}cm
              </span>
            </div>
            <div>
              <span className="text-blue-700">货物类型:</span>
              <span className="ml-2 font-medium">
                {packageInfo.cargoType === 'general' ? '普货' :
                 packageInfo.cargoType === 'battery' ? '带电' :
                 packageInfo.cargoType === 'liquid' ? '液体' : '敏感货'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 结果列表 */}
      <div className="space-y-4">
        {sortedResults.map((result) => (
          <div
            key={result.channel.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {result.channel.channelName}
                  </h3>
                  {getBadgeText(result) && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getBadgeColor(result)}`}>
                      {getBadgeText(result)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">目的地:</span>
                    <span className="ml-1">{result.channel.country}</span>
                    {result.channel.zone && (
                      <span className="ml-1 text-blue-600">{result.channel.zone}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">预计时效:</span>
                    <span className="ml-1">{result.channel.timeRange}</span>
                  </div>
                  <div>
                    <span className="font-medium">计费重量:</span>
                    <span className="ml-1">{result.chargeWeight}kg</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(result.totalCost, selectedCurrency)}
                </div>
                <div className="text-sm text-gray-500">
                  运费: {formatPrice(result.channel.priceUSD, selectedCurrency)}/kg
                </div>
                <div className="text-xs text-gray-400">
                  挂号费: {formatPrice(result.channel.registrationFee / 7.3, selectedCurrency)}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => setShowDetails(showDetails === result.channel.id ? null : result.channel.id)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showDetails === result.channel.id ? '收起详情' : '查看详情'}
              </button>

              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-200">
                  复制信息
                </button>
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200">
                  选择此渠道
                </button>
              </div>
            </div>

            {/* 详细信息 */}
            {showDetails === result.channel.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">重量对比</h4>
                    <div className="space-y-1 text-gray-600">
                      <div>实际重量: {result.actualWeight}kg</div>
                      <div>体积重量: {result.volumeWeight}kg</div>
                      <div className="font-medium">计费重量: {result.chargeWeight}kg</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">支持货物类型</h4>
                    <div className="flex flex-wrap gap-1">
                      {result.channel.restrictions.map((restriction, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {restriction === 'general' ? '普货' :
                           restriction === 'battery' ? '带电' :
                           restriction === 'liquid' ? '液体' : '敏感货'}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">多币种价格</h4>
                    <div className="space-y-1 text-gray-600">
                      <div>美元: {formatPrice(result.channel.priceUSD, 'USD')}/kg</div>
                      {result.channel.priceEUR && (
                        <div>欧元: {formatPrice(result.channel.priceEUR, 'EUR')}/kg</div>
                      )}
                      {result.channel.priceCNY && (
                        <div>人民币: {formatPrice(result.channel.priceCNY, 'CNY')}/kg</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">服务特点</h4>
                    <div className="text-gray-600 text-xs">
                      <div>• 提供全程跟踪服务</div>
                      <div>• 包含基础保险</div>
                      <div>• 支持上门取件</div>
                      <div>• 清关服务包含</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 智能推荐说明 */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">智能推荐说明</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div>🟢 最便宜: 综合成本最低的渠道</div>
          <div>🔵 最快: 预计时效最短的渠道</div>
          <div>🟣 推荐: 综合考虑价格、时效、服务质量的最佳选择</div>
        </div>
      </div>
    </div>
  )
}