'use client'

import { useState, useEffect, useCallback } from 'react'
import { knowledgeBase, KnowledgeItem } from '@/lib/knowledgeBase'

export default function KnowledgeManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null)

  const [formData, setFormData] = useState({
    category: '',
    question: '',
    answer: '',
    keywords: ''
  })

  const loadKnowledge = useCallback(() => {
    knowledgeBase.loadFromLocalStorage()
    const allKnowledge = knowledgeBase.getAllKnowledge()
    const cats = knowledgeBase.getCategories()

    setCategories(cats)

    if (selectedCategory === 'all') {
      setKnowledge(allKnowledge)
    } else {
      setKnowledge(knowledgeBase.getByCategory(selectedCategory))
    }
  }, [selectedCategory])

  useEffect(() => {
    if (isOpen) {
      loadKnowledge()
    }
  }, [isOpen, selectedCategory, loadKnowledge])

  const handleAdd = () => {
    if (formData.question && formData.answer && formData.category) {
      const keywords = formData.keywords.split(',').map(k => k.trim()).filter(k => k)

      if (editingItem) {
        knowledgeBase.updateKnowledge(editingItem.id, {
          category: formData.category,
          question: formData.question,
          answer: formData.answer,
          keywords
        })
        setEditingItem(null)
      } else {
        knowledgeBase.addKnowledge({
          category: formData.category,
          question: formData.question,
          answer: formData.answer,
          keywords
        })
      }

      setFormData({ category: '', question: '', answer: '', keywords: '' })
      setShowAddForm(false)
      loadKnowledge()
    }
  }

  const handleEdit = (item: KnowledgeItem) => {
    setEditingItem(item)
    setFormData({
      category: item.category,
      question: item.question,
      answer: item.answer,
      keywords: item.keywords.join(', ')
    })
    setShowAddForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条知识吗？')) {
      knowledgeBase.deleteKnowledge(id)
      loadKnowledge()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full p-3 shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
        title="知识库管理"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">物流知识库管理</h2>
              <p className="text-purple-200 mt-1">管理和维护物流相关知识</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 工具栏 */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-medium"
            >
              <option value="all">所有类别</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <span className="text-gray-600">
              共 {knowledge.length} 条知识
            </span>
          </div>
          <button
            onClick={() => {
              setEditingItem(null)
              setFormData({ category: '', question: '', answer: '', keywords: '' })
              setShowAddForm(true)
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            + 添加知识
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-4">
          {showAddForm ? (
            <div className="bg-gray-50 rounded-xl p-6 mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingItem ? '编辑知识' : '添加新知识'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">类别</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="如：计费规则、货物限制、清关知识等"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">问题</label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="用户可能询问的问题"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">答案</label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="详细的答案内容"
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">关键词</label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="用逗号分隔的关键词，如：DHL, 快递, 时效"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAdd}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  >
                    {editingItem ? '保存修改' : '添加'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingItem(null)
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledge.map((item) => (
              <div key={item.id} className="bg-white border rounded-xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                    {item.category}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800"
                      title="编辑"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                      title="删除"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.question}</h3>
                <p className="text-gray-700 text-sm mb-2 line-clamp-3">{item.answer}</p>
                <div className="flex flex-wrap gap-1">
                  {item.keywords.map((keyword, index) => (
                    <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}