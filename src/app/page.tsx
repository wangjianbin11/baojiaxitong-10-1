'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PackageForm from '@/components/PackageForm'
import QuoteTable from '@/components/QuoteTable'
import MultiProductQuote from '@/components/MultiProductQuote'
// import ExportTools from '@/components/ExportTools'
// import AIAssistant from '@/components/AIAssistant'
// import KnowledgeManager from '@/components/KnowledgeManager'
import { PackageInfo, QuoteResult } from '@/types'

interface User {
  id: string
  name: string
  phone: string
  role: string
  department?: string
}

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null)
  const [quoteResults, setQuoteResults] = useState<QuoteResult[]>([])
  const [, setLoading] = useState(false)
  const [currentQuote, setCurrentQuote] = useState<{ packageInfo: PackageInfo; results: QuoteResult[] } | null>(null)

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (!token || !userStr) {
      router.push('/login')
      return
    }

    try {
      const userData = JSON.parse(userStr)
      setUser(userData)
    } catch (error) {
      console.error('解析用户信息失败:', error)
      router.push('/login')
    }
  }, [router])

  const handleQuoteRequest = async (info: PackageInfo) => {
    setPackageInfo(info)
    setLoading(true)

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ packageInfo: info }),
      })

      if (!response.ok) {
        throw new Error('获取报价失败')
      }

      const data = await response.json()

      if (data.success) {
        setQuoteResults(data.data.results)
        setCurrentQuote({
          packageInfo: info,
          results: data.data.results
        })
      } else {
        console.error('API错误:', data.error)
        alert(data.error || '获取报价失败')
      }
    } catch (error) {
      console.error('请求失败:', error)
      alert('获取报价失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
  }

  const clearCurrentQuote = () => {
    setPackageInfo(null)
    setQuoteResults([])
    setCurrentQuote(null)
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-100 flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="text-orange-500 font-extrabold">ASG</span>
                <span className="text-gray-800"> 报价系统</span>
              </h1>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">当前用户</p>
                <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                <p className="text-xs text-gray-500">{user.department || user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm whitespace-nowrap"
              >
                退出登录
              </button>
              <div className="hidden lg:flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm text-gray-700 font-medium whitespace-nowrap">系统正常</span>
              </div>
              <div className="hidden lg:block text-sm text-gray-600 font-medium whitespace-nowrap">
                {new Date().toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  weekday: 'long'
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full px-4 md:px-6 py-4 md:py-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          {/* 左侧：输入表单 */}
          <div className="lg:col-span-2">
            <PackageForm onSubmit={handleQuoteRequest} />
          </div>

          {/* 右侧：报价结果 */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            {/* 多产品报价管理 */}
            <MultiProductQuote
              currentQuote={currentQuote}
              onClearCurrent={clearCurrentQuote}
            />

            {/* 当前报价结果 */}
            {quoteResults.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 md:px-6 py-3 md:py-4">
                  <h3 className="text-lg md:text-xl font-bold text-white">当前产品报价</h3>
                  <p className="text-xs md:text-sm text-white opacity-90">
                    找到 {quoteResults.length} 个渠道方案
                  </p>
                </div>
                <QuoteTable results={quoteResults} packageInfo={packageInfo} />
              </div>
            )}

            {/* 没有报价时的提示 */}
            {quoteResults.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center">
                <p className="text-gray-800 font-medium text-base md:text-lg">暂无报价结果</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-auto flex-shrink-0">
        <div className="w-full px-4 md:px-6 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0">
            <div className="text-xs md:text-sm text-gray-300 text-center md:text-left">
              © 2024 国际快递报价系统 | 客服: 400-888-8888 | service@express.com
            </div>
            <div className="text-xs md:text-sm text-gray-400">系统版本 v2.0 | 实时汇率更新</div>
          </div>
        </div>
      </footer>

      {/* AI助手按钮 */}
      <div className="fixed bottom-4 right-4 z-50">
        <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full p-5 shadow-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-3 hover:scale-110 transform">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
          <span className="hidden sm:inline text-lg font-bold">🤖 AI助手</span>
        </button>
      </div>

      {/* 知识库管理按钮 */}
      <button
        className="fixed bottom-24 right-4 z-40 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full p-3 shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
        title="知识库管理"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      </button>
    </div>
  )
}