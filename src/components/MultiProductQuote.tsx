'use client'

import { useState, useEffect } from 'react'
import { QuoteResult, PackageInfo } from '@/types'
import QuoteTable from './QuoteTable'

interface Product {
  id: string
  packageInfo: PackageInfo
  quoteResults: QuoteResult[]
  createdAt: Date
}

interface MultiProductQuoteProps {
  currentQuote: {
    packageInfo: PackageInfo
    results: QuoteResult[]
  } | null
  onClearCurrent?: () => void
}

export default function MultiProductQuote({ currentQuote, onClearCurrent }: MultiProductQuoteProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [showCombinedTable, setShowCombinedTable] = useState(false)
  const [showFullscreenModal, setShowFullscreenModal] = useState(false)

  // 添加当前报价到产品列表
  const addCurrentToProducts = () => {
    if (!currentQuote || currentQuote.results.length === 0) {
      alert('请先获取报价')
      return
    }

    const newProduct: Product = {
      id: `product-${Date.now()}`,
      packageInfo: currentQuote.packageInfo,
      quoteResults: currentQuote.results,
      createdAt: new Date()
    }

    setProducts([...products, newProduct])

    // 清空当前报价
    if (onClearCurrent) {
      onClearCurrent()
    }

    // 显示成功提示
    alert(`产品 #${products.length + 1} 已添加到报价列表`)
  }

  // 删除产品
  const removeProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId))
  }

  // 清空所有产品
  const clearAllProducts = () => {
    if (confirm('确定要清空所有产品吗？')) {
      setProducts([])
    }
  }

  return (
    <div className="space-y-4">
      {/* 多产品控制栏 */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="text-white">
            <h3 className="text-lg font-bold">多产品报价管理</h3>
            <p className="text-sm opacity-90">
              已添加 {products.length} 个产品 |
              总计 {products.reduce((sum, p) => sum + p.quoteResults.length, 0)} 个报价方案
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={addCurrentToProducts}
              disabled={!currentQuote || currentQuote.results.length === 0}
              className="px-4 py-2 bg-white text-purple-700 rounded-lg font-bold hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              + 添加当前产品
            </button>

            {products.length > 0 && (
              <>
                <button
                  onClick={() => setShowCombinedTable(!showCombinedTable)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all"
                >
                  {showCombinedTable ? '隐藏' : '显示'}综合报价表
                </button>

                <button
                  onClick={clearAllProducts}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all"
                >
                  清空所有
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 产品列表 */}
      {products.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h4 className="text-lg font-bold mb-3">已添加产品列表</h4>
          <div className="space-y-2">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-700">#{index + 1}</span>

                  {product.packageInfo.productImage && (
                    <img
                      src={product.packageInfo.productImage}
                      alt={`产品${index + 1}`}
                      className="w-10 h-10 object-cover rounded border"
                    />
                  )}

                  <div className="text-sm">
                    <p className="font-semibold">
                      {product.packageInfo.company} - {product.packageInfo.channelName} → {product.packageInfo.country}
                    </p>
                    <p className="text-gray-600">
                      重量: {product.packageInfo.weight}kg |
                      尺寸: {product.packageInfo.length}×{product.packageInfo.width}×{product.packageInfo.height}cm |
                      产品价值: {product.packageInfo.productCurrency === 'CNY' ? '¥' : '$'}{product.packageInfo.productValue}
                    </p>
                    <p className="text-green-700 font-bold text-lg mt-1">
                      最低费用: ¥{product.quoteResults[0]?.totalCostCNY?.toFixed(2) || '0.00'}
                      <span className="text-sm text-gray-600 ml-2">
                        (${((product.quoteResults[0]?.totalCostCNY || 0) / 7).toFixed(2)})
                      </span>
                    </p>
                    <p className="text-gray-500 text-xs">
                      添加时间: {product.createdAt.toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 综合报价表 */}
      {showCombinedTable && products.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">综合报价表</h3>
              <p className="text-sm text-white opacity-90">
                包含所有 {products.length} 个产品的报价方案
              </p>
            </div>
            <button
              onClick={() => setShowFullscreenModal(true)}
              className="px-4 py-2 bg-white text-green-600 rounded-lg font-bold hover:bg-green-50 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              点击放大
            </button>
          </div>

          {/* 使用修改后的QuoteTable组件显示所有产品 */}
          <div className="p-4">
            <CombinedQuoteTable products={products} />
          </div>
        </div>
      )}

      {/* 全屏模态框 */}
      {showFullscreenModal && (
        <FullscreenQuoteModal
          products={products}
          onClose={() => setShowFullscreenModal(false)}
        />
      )}
    </div>
  )
}

// 综合报价表组件
function CombinedQuoteTable({ products, large = false }: { products: Product[], large?: boolean }) {
  const fontSize = large ? 'text-xl font-black' : 'text-base font-bold'
  const padding = large ? 'px-8 py-6' : 'px-4 py-3'
  const imageSize = large ? 'w-24 h-24' : 'w-12 h-12'

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className={`${large ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gray-700'} text-white`}>
            <th className={`${padding} text-center font-bold ${large ? 'border-2' : 'border'} border-white ${fontSize}`}>产品编号</th>
            <th className={`${padding} text-center font-bold ${large ? 'border-2' : 'border'} border-white ${fontSize}`}>产品图片</th>
            <th className={`${padding} text-center font-bold ${large ? 'border-2' : 'border'} border-white ${fontSize}`}>物流公司</th>
            <th className={`${padding} text-center font-bold ${large ? 'border-2' : 'border'} border-white ${fontSize}`}>渠道</th>
            <th className={`${padding} text-center font-bold ${large ? 'border-2' : 'border'} border-white ${fontSize}`}>国家</th>
            <th className={`${padding} text-center font-bold ${large ? 'border-2' : 'border'} border-white ${fontSize}`}>重量(kg)</th>
            <th className={`${padding} text-center font-bold ${large ? 'border-2' : 'border'} border-white ${fontSize}`}>尺寸(cm)</th>
            <th className={`${padding} text-center font-bold ${large ? 'border-2' : 'border'} border-white ${fontSize}`}>产品价值</th>
            <th className={`${padding} text-center font-bold ${large ? 'border-2' : 'border'} border-white ${fontSize}`}>国际运费</th>
            <th className={`${padding} text-center font-bold ${large ? 'border-2' : 'border'} border-white ${fontSize}`}>总费用</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, productIndex) => (
            product.quoteResults.slice(0, 1).map((result, resultIndex) => (
              <tr
                key={`${product.id}-${resultIndex}`}
                className={`${productIndex % 2 === 0 ? 'bg-white' : large ? 'bg-blue-50' : 'bg-gray-50'} ${large ? 'hover:bg-yellow-50' : 'hover:bg-green-50'} transition-colors`}
              >
                <td className={`${padding} text-center ${large ? 'border-2 border-gray-500 bg-blue-100' : 'border border-gray-400'} font-black`}>
                  <span className={`${large ? 'text-3xl text-blue-900' : 'text-xl text-blue-800'}`}>#{productIndex + 1}</span>
                </td>
                <td className={`${padding} text-center ${large ? 'border-2 border-gray-400' : 'border border-gray-300'}`}>
                  {product.packageInfo.productImage ? (
                    <img
                      src={product.packageInfo.productImage}
                      alt="产品"
                      className={`${imageSize} object-cover ${large ? 'rounded-lg border-4 border-blue-400 shadow-lg' : 'rounded border-2 border-gray-300'} mx-auto`}
                    />
                  ) : (
                    <div className={`${imageSize} bg-gray-200 rounded mx-auto flex items-center justify-center`}>
                      <span className="text-gray-400 text-2xl">无</span>
                    </div>
                  )}
                </td>
                <td className={`${padding} text-center ${large ? 'border-2 border-gray-500 text-black' : 'border border-gray-400 text-gray-900'} font-black ${fontSize}`}>
                  {product.packageInfo.company}
                </td>
                <td className={`${padding} text-center ${large ? 'border-2 border-gray-500 text-black' : 'border border-gray-400 text-gray-900'} font-black ${fontSize}`}>
                  {product.packageInfo.channelName}
                </td>
                <td className={`${padding} text-center ${large ? 'border-2 border-gray-500 text-black' : 'border border-gray-400 text-gray-900'} font-black ${fontSize}`}>
                  {product.packageInfo.country}
                </td>
                <td className={`${padding} text-center ${large ? 'border-2 border-gray-500 text-black' : 'border border-gray-400 text-gray-900'} font-black ${fontSize}`}>
                  {product.packageInfo.weight}
                </td>
                <td className={`${padding} text-center ${large ? 'border-2 border-gray-500 text-black' : 'border border-gray-400 text-gray-900'} font-bold ${fontSize}`}>
                  {product.packageInfo.length}×{product.packageInfo.width}×{product.packageInfo.height}
                </td>
                <td className={`${padding} text-center ${large ? 'border-2 border-gray-500 bg-blue-50' : 'border border-gray-400'} font-black ${fontSize}`}>
                  <span className={`${large ? 'text-2xl text-blue-900' : 'text-lg text-blue-800'} font-black`}>
                    {product.packageInfo.productCurrency === 'CNY' ? '¥' : '$'}
                    {product.packageInfo.productValue}
                  </span>
                </td>
                <td className={`${padding} text-center ${large ? 'border-2 border-gray-400' : 'border border-gray-300'} font-medium ${fontSize}`}>
                  <span className={`${large ? 'text-2xl text-red-900' : 'text-lg text-red-800'} font-black`}>
                    ¥{result.internationalShippingCNY?.toFixed(2) || '0.00'}
                  </span>
                </td>
                <td className={`${padding} text-center ${large ? 'border-2 border-gray-600 bg-green-100' : 'border border-gray-400 bg-green-50'} ${fontSize}`}>
                  <span className={`${large ? 'text-3xl text-green-900' : 'text-xl text-green-800'} font-black`}>
                    ¥{result.totalCostCNY?.toFixed(2) || '0.00'}
                  </span>
                  <div className={`${large ? 'text-sm text-gray-700 mt-1' : 'text-xs text-gray-600'}`}>
                    (${((result.totalCostCNY || 0) / 7).toFixed(2)})
                  </div>
                </td>
              </tr>
            ))
          ))}
        </tbody>
        <tfoot>
          <tr className={`${large ? 'bg-gradient-to-r from-green-100 to-green-200' : 'bg-green-100'}`}>
            <td colSpan={9} className={`${padding} text-right font-bold ${large ? 'border-2 border-gray-400 text-xl' : 'border border-gray-300'} ${fontSize}`}>
              总计:
            </td>
            <td className={`${padding} text-center ${large ? 'border-2 border-gray-600 bg-green-200' : 'border border-gray-400 bg-green-100'}`}>
              <span className={`${large ? 'text-4xl text-green-900' : 'text-2xl text-green-800'} font-black`}>
                ¥{products.reduce((sum, product) => {
                  const cost = product.quoteResults && product.quoteResults.length > 0
                    ? product.quoteResults[0].totalCostCNY || 0
                    : 0
                  console.log(`产品 ${product.id} 费用: ¥${cost}`)
                  return sum + cost
                }, 0).toFixed(2)}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// 全屏模态框组件
