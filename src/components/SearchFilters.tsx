'use client'

import { useState, useRef, useEffect } from 'react'
import { SearchFilters as SearchFiltersType, CargoType, BaseData } from '@/types'

const cargoTypes = [
  { value: 'general', label: '普货' },
  { value: 'battery', label: '带电产品' },
  { value: 'liquid', label: '液体' },
  { value: 'sensitive', label: '敏感货' },
]

interface AutoCompleteProps {
  value: string
  options: { value: string; label: string }[] | string[]
  placeholder: string
  onSelect: (value: string) => void
  onClear: () => void
}

function AutoComplete({ value, options, placeholder, onSelect, onClear }: AutoCompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = options.filter(option => {
    const label = typeof option === 'string' ? option : option.label
    const val = typeof option === 'string' ? option : option.value
    return label.toLowerCase().includes(inputValue.toLowerCase()) ||
           val.toLowerCase().includes(inputValue.toLowerCase())
  })

  const handleSelect = (selectedValue: string) => {
    setInputValue(selectedValue)
    onSelect(selectedValue)
    setIsOpen(false)
  }

  const handleClear = () => {
    setInputValue('')
    onClear()
    inputRef.current?.focus()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-5 py-4 pr-10 text-base font-semibold border-2 border-gray-300 rounded-xl shadow-md focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-2xl max-h-60 overflow-auto">
          {filteredOptions.map((option, index) => {
            const label = typeof option === 'string' ? option : option.label
            const val = typeof option === 'string' ? option : option.value
            return (
              <button
                key={index}
                onClick={() => handleSelect(val)}
                className="w-full px-5 py-4 text-left text-gray-900 font-semibold text-base hover:bg-blue-100 focus:bg-blue-100 focus:outline-none transition-all hover:font-bold"
              >
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function SearchFilters() {
  const [filters, setFilters] = useState<SearchFiltersType>({
    country: '',
    company: '',
    channelName: '',
    transportType: '',
    cargoType: undefined,
  })

  const [searchHistory, setSearchHistory] = useState<SearchFiltersType[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [baseData, setBaseData] = useState<BaseData | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  // 获取基础数据
  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const response = await fetch('/api/countries')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setBaseData(data.data)
          }
        }
      } catch (error) {
        console.error('获取基础数据失败:', error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchBaseData()
  }, [])

  const updateFilter = (key: keyof SearchFiltersType, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }))
  }

  const clearAllFilters = () => {
    setFilters({
      country: '',
      company: '',
      channelName: '',
      transportType: '',
      cargoType: undefined,
    })
  }

  const saveToHistory = () => {
    const hasValues = Object.values(filters).some(value => value && value !== '')
    if (hasValues) {
      setSearchHistory(prev => {
        const newHistory = [filters, ...prev.filter(item =>
          JSON.stringify(item) !== JSON.stringify(filters)
        )].slice(0, 5)
        return newHistory
      })
    }
  }

  const loadFromHistory = (historyItem: SearchFiltersType) => {
    setFilters(historyItem)
  }

  const handleSearch = () => {
    saveToHistory()
    console.log('搜索条件:', filters)
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">智能搜索与筛选</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showAdvanced ? '收起高级筛选' : '展开高级筛选'}
          </button>
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-700 hover:text-gray-900"
          >
            清空筛选
          </button>
        </div>
      </div>

      {/* 主要搜索条件 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-base font-bold text-gray-900 mb-2">
            目的地国家
          </label>
          <AutoComplete
            value={filters.country || ''}
            options={baseData?.countries.map(country => ({ value: country, label: country })) || []}
            placeholder="搜索国家..."
            onSelect={(value) => updateFilter('country', value)}
            onClear={() => updateFilter('country', '')}
          />
        </div>

        <div>
          <label className="block text-base font-bold text-gray-900 mb-2">
            物流公司
          </label>
          <AutoComplete
            value={filters.company || ''}
            options={baseData?.companies.map(c => ({ value: c, label: c })) || []}
            placeholder="选择物流公司..."
            onSelect={(value) => updateFilter('company', value)}
            onClear={() => updateFilter('company', '')}
          />
        </div>

        <div>
          <label className="block text-base font-bold text-gray-900 mb-2">
            渠道名称
          </label>
          <AutoComplete
            value={filters.channelName || ''}
            options={baseData?.channels || []}
            placeholder="搜索渠道..."
            onSelect={(value) => updateFilter('channelName', value)}
            onClear={() => updateFilter('channelName', '')}
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            搜索渠道
          </button>
        </div>
      </div>

      {/* 高级筛选条件 */}
      {showAdvanced && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">
                运输方式
              </label>
              <AutoComplete
                value={filters.transportType || ''}
                options={baseData?.transportTypes || []}
                placeholder="选择运输方式..."
                onSelect={(value) => updateFilter('transportType', value)}
                onClear={() => updateFilter('transportType', '')}
              />
            </div>

            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">
                货物类型
              </label>
              <select
                value={filters.cargoType || ''}
                onChange={(e) => updateFilter('cargoType', e.target.value as CargoType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">全部类型</option>
                {cargoTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 搜索历史 */}
      {searchHistory.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">最近搜索</h3>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((item, index) => {
              const labels = []
              if (item.country) labels.push(item.country)
              if (item.company) labels.push(item.company)
              if (item.channelName) labels.push(item.channelName)
              if (item.transportType) labels.push(item.transportType)
              if (item.cargoType) labels.push(cargoTypes.find(c => c.value === item.cargoType)?.label || item.cargoType)

              return (
                <button
                  key={index}
                  onClick={() => loadFromHistory(item)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-900 rounded-full hover:bg-gray-200 transition-colors duration-200"
                >
                  {labels.join(' + ')}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* AI 智能助手提示 */}
      <div className="border-t pt-4 mt-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">AI 智能助手</h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>点击右下角的AI助手按钮，您可以直接询问：</p>
                <ul className="mt-1 list-disc list-inside text-xs">
                  <li>"寄5kg普货到美国，哪个渠道最便宜？"</li>
                  <li>"带电产品到德国有哪些渠道可选？"</li>
                  <li>"最快到达日本的渠道是什么？"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}