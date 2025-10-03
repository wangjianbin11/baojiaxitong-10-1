'use client'

import { useState } from 'react'
import Image from 'next/image'
import { QuoteResult, PackageInfo } from '@/types'
import { translations, getTranslation, translateCountry, translateTimeRange, translateCargoType } from '@/lib/translations'

interface QuoteTableProps {
  results: QuoteResult[]
  packageInfo: PackageInfo | null
}

// 多语言表头配置
const tableHeaders = {
  zh: ['序号', '产品图片', '产品名称', '颜色', '每包件数', '包装尺寸', '毛重', '体积重', '计费重', '国家', '订单处理时间', '产品成本', '服务费', '国内运费', '国际运费', '关税', '快递运输时间', '总成本价'],
  en: ['No.', 'Product Image', 'Product Name', 'Color', 'Qty/Pack', 'Package Size', 'Gross Weight', 'Volume Weight', 'Chargeable Weight', 'Country', 'Order Processing Time', 'Product Cost', 'Service Fee', 'Domestic Shipping', 'International Shipping', 'Customs Duty', 'Express Delivery Time', 'Total Cost'],
  tr: ['Sıra', 'Ürün Resmi', 'Ürün Adı', 'Renk', 'Paket Adedi', 'Paket Boyutu', 'Brüt Ağırlık', 'Hacim Ağırlığı', 'Ücretlendirilebilir Ağırlık', 'Ülke', 'Sipariş İşleme Süresi', 'Ürün Maliyeti', 'Hizmet Ücreti', 'Yurtiçi Kargo', 'Uluslararası Kargo', 'Gümrük Vergisi', 'Ekspres Teslimat Süresi', 'Toplam Maliyet'],
  fr: ['N°', 'Image du produit', 'Nom du produit', 'Couleur', 'Qté/Pack', 'Taille du colis', 'Poids brut', 'Poids volumétrique', 'Poids facturable', 'Pays', 'Temps de traitement', 'Coût du produit', 'Frais de service', 'Expédition nationale', 'Expédition internationale', 'Droits de douane', 'Temps de livraison', 'Coût total'],
  de: ['Nr.', 'Produktbild', 'Produktname', 'Farbe', 'Stück/Paket', 'Paketgröße', 'Bruttogewicht', 'Volumengewicht', 'Berechnungsgewicht', 'Land', 'Bearbeitungszeit', 'Produktkosten', 'Servicegebühr', 'Inlandsversand', 'Internationaler Versand', 'Zoll', 'Express-Lieferzeit', 'Gesamtkosten']
}

type Language = 'zh' | 'en' | 'tr' | 'fr' | 'de'