function FullscreenQuoteModal({ products, onClose }: { products: Product[], onClose: () => void }) {
  // 防止背景滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleScreenshot = () => {
    alert('请使用系统截图工具（如Windows的Win+Shift+S或Mac的Cmd+Shift+4）进行截图')
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-90">
      <div className="bg-white w-full h-full overflow-auto">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-12 py-8 flex justify-between items-center sticky top-0 z-10 shadow-xl no-print">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">综合报价表 - 详细视图</h2>
            <p className="text-lg text-white">
              共 <span className="text-2xl font-bold text-yellow-300">{products.length}</span> 个产品 |
              生成时间: {new Date().toLocaleString('zh-CN')}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleScreenshot}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg hover:scale-105 transform"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              截图提示
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg text-lg font-bold hover:bg-purple-700 transition-all flex items-center gap-2 shadow-lg hover:scale-105 transform"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              打印
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-red-600 text-white rounded-lg text-lg font-bold hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg hover:scale-105 transform"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              关闭
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-12 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="bg-white rounded-xl shadow-2xl p-8 border-2 border-gray-200">
            <div className="mb-6 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">国际快递综合报价单</h1>
              <div className="text-lg text-gray-700">
                <span className="font-semibold">报价日期：</span>{new Date().toLocaleDateString('zh-CN')} |
                <span className="ml-4 font-semibold">汇率：</span>1 USD = 7 CNY
              </div>
            </div>
            <CombinedQuoteTable products={products} large={true} />
          </div>

          {/* 公司信息 */}
          <div className="mt-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4 text-white">ASG 国际物流有限公司</h3>
            <p className="text-lg text-gray-200">
              <span className="font-semibold">联系人:</span> Janson |
              <span className="ml-4 font-semibold">电话:</span> +86 18915256668 |
              <span className="ml-4 font-semibold">邮箱:</span> janson@asgdropshipping.com
            </p>
            <p className="text-sm text-gray-500 mt-2">
              此报价有效期至: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}