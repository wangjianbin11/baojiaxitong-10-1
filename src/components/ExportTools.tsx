'use client'

import { useState } from 'react'
import { QuoteResult, PackageInfo, ExportFormat } from '@/types'

interface ExportToolsProps {
  results: QuoteResult[]
  packageInfo: PackageInfo | null
}

export default function ExportTools({ results, packageInfo }: ExportToolsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('excel')
  const [showCopySuccess, setShowCopySuccess] = useState(false)

  const generateFileName = (format: ExportFormat): string => {
    const timestamp = new Date().toISOString().slice(0, 10)
    const country = packageInfo?.country || 'unknown'
    return `quote_${country}_${timestamp}.${format === 'excel' ? 'xlsx' : format}`
  }

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true)

    try {
      // 模拟导出延迟
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (format === 'excel') {
        await exportToExcel()
      } else if (format === 'csv') {
        await exportToCSV()
      } else if (format === 'pdf') {
        await exportToPDF()
      }

      // 这里实际应该触发下载
      console.log(`正在导出 ${format} 格式...`)

    } catch (error) {
      console.error('导出失败:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToExcel = async () => {
    // 实际项目中使用 xlsx 库
    const data = results.map(result => ({
      '渠道名称': result.channel.channelName,
      '物流公司': result.channel.company,
      '运输方式': result.channel.transportType,
      '预计时效': result.channel.timeRange,
      '单价(USD)': `$${result.channel.priceUSD.toFixed(2)}`,
      '计费重量(kg)': result.chargeWeight,
      '总费用(USD)': `$${result.totalCost.toFixed(2)}`,
      '特殊标识': result.isCheapest ? '最便宜' : result.isFastest ? '最快' : result.isRecommended ? '推荐' : '',
    }))

    console.log('Excel数据:', data)
  }

  const exportToCSV = async () => {
    const headers = ['渠道名称', '物流公司', '运输方式', '预计时效', '单价(USD)', '计费重量(kg)', '总费用(USD)', '特殊标识']
    const csvData = [
      headers,
      ...results.map(result => [
        result.channel.channelName,
        result.channel.company,
        result.channel.transportType,
        result.channel.timeRange,
        `$${result.channel.priceUSD.toFixed(2)}`,
        result.chargeWeight,
        `$${result.totalCost.toFixed(2)}`,
        result.isCheapest ? '最便宜' : result.isFastest ? '最快' : result.isRecommended ? '推荐' : '',
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', generateFileName('csv'))
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const exportToPDF = async () => {
    // 实际项目中使用 jsPDF 库
    console.log('生成PDF...')
  }

  const copyToClipboard = async () => {
    try {
      const text = generateTextSummary()
      await navigator.clipboard.writeText(text)
      setShowCopySuccess(true)
      setTimeout(() => setShowCopySuccess(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const generateTextSummary = (): string => {
    let summary = '=== 国际快递报价结果 ===\n\n'

    if (packageInfo) {
      summary += '包裹信息:\n'
      summary += `目的地: ${packageInfo.country}\n`
      summary += `重量: ${packageInfo.weight}kg\n`
      summary += `尺寸: ${packageInfo.length}×${packageInfo.width}×${packageInfo.height}cm\n`
      summary += `货物类型: ${packageInfo.cargoType === 'general' ? '普货' :
                                packageInfo.cargoType === 'battery' ? '带电' :
                                packageInfo.cargoType === 'liquid' ? '液体' : '敏感货'}\n\n`
    }

    summary += '报价详情:\n'
    summary += '────────────────────────────────\n'

    results.forEach((result, index) => {
      summary += `${index + 1}. ${result.channel.channelName}\n`
      summary += `   时效: ${result.channel.timeRange}\n`
      summary += `   费用: $${result.totalCost.toFixed(2)} USD\n`
      summary += `   单价: $${result.channel.priceUSD.toFixed(2)}/kg\n`

      if (result.isCheapest) summary += '   🏆 最便宜\n'
      if (result.isFastest) summary += '   ⚡ 最快\n'
      if (result.isRecommended) summary += '   ⭐ 推荐\n'

      summary += '\n'
    })

    summary += '────────────────────────────────\n'
    summary += `生成时间: ${new Date().toLocaleString('zh-CN')}\n`
    summary += '数据来源: 国际快递报价工具'

    return summary
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">导出工具</h3>
          <span className="text-sm text-gray-500">
            ({results.length} 条结果)
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          {/* 格式选择 */}
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={isExporting}
          >
            <option value="excel">Excel (.xlsx)</option>
            <option value="csv">CSV (.csv)</option>
            <option value="pdf">PDF (.pdf)</option>
          </select>

          {/* 导出按钮 */}
          <button
            onClick={() => handleExport(exportFormat)}
            disabled={isExporting || results.length === 0}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                导出中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                导出
              </>
            )}
          </button>

          {/* 复制按钮 */}
          <button
            onClick={copyToClipboard}
            disabled={results.length === 0}
            className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {showCopySuccess ? (
              <>
                <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                已复制
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                复制
              </>
            )}
          </button>
        </div>
      </div>

      {/* 导出选项 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900">Excel表格</div>
              <div className="text-gray-500">完整数据，便于分析</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M7 7h10" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900">CSV文件</div>
              <div className="text-gray-500">纯数据，兼容性好</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900">PDF文档</div>
              <div className="text-gray-500">正式报告，易于分享</div>
            </div>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="mt-4 bg-gray-50 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-900 mb-2">导出说明</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Excel格式包含所有详细数据，支持筛选和排序</li>
          <li>• CSV格式纯文本，可用任何表格软件打开</li>
          <li>• PDF格式适合打印和正式汇报</li>
          <li>• 复制功能可快速分享到聊天工具</li>
        </ul>
      </div>
    </div>
  )
}