export default function QuoteTable({ results, packageInfo }: QuoteTableProps) {
  const [selectedResults, setSelectedResults] = useState<string[]>([])
  const [currency, setCurrency] = useState<'CNY' | 'USD'>('USD')
  const [exportLanguage, setExportLanguage] = useState<Language>('zh')

  // 汇率（1 USD = 7 CNY）
  const USD_TO_CNY = 7

  // 转换货币
  const convertPrice = (priceInUSD: number | undefined): string => {
    if (!priceInUSD) return '0.00'
    if (currency === 'CNY') {
      return (priceInUSD * USD_TO_CNY).toFixed(2)
    }
    return priceInUSD.toFixed(2)
  }

  const getCurrencySymbol = () => currency === 'CNY' ? '¥' : '$'

  const toggleSelect = (id: string) => {
    setSelectedResults(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const exportToExcel = (language: Language = 'zh') => {
    if (selectedResults.length === 0) return

    const selectedData = results.filter(r => selectedResults.includes(r.channel.id))
    const currencySymbol = getCurrencySymbol()

    // 创建表格HTML
    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #5CB85C; color: white; font-weight: bold; padding: 10px; text-align: center; border: 1px solid #ddd; }
          td { padding: 8px; text-align: center; border: 1px solid #ddd; }
          .header { background-color: #f0f0f0; font-weight: bold; }
          .total { background-color: #e8f5e9; font-weight: bold; }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 20px;">
          <h2>ASG</h2>
          <h3>Quotation product</h3>
          <p>Contact: Janson</p>
          <p>WhatsApp/WeChat/Phone: +86 18915256668</p>
          <p>Email: janson@asgdropshipping.com</p>
        </div>
        <table>
          <thead>
            <tr>
              ${tableHeaders[language].map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${selectedData.map((result, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${packageInfo?.productImage ? '<img src="' + packageInfo.productImage + '" style="width:50px;height:50px;">' : '-'}</td>
                <td>${translateCargoType(packageInfo?.cargoType || '货物', language)}</td>
                <td>-</td>
                <td>1</td>
                <td>${packageInfo?.length}×${packageInfo?.width}×${packageInfo?.height}cm</td>
                <td>${result.actualWeight}kg</td>
                <td>${result.volumeWeight}kg</td>
                <td>${result.chargeWeight}kg</td>
                <td>${translateCountry(result.channel.country, language)}</td>
                <td>${language === 'zh' ? '24小时' : language === 'en' ? '24 HOURS' : language === 'tr' ? '24 SAAT' : language === 'fr' ? '24 HEURES' : '24 STUNDEN'}</td>
                <td>${currencySymbol}${convertPrice(result.productCost || 0)}</td>
                <td>${currencySymbol}${convertPrice(result.serviceFeeUSD || 1.20)}</td>
                <td>${currencySymbol}${convertPrice(result.domesticShippingUSD || 1.00)}</td>
                <td>${currencySymbol}${convertPrice(result.internationalShippingUSD || 0)}</td>
                <td>${currencySymbol}0.00</td>
                <td>${translateTimeRange(result.channel.timeRange, language)}</td>
                <td>${currencySymbol}${convertPrice(result.totalCost)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total">
              <td colspan="17" style="text-align: right;">TotalCostPrice</td>
              <td>${currencySymbol}${convertPrice(selectedData.reduce((sum, r) => sum + r.totalCost, 0))}</td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `

    // 创建Blob并下载
    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // 根据语言设置文件名
    const langSuffix = {
      zh: 'CN',
      en: 'EN',
      tr: 'TR',
      fr: 'FR',
      de: 'DE'
    }
    link.download = `ASG_Quote_${langSuffix[language]}_${new Date().toISOString().split('T')[0]}.xls`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const copyTable = () => {
    if (selectedResults.length === 0) {
      alert(t('pleaseSelectFirst'))
      return
    }

    const selectedData = results.filter(r => selectedResults.includes(r.channel.id))
    const currencySymbol = getCurrencySymbol()

    // 创建制表符分隔的文本（可直接粘贴到Excel）
    const headers = tableHeaders[exportLanguage]
    const rows = selectedData.map((result, index) => [
      index + 1,
      packageInfo?.productImage ? '【图片】' : '-',
      translateCargoType(packageInfo?.cargoType || '货物', exportLanguage),
      '-',
      '1',
      `${packageInfo?.length}×${packageInfo?.width}×${packageInfo?.height}cm`,
      `${result.actualWeight}kg`,
      `${result.volumeWeight}kg`,
      `${result.chargeWeight}kg`,
      translateCountry(result.channel.country, exportLanguage),
      exportLanguage === 'zh' ? '24小时' : exportLanguage === 'en' ? '24 HOURS' : exportLanguage === 'tr' ? '24 SAAT' : exportLanguage === 'fr' ? '24 HEURES' : '24 STUNDEN',
      `${currencySymbol}${convertPrice(result.productCost || 0)}`,
      `${currencySymbol}${convertPrice(result.serviceFeeUSD || 1.20)}`,
      `${currencySymbol}${convertPrice(result.domesticShippingUSD || 1.00)}`,
      `${currencySymbol}${convertPrice(result.internationalShippingUSD || 0)}`,
      `${currencySymbol}0.00`,
      translateTimeRange(result.channel.timeRange, exportLanguage),
      `${currencySymbol}${convertPrice(result.totalCost)}`
    ])

    // 添加总计行
    const total = selectedData.reduce((sum, r) => sum + r.totalCost, 0)
    const totalRow = Array(17).fill('').concat([`${currencySymbol}${convertPrice(total)}`])
    totalRow[16] = 'TotalCostPrice'

    const tableText = [
      headers.join('\t'),
      ...rows.map(row => row.join('\t')),
      totalRow.join('\t')
    ].join('\n')

    // 复制到剪贴板
    navigator.clipboard.writeText(tableText).then(() => {
      // 显示成功提示
      alert(t('copiedToClipboard'))
    }).catch(err => {
      console.error('复制失败:', err)
      alert(t('copyFailed'))
    })
  }

  const t = (key: keyof typeof translations.zh) => getTranslation(exportLanguage, key)

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-gray-800 font-medium text-lg">{t('noResults')}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* 工具栏 */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex justify-between items-center">
        <div className="text-white">
          <h3 className="text-xl font-bold">{t('title')}</h3>
          <p className="text-sm opacity-90">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
            <label className="text-white text-sm font-bold">{t('currency')}:</label>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded text-sm font-bold transition-all ${
                currency === 'USD' ? 'bg-white text-green-700' : 'bg-transparent text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency('CNY')}
              className={`px-3 py-1 rounded text-sm font-bold transition-all ${
                currency === 'CNY' ? 'bg-white text-green-700' : 'bg-transparent text-white'
              }`}
            >
              CNY (¥)
            </button>
          </div>

          {/* 语言选择器 */}
          <select
            value={exportLanguage}
            onChange={(e) => setExportLanguage(e.target.value as Language)}
            className="px-4 py-2 bg-white/20 text-white rounded-lg font-bold border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="zh" className="text-gray-900">🇨🇳 中文</option>
            <option value="en" className="text-gray-900">🇬🇧 English</option>
            <option value="tr" className="text-gray-900">🇹🇷 Türkçe</option>
            <option value="fr" className="text-gray-900">🇫🇷 Français</option>
            <option value="de" className="text-gray-900">🇩🇪 Deutsch</option>
          </select>

          {/* 复制按钮 */}
          <button
            onClick={() => copyTable()}
            disabled={selectedResults.length === 0}
            className="px-5 py-2 bg-white text-green-700 rounded-xl font-bold text-base hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            📋 {t('copy')}
          </button>

          {/* 导出按钮 */}
          <button
            onClick={() => exportToExcel(exportLanguage)}
            disabled={selectedResults.length === 0}
            className="px-5 py-2 bg-white text-green-700 rounded-xl font-bold text-base hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            📊 {t('exportExcel')}
          </button>
        </div>
      </div>

      {/* 联系信息 */}
      <div className="px-6 py-3 bg-gray-50 text-center border-b">
        <p className="text-sm text-gray-900 font-medium">
          <span className="font-bold">{t('contact')}:</span> Janson |
          <span className="font-bold"> {t('whatsapp')}:</span> +86 18915256668 |
          <span className="font-bold"> {t('email')}:</span> janson@asgdropshipping.com
        </p>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <th className="px-4 py-3 text-center font-bold border-r border-orange-400">{t('select')}</th>
              <th className="px-4 py-3 text-center font-bold border-r border-orange-400">{t('serialNo')}</th>
              <th className="px-4 py-3 text-center font-bold border-r border-orange-400">{t('productImage')}</th>
              <th className="px-4 py-3 text-center font-bold border-r border-orange-400">{t('country')}</th>
              <th className="px-4 py-3 text-center font-bold border-r border-orange-400">{t('grossWeight')}</th>
              <th className="px-4 py-3 text-center font-bold border-r border-orange-400">{t('volumeWeight')}</th>
              <th className="px-4 py-3 text-center font-bold border-r border-orange-400">{t('chargeWeight')}</th>
              <th className="px-4 py-3 text-center font-bold border-r border-orange-400">{t('productValue')}</th>
              <th className="px-4 py-3 text-center font-bold border-r border-orange-400">{t('shippingRate')}</th>
              <th className="px-4 py-3 text-center font-bold border-r border-orange-400">{t('internationalShipping')}</th>
              <th className="px-4 py-3 text-center font-bold border-r border-orange-400">{t('registrationFee')}</th>
              <th className="px-4 py-3 text-center font-bold border-r border-orange-400">{t('domesticShipping')}</th>
              <th className="px-4 py-3 text-center font-bold border-r border-orange-400">{t('serviceFee')}</th>
              <th className="px-4 py-3 text-center font-bold border-r border-orange-400">{t('timeRange')}</th>
              <th className="px-4 py-3 text-center font-bold">{t('totalCost')}</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => {
              return (
                <tr
                  key={result.channel.id}
                  className={`border-b hover:bg-green-50 transition-colors ${
                    selectedResults.includes(result.channel.id) ? 'bg-green-100' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-center border-r">
                    <input
                      type="checkbox"
                      checked={selectedResults.includes(result.channel.id)}
                      onChange={() => toggleSelect(result.channel.id)}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-center border-r font-semibold text-gray-800">{index + 1}</td>
                  <td className="px-4 py-3 text-center border-r">
                    {packageInfo?.productImage ? (
                      <Image
                        src={packageInfo.productImage}
                        alt="产品图片"
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded mx-auto border border-gray-300"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded mx-auto flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center border-r text-black font-bold">{translateCountry(result.channel.country, exportLanguage)}</td>
                  <td className="px-4 py-3 text-center border-r text-black font-bold">{result.actualWeight}</td>
                  <td className="px-4 py-3 text-center border-r text-blue-900 font-black">{result.volumeWeight}</td>
                  <td className="px-4 py-3 text-center border-r font-black text-black bg-yellow-50">{result.chargeWeight}</td>
                  <td className="px-4 py-3 text-center border-r text-black font-bold">{getCurrencySymbol()}{convertPrice(result.productCost || 0)}</td>
                  <td className="px-4 py-3 text-center border-r text-black font-bold">
                    {currency === 'CNY' ? `¥${(result.pricePerKgCNY || 0).toFixed(2)}/kg` : `$${((result.pricePerKgCNY || 0) / USD_TO_CNY).toFixed(2)}/kg`}
                  </td>
                  <td className="px-4 py-3 text-center border-r text-black font-bold">
                    {currency === 'CNY' ? `¥${(result.internationalShippingCNY || 0).toFixed(2)}` : `$${(result.internationalShippingUSD || 0).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-center border-r text-black font-bold">
                    {currency === 'CNY' ? `¥${(result.registrationFeeCNY || 0).toFixed(2)}` : `$${((result.registrationFeeCNY || 0) / USD_TO_CNY).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-center border-r text-black font-bold">
                    {currency === 'CNY' ? `¥${(result.domesticShippingCNY || 0).toFixed(2)}` : `$${(result.domesticShippingUSD || 0).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-center border-r font-black text-blue-900">
                    {currency === 'CNY' ? `¥${(result.serviceFeeCNY || 0).toFixed(2)}` : `$${(result.serviceFeeUSD || 0).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-center border-r text-black font-bold">{translateTimeRange(result.channel.timeRange, exportLanguage)}</td>
                  <td className="px-4 py-3 text-center font-black text-green-900 text-xl bg-green-50">{getCurrencySymbol()}{convertPrice(result.totalCost)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
              <td colSpan={14} className="px-6 py-4 text-right font-black text-xl text-black border-r border-gray-400">
                {t('grandTotal')}:
              </td>
              <td className="px-6 py-4 text-center font-black text-green-900 text-2xl bg-green-100 border-2 border-green-600">
                {getCurrencySymbol()}{convertPrice(results.reduce((sum, r) => sum + r.totalCost, 0))}
              </td>
            </tr>
            {selectedResults.length > 0 && (
              <tr className="bg-blue-100">
                <td colSpan={14} className="px-6 py-3 text-right font-bold text-lg text-blue-900 border-r">
                  已选 {selectedResults.length} 个渠道总计:
                </td>
                <td className="px-6 py-3 text-center font-black text-blue-900 text-xl bg-blue-200">
                  {getCurrencySymbol()}{convertPrice(results
                    .filter(r => selectedResults.includes(r.channel.id))
                    .reduce((sum, r) => sum + r.totalCost, 0))}
                </td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>
    </div>
  )
}