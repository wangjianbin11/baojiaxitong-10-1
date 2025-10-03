// 物流知识库系统
export interface KnowledgeItem {
  id: string
  category: string
  question: string
  answer: string
  keywords: string[]
  createdAt: Date
  updatedAt: Date
}

class LogisticsKnowledgeBase {
  private static instance: LogisticsKnowledgeBase
  private knowledge: Map<string, KnowledgeItem>

  private constructor() {
    this.knowledge = new Map()
    this.initializeDefaultKnowledge()
  }

  static getInstance(): LogisticsKnowledgeBase {
    if (!LogisticsKnowledgeBase.instance) {
      LogisticsKnowledgeBase.instance = new LogisticsKnowledgeBase()
    }
    return LogisticsKnowledgeBase.instance
  }

  // 初始化默认知识库
  private initializeDefaultKnowledge() {
    const defaultKnowledge: Omit<KnowledgeItem, 'id'>[] = [
      {
        category: '计费规则',
        question: '什么是体积重？如何计算？',
        answer: '体积重是根据货物体积计算的重量。国际快递通常使用两种公式：\n1. 空运标准：长×宽×高(cm)÷6000\n2. 海运标准：长×宽×高(cm)÷8000\n实际计费时，取实际重量和体积重中较大者作为计费重量。',
        keywords: ['体积重', '计算', '公式', '6000', '8000'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: '货物限制',
        question: '哪些物品属于敏感货？',
        answer: '敏感货包括：\n1. 带电产品（手机、电脑、充电宝等）\n2. 液体/膏状/粉末（化妆品、香水、药品等）\n3. 品牌商品（需要授权书）\n4. 食品、保健品\n5. 磁性物品\n6. 刀具、仿真枪等\n这些物品需要走特殊渠道，费用通常更高。',
        keywords: ['敏感货', '限制', '带电', '液体', '品牌'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: '清关知识',
        question: '什么是关税？如何计算？',
        answer: '关税是进口货物需要缴纳的税费。计算方式：\n关税 = 货物价值 × 关税税率\n不同国家有不同的起征点：\n- 美国：$800以下免税\n- 欧盟：€150以下免税\n- 英国：£135以下免税\n- 澳大利亚：AUD1000以下免税',
        keywords: ['关税', '税率', '起征点', '清关', '免税'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: '渠道选择',
        question: 'DHL、UPS、FedEx、EMS有什么区别？',
        answer: 'DHL：速度快，清关能力强，适合欧洲；价格较高\nUPS：美国线路优势明显，时效稳定\nFedEx：亚太地区网络完善，适合东南亚\nEMS：邮政系统，清关简单，适合普货；速度较慢\n选择建议：时效优先选DHL/UPS，价格优先选EMS，根据目的地选择优势渠道。',
        keywords: ['DHL', 'UPS', 'FedEx', 'EMS', '渠道', '对比'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: '包装要求',
        question: '国际快递包装有什么要求？',
        answer: '包装要求：\n1. 使用坚固的纸箱，避免使用布袋、编织袋\n2. 内部填充缓冲材料（泡沫、气泡膜）\n3. 液体需密封防漏\n4. 易碎品需特殊标识\n5. 单件重量不超过30kg（部分渠道限制）\n6. 单边长度不超过1.5米\n7. 周长不超过3米',
        keywords: ['包装', '要求', '纸箱', '缓冲', '标识'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: '时效说明',
        question: '国际快递一般需要多久？',
        answer: '参考时效（工作日）：\n东南亚：2-4天\n日韩：2-3天\n美国：3-5天\n欧洲：3-6天\n南美：7-12天\n非洲：5-10天\n注意：时效受清关、节假日、天气等因素影响，仅供参考。',
        keywords: ['时效', '时间', '多久', '天数'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: '费用组成',
        question: '国际快递费用包含哪些？',
        answer: '费用组成：\n1. 基础运费（按重量/体积计算）\n2. 燃油附加费（10-25%不等）\n3. 偏远附加费（偏远地区）\n4. 超长超重附加费\n5. 清关服务费\n6. 关税（收件人支付）\n7. 保险费（可选）',
        keywords: ['费用', '运费', '附加费', '组成'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: '禁运物品',
        question: '哪些物品绝对不能寄？',
        answer: '绝对禁运物品：\n1. 武器弹药、爆炸物\n2. 毒品、管制药品\n3. 活体动植物\n4. 货币、有价证券\n5. 淫秽物品\n6. 放射性物质\n7. 易燃易爆危险品\n违反规定将承担法律责任！',
        keywords: ['禁运', '违禁品', '不能寄', '危险品'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: '报关知识',
        question: '如何正确申报货物？',
        answer: '申报要点：\n1. 如实申报品名（英文）\n2. 准确申报价值（不要低报）\n3. 填写HS编码（海关编码）\n4. 提供详细收件人信息\n5. 商业发票要规范\n虚假申报可能导致：扣货、罚款、列入黑名单',
        keywords: ['报关', '申报', 'HS编码', '发票'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: '保险服务',
        question: '需要购买运输保险吗？',
        answer: '建议购买保险的情况：\n1. 货物价值超过$100\n2. 易碎品、精密仪器\n3. 重要文件、样品\n保险费率：通常为货值的0.3-1%\n理赔范围：丢失、损坏、延误\n注意：部分物品不在保险范围内',
        keywords: ['保险', '理赔', '保价', '丢失', '损坏'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // 添加到知识库
    defaultKnowledge.forEach(item => {
      const id = this.generateId()
      this.knowledge.set(id, { ...item, id })
    })
  }

  // 搜索知识
  search(query: string): KnowledgeItem[] {
    const queryLower = query.toLowerCase()
    const results: { item: KnowledgeItem; score: number }[] = []

    this.knowledge.forEach(item => {
      let score = 0

      // 检查问题匹配
      if (item.question.toLowerCase().includes(queryLower)) {
        score += 10
      }

      // 检查答案匹配
      if (item.answer.toLowerCase().includes(queryLower)) {
        score += 5
      }

      // 检查关键词匹配
      item.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(queryLower) || queryLower.includes(keyword.toLowerCase())) {
          score += 3
        }
      })

      if (score > 0) {
        results.push({ item, score })
      }
    })

    // 按分数排序
    return results
      .sort((a, b) => b.score - a.score)
      .map(r => r.item)
      .slice(0, 5)
  }

  // 添加新知识
  addKnowledge(knowledge: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>): KnowledgeItem {
    const id = this.generateId()
    const newItem: KnowledgeItem = {
      ...knowledge,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.knowledge.set(id, newItem)
    this.saveToLocalStorage()
    return newItem
  }

  // 更新知识
  updateKnowledge(id: string, updates: Partial<Omit<KnowledgeItem, 'id' | 'createdAt'>>): KnowledgeItem | null {
    const item = this.knowledge.get(id)
    if (!item) return null

    const updatedItem: KnowledgeItem = {
      ...item,
      ...updates,
      updatedAt: new Date()
    }
    this.knowledge.set(id, updatedItem)
    this.saveToLocalStorage()
    return updatedItem
  }

  // 删除知识
  deleteKnowledge(id: string): boolean {
    const result = this.knowledge.delete(id)
    if (result) {
      this.saveToLocalStorage()
    }
    return result
  }

  // 获取所有知识
  getAllKnowledge(): KnowledgeItem[] {
    return Array.from(this.knowledge.values())
  }

  // 按类别获取
  getByCategory(category: string): KnowledgeItem[] {
    return Array.from(this.knowledge.values()).filter(item => item.category === category)
  }

  // 获取所有类别
  getCategories(): string[] {
    const categories = new Set<string>()
    this.knowledge.forEach(item => categories.add(item.category))
    return Array.from(categories)
  }

  // 保存到本地存储
  private saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      const data = Array.from(this.knowledge.entries())
      localStorage.setItem('logistics_knowledge_base', JSON.stringify(data))
    }
  }

  // 从本地存储加载
  loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('logistics_knowledge_base')
      if (data) {
        try {
          const entries = JSON.parse(data)
          this.knowledge = new Map(entries.map(([id, item]: [string, KnowledgeItem]) => [
            id,
            {
              ...item,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt)
            }
          ]))
        } catch (error) {
          console.error('Failed to load knowledge base from localStorage:', error)
        }
      }
    }
  }

  // 生成唯一ID
  private generateId(): string {
    return `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const knowledgeBase = LogisticsKnowledgeBase.getInstance()