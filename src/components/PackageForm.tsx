'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { PackageInfo, CargoType, VolumeFormula } from '@/types'

interface PackageFormProps {
  onSubmit: (packageInfo: PackageInfo) => void
}

// 货物类型配置（可选）
const cargoTypes: { value: CargoType; label: string; description: string }[] = [
  { value: 'general', label: '普货', description: '一般商品，无特殊限制' },
  { value: 'battery', label: '带电产品', description: '含电池或电子产品' },
  { value: 'liquid', label: '液体', description: '液体、膏状或粉末状产品' },
  { value: 'sensitive', label: '敏感货', description: '品牌、化妆品等敏感商品' },
]

// 体积重计算公式配置（可选）
const volumeFormulas: { value: VolumeFormula; label: string; description: string }[] = [
  { value: '6000', label: '除以 6000', description: '长×宽×高÷6000（空运）' },
  { value: '8000', label: '除以 8000', description: '长×宽×高÷8000（空运）' },
]

export default function PackageForm({ onSubmit }: PackageFormProps) {
  // 级联选择状态
  const [companies, setCompanies] = useState<string[]>([])
  const [channels, setChannels] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [zones, setZones] = useState<Record<string, string[]>>({})

  // 表单状态
  const [formData, setFormData] = useState<PackageInfo>({
    company: '',
    channelName: '',
    country: '',
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    cargoType: 'general',
    productValue: 0,
    productCurrency: 'USD',
    volumeFormula: '6000',
    transportType: '空运',
    productImage: '',
  })

  const [loading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imagePreview, setImagePreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 智能推荐状态
  const [recommendation, setRecommendation] = useState<{
    aiAnalysis?: string;
    recommendations?: {
      cheapest: { company: string; channel: string; country: string; priceCNY: string; reason: string; time: string };
      fastest: { company: string; channel: string; country: string; priceCNY: string; reason: string; time: string };
      recommended: { company: string; channel: string; country: string; priceCNY: string; reason: string; badge: string; time: string };
    };
  } | null>(null)
  const [recommendLoading, setRecommendLoading] = useState(false)

  // 获取物流公司列表
  useEffect(() => {
    fetchCompanies()
  }, [])

  // 当选择公司后，获取渠道列表
  useEffect(() => {
    if (formData.company) {
      fetchChannels(formData.company)
    } else {
      setChannels([])
      setCountries([])
      setFormData(prev => ({ ...prev, channelName: '', country: '' }))
    }
  }, [formData.company])

  // 当选择渠道后，获取国家列表
  useEffect(() => {
    if (formData.company && formData.channelName) {
      fetchCountries(formData.company, formData.channelName)
    } else {
      setCountries([])
      setFormData(prev => ({ ...prev, country: '' }))
    }
  }, [formData.company, formData.channelName])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/logistics')
      const data = await response.json()
      if (data.success) {
        setCompanies(data.data.companies || [])
      }
    } catch (error) {
      console.error('获取物流公司失败:', error)
    }
  }

  const fetchChannels = async (company: string) => {
    try {
      const response = await fetch(`/api/logistics?company=${encodeURIComponent(company)}`)
      const data = await response.json()
      if (data.success) {
        setChannels(data.data.channels || [])
      }
    } catch (error) {
      console.error('获取渠道失败:', error)
      setChannels([])
    }
  }

  const fetchCountries = async (company: string, channel: string) => {
    try {
      const response = await fetch(`/api/logistics?company=${encodeURIComponent(company)}&channel=${encodeURIComponent(channel)}`)
      const data = await response.json()
      if (data.success) {
        setCountries(data.data.countries || [])
        setZones(data.data.zones || {})
      }
    } catch (error) {
      console.error('获取国家失败:', error)
      setCountries([])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    // 验证必填字段
    if (!formData.company) newErrors.company = '请选择物流公司'
    if (!formData.channelName) newErrors.channelName = '请选择渠道'
    if (!formData.country) newErrors.country = '请选择目的国家'
    if (!formData.weight || formData.weight <= 0) newErrors.weight = '请输入有效的重量'
    if (!formData.length || formData.length <= 0) newErrors.length = '请输入有效的长度'
    if (!formData.width || formData.width <= 0) newErrors.width = '请输入有效的宽度'
    if (!formData.height || formData.height <= 0) newErrors.height = '请输入有效的高度'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    onSubmit(formData)
  }

  const handleInputChange = (field: keyof PackageInfo, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    // 当关键字段变化时,清除推荐结果
    if (['weight', 'length', 'width', 'height', 'cargoType'].includes(field)) {
      setRecommendation(null)
    }
  }

  // 智能推荐函数
  const handleSmartRecommend = async () => {
    // 验证必要字段
    if (!formData.weight || !formData.length || !formData.width || !formData.height) {
      alert('请先输入包裹的重量和尺寸信息')
      return
    }

    setRecommendLoading(true)
    setRecommendation(null)

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageInfo: formData }),
      })

      const data = await response.json()

      if (data.success && data.data.hasRecommendations) {
        setRecommendation(data.data)
      } else {
        alert(data.data.message || '暂无推荐结果')
      }
    } catch (error) {
      console.error('获取推荐失败:', error)
      alert('获取推荐失败，请重试')
    } finally {
      setRecommendLoading(false)
    }
  }

  // 应用推荐选择
  const applyRecommendation = (rec: { company: string; channel: string; country: string }) => {
    setFormData(prev => ({
      ...prev,
      company: rec.company,
      channelName: rec.channel,
      country: rec.country
    }))
    // 触发级联更新
    fetchChannels(rec.company)
    fetchCountries(rec.company, rec.channel)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📦 包裹信息</h2>
        <p className="text-gray-600">请按顺序选择：物流公司 → 渠道 → 目的国家</p>
      </div>

      {/* 第一行：物流公司、渠道、目的国家（级联选择） */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* 物流公司（必选） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            物流公司 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.company ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">请选择物流公司</option>
            {companies.map(company => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
          {errors.company && (
            <p className="mt-1 text-sm text-red-600">{errors.company}</p>
          )}
        </div>

        {/* 渠道（必选，依赖物流公司） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            渠道名称 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.channelName}
            onChange={(e) => handleInputChange('channelName', e.target.value)}
            disabled={!formData.company}
            className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.channelName ? 'border-red-500' : 'border-gray-300'
            } ${!formData.company ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">请选择渠道</option>
            {channels.map(channel => (
              <option key={channel} value={channel}>
                {channel}
              </option>
            ))}
          </select>
          {errors.channelName && (
            <p className="mt-1 text-sm text-red-600">{errors.channelName}</p>
          )}
        </div>

        {/* 目的国家（必选，依赖渠道） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            目的国家 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            disabled={!formData.channelName}
            className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.country ? 'border-red-500' : 'border-gray-300'
            } ${!formData.channelName ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">请选择目的国家</option>
            {countries.map(country => (
              <option key={country} value={country}>
                {country}
                {zones[country] && zones[country].length > 0 && ` (${zones[country].length}个分区)`}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country}</p>
          )}
        </div>
      </div>

      {/* 第二行：重量和尺寸 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            包裹重量 (kg) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.weight || ''}
            onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
            placeholder="0.5"
            className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.weight ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.weight && (
            <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            长 (cm) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.length || ''}
            onChange={(e) => handleInputChange('length', parseFloat(e.target.value) || 0)}
            placeholder="30"
            className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.length ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.length && (
            <p className="mt-1 text-sm text-red-600">{errors.length}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            宽 (cm) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.width || ''}
            onChange={(e) => handleInputChange('width', parseFloat(e.target.value) || 0)}
            placeholder="20"
            className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.width ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.width && (
            <p className="mt-1 text-sm text-red-600">{errors.width}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            高 (cm) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.height || ''}
            onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
            placeholder="10"
            className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.height ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.height && (
            <p className="mt-1 text-sm text-red-600">{errors.height}</p>
          )}
        </div>
      </div>

      {/* 第三行：产品价值 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            产品价值
          </label>
          <div className="flex gap-2">
            <select
              value={formData.productCurrency}
              onChange={(e) => handleInputChange('productCurrency', e.target.value)}
              className="px-3 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="CNY">CNY (¥)</option>
            </select>
            <input
              type="number"
              step="0.01"
              value={formData.productValue || ''}
              onChange={(e) => handleInputChange('productValue', parseFloat(e.target.value) || 0)}
              placeholder={formData.productCurrency === 'USD' ? '10.00' : '70.00'}
              className="flex-1 px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 第四行：产品图片上传 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          产品图片
        </label>
        <div className="flex items-start gap-3 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onloadend = () => {
                  const base64String = reader.result as string
                  setImagePreview(base64String)
                  handleInputChange('productImage', base64String)
                }
                reader.readAsDataURL(file)
              }
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 min-w-[140px] px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-400 transition-all duration-200 flex items-center justify-center gap-2 text-base font-medium text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>选择图片</span>
          </button>
          {imagePreview && (
            <div className="relative flex-shrink-0">
              <Image
                src={imagePreview}
                alt="产品预览"
                width={64}
                height={64}
                className="h-16 w-16 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
              />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('')
                    handleInputChange('productImage', '')
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 shadow-lg z-10"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

      {/* 体积重计算公式（可选） */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          体积重计算公式（可选）
        </label>
        <select
          value={formData.volumeFormula}
          onChange={(e) => handleInputChange('volumeFormula', e.target.value)}
          className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {volumeFormulas.map(formula => (
            <option key={formula.value} value={formula.value}>
              {formula.label} - {formula.description}
            </option>
          ))}
        </select>
      </div>

      {/* 第五行：货物类型和运输方式（可选） */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            货物类型（可选）
          </label>
          <select
            value={formData.cargoType}
            onChange={(e) => handleInputChange('cargoType', e.target.value)}
            className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {cargoTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label} - {type.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            运输方式（可选）
          </label>
          <select
            value={formData.transportType || '空运'}
            onChange={(e) => handleInputChange('transportType', e.target.value)}
            className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="空运">空运 - 快速空运，所有渠道支持</option>
            <option value="海运">海运 - 经济海运，时效较长</option>
          </select>
        </div>
      </div>

      {/* 提交按钮 */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              计算中...
            </div>
          ) : (
            '🚀 获取报价'
          )}
        </button>
      </div>

      {/* 智能推荐区域 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">💡 智能推荐</h3>
            <p className="text-sm text-gray-600">基于您的包裹信息,为您推荐最优物流方案</p>
          </div>
          <button
            type="button"
            onClick={handleSmartRecommend}
            disabled={recommendLoading || !formData.weight || !formData.length}
            className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {recommendLoading ? '分析中...' : '获取推荐'}
          </button>
        </div>

        {/* AI 分析结果 */}
        {recommendation && recommendation.aiAnalysis && (
          <div className="mb-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🤖</div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-indigo-900 mb-2">AI 智能分析</h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {recommendation.aiAnalysis}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 推荐结果卡片 */}
        {recommendation && recommendation.recommendations && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 最便宜 */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => recommendation.recommendations && applyRecommendation(recommendation.recommendations.cheapest)}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-green-700">💰 {recommendation.recommendations.cheapest.reason}</span>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">最省钱</span>
              </div>
              <div className="text-2xl font-bold text-green-700 mb-2">
                {recommendation.recommendations.cheapest.priceCNY}
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="font-medium">物流:</span> {recommendation.recommendations.cheapest.company}</p>
                <p><span className="font-medium">渠道:</span> {recommendation.recommendations.cheapest.channel}</p>
                <p><span className="font-medium">国家:</span> {recommendation.recommendations.cheapest.country}</p>
                <p><span className="font-medium">时效:</span> {recommendation.recommendations.cheapest.time}</p>
              </div>
              <button className="mt-3 w-full py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700">
                选择此方案
              </button>
            </div>

            {/* 最快 */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => recommendation.recommendations && applyRecommendation(recommendation.recommendations.fastest)}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-700">⚡ {recommendation.recommendations.fastest.reason}</span>
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">最快</span>
              </div>
              <div className="text-2xl font-bold text-blue-700 mb-2">
                {recommendation.recommendations.fastest.priceCNY}
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="font-medium">物流:</span> {recommendation.recommendations.fastest.company}</p>
                <p><span className="font-medium">渠道:</span> {recommendation.recommendations.fastest.channel}</p>
                <p><span className="font-medium">国家:</span> {recommendation.recommendations.fastest.country}</p>
                <p><span className="font-medium">时效:</span> {recommendation.recommendations.fastest.time}</p>
              </div>
              <button className="mt-3 w-full py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700">
                选择此方案
              </button>
            </div>

            {/* 综合推荐 */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => recommendation.recommendations && applyRecommendation(recommendation.recommendations.recommended)}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-purple-700">⭐ {recommendation.recommendations.recommended.badge}</span>
                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">性价比</span>
              </div>
              <div className="text-2xl font-bold text-purple-700 mb-2">
                {recommendation.recommendations.recommended.priceCNY}
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="font-medium">物流:</span> {recommendation.recommendations.recommended.company}</p>
                <p><span className="font-medium">渠道:</span> {recommendation.recommendations.recommended.channel}</p>
                <p><span className="font-medium">国家:</span> {recommendation.recommendations.recommended.country}</p>
                <p><span className="font-medium">时效:</span> {recommendation.recommendations.recommended.time}</p>
              </div>
              <button className="mt-3 w-full py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700">
                选择此方案
              </button>
            </div>
          </div>
        )}

        {!recommendation && !recommendLoading && (
          <div className="text-center py-8 text-gray-500">
            <p>输入包裹信息后,点击&ldquo;获取推荐&rdquo;按钮</p>
            <p className="text-sm mt-1">系统将为您分析所有物流渠道,推荐最优方案</p>
          </div>
        )}
      </div>
    </form>
  )
}