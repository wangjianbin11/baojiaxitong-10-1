// 万邦速达物流规则系统
export interface ShippingRule {
  id: string
  country: string // 国家
  company: string // 物流公司
  channel: string // 渠道
  productType: string // 产品类型
  timeRange: string // 参考时效
  weightRange: string // 重量限制
  sizeLimit: string // 尺寸限制
  minBillableWeight: number // 最低计费重
  pricePerKg: number // 公斤单价(RMB/KG)
  registrationFee: number // 挂号费(RMB/票)
  notes: string // 备注
  restrictions: string[] // 限制条件
}

// 产品属性类型
export enum ProductType {
  GENERAL = 'general', // 普货
  BATTERY = 'battery', // 带电产品
  LIQUID = 'liquid', // 液体
  SENSITIVE = 'sensitive', // 敏感货
  BRAND = 'brand', // 品牌货
  FOOD = 'food', // 食品
  COSMETICS = 'cosmetics', // 化妆品
  MEDICINE = 'medicine', // 药品
}

// 物流公司
export enum LogisticsCompany {
  WANB = 'WANB', // 万邦速达
  DHL = 'DHL',
  UPS = 'UPS',
  FEDEX = 'FedEx',
  EMS = 'EMS',
  SF = 'SF', // 顺丰
  YODEL = 'Yodel',
  EVRI = 'Evri',
  RM = 'RM', // 英国皇家邮政
}

// 万邦速达渠道数据
export const WANBChannels = {
  EUEXR: {
    name: '英国快线',
    code: 'EUEXR',
    countries: ['英国'],
    timeRange: '4-6工作日',
    features: ['快速清关', '支持普货', 'Yodel派送'],
  },
  UKSLRRM: {
    name: '英国快线RM',
    code: 'UKSLRRM',
    countries: ['英国'],
    timeRange: '4-6工作日',
    features: ['皇家邮政派送', '时效稳定'],
  },
  US_EXPRESS: {
    name: '美国专线',
    code: 'USEXR',
    countries: ['美国'],
    timeRange: '6-12工作日',
    features: ['支持普货', '清关便捷'],
  },
  FR_EXPRESS: {
    name: '法国专线',
    code: 'FREXR',
    countries: ['法国'],
    timeRange: '6-10工作日',
    features: ['支持普货', '时效稳定'],
  },
  DE_EXPRESS: {
    name: '德国专线',
    code: 'DEEXR',
    countries: ['德国'],
    timeRange: '6-10工作日',
    features: ['支持普货', '时效稳定'],
  },
  IT_EXPRESS: {
    name: '意大利专线',
    code: 'ITEXR',
    countries: ['意大利'],
    timeRange: '6-10工作日',
    features: ['支持普货', '时效稳定'],
  },
}

// 万邦速达英国线路价格表（基于图片数据）
export const WANBPricingRules: ShippingRule[] = [
  // 英国快线 EUEXR (Yodel派送)
  {
    id: 'wanb_uk_euexr_1',
    country: '英国',
    company: 'WANB',
    channel: 'EUEXR',
    productType: 'general',
    timeRange: '4-6工作日',
    weightRange: '0-20',
    sizeLimit: '60*40*40cm',
    minBillableWeight: 0.3,
    pricePerKg: 47,
    registrationFee: 16,
    notes: '尾程Yodel',
    restrictions: ['不接受液体', '不接受纯电池'],
  },
  {
    id: 'wanb_uk_euexr_2',
    country: '英国',
    company: 'WANB',
    channel: 'EUEXR',
    productType: 'general',
    timeRange: '4-7工作日',
    weightRange: '0-21',
    sizeLimit: '60*40*40cm',
    minBillableWeight: 0.301,
    pricePerKg: 52,
    registrationFee: 16,
    notes: '尾程Yodel',
    restrictions: ['不接受液体', '不接受纯电池'],
  },
  {
    id: 'wanb_uk_euexr_3',
    country: '英国',
    company: 'WANB',
    channel: 'EUEXR',
    productType: 'general',
    timeRange: '4-8工作日',
    weightRange: '0-22',
    sizeLimit: '60*40*40cm',
    minBillableWeight: 1.001,
    pricePerKg: 56,
    registrationFee: 16,
    notes: '尾程Yodel',
    restrictions: ['不接受液体', '不接受纯电池'],
  },
  {
    id: 'wanb_uk_euexr_4',
    country: '英国',
    company: 'WANB',
    channel: 'EUEXR',
    productType: 'general',
    timeRange: '4-9工作日',
    weightRange: '0-23',
    sizeLimit: '60*40*40cm',
    minBillableWeight: 2.001,
    pricePerKg: 58,
    registrationFee: 16,
    notes: '尾程Yodel',
    restrictions: ['不接受液体', '不接受纯电池'],
  },
  // 英国快线 EUEXR (Evri派送)
  {
    id: 'wanb_uk_euexr_evri_1',
    country: '英国',
    company: 'WANB',
    channel: 'EUEXR',
    productType: 'general',
    timeRange: '4-10工作日',
    weightRange: '0-24',
    sizeLimit: '60*40*40cm',
    minBillableWeight: 0.3,
    pricePerKg: 47,
    registrationFee: 16,
    notes: '尾程Evri;偏远地区限重',
    restrictions: ['不接受液体', '不接受纯电池', '偏远地区限重'],
  },
  // 英国快线RM
  {
    id: 'wanb_uk_rm_1',
    country: '英国',
    company: 'WANB',
    channel: 'UKSLRRM',
    productType: 'general',
    timeRange: '4-6工作日',
    weightRange: '0-20',
    sizeLimit: '61*46*46cm',
    minBillableWeight: 0.3,
    pricePerKg: 57,
    registrationFee: 18,
    notes: '尾程RM;限重20KG',
    restrictions: ['不接受液体', '不接受纯电池', '最大20kg'],
  },
  // 美国专线价格表
  {
    id: 'wanb_us_1',
    country: '美国',
    company: 'WANB',
    channel: 'USEXR',
    productType: 'general',
    timeRange: '6-12工作日',
    weightRange: '0<W≤0.1',
    sizeLimit: '不限',
    minBillableWeight: 0.03,
    pricePerKg: 98,
    registrationFee: 24,
    notes: '支持普货',
    restrictions: ['不接受液体', '不接受纯电池'],
  },
  {
    id: 'wanb_us_2',
    country: '美国',
    company: 'WANB',
    channel: 'USEXR',
    productType: 'general',
    timeRange: '6-12工作日',
    weightRange: '0.1<W≤0.2',
    sizeLimit: '不限',
    minBillableWeight: 0.1,
    pricePerKg: 92,
    registrationFee: 22,
    notes: '支持普货',
    restrictions: ['不接受液体', '不接受纯电池'],
  },
  {
    id: 'wanb_us_3',
    country: '美国',
    company: 'WANB',
    channel: 'USEXR',
    productType: 'general',
    timeRange: '6-12工作日',
    weightRange: '0.7<W≤2',
    sizeLimit: '不限',
    minBillableWeight: 0.7,
    pricePerKg: 87,
    registrationFee: 13,
    notes: '支持普货',
    restrictions: ['不接受液体', '不接受纯电池'],
  },
  {
    id: 'wanb_us_4',
    country: '美国',
    company: 'WANB',
    channel: 'USEXR',
    productType: 'general',
    timeRange: '6-12工作日',
    weightRange: '2<W≤30',
    sizeLimit: '不限',
    minBillableWeight: 2,
    pricePerKg: 82,
    registrationFee: 13,
    notes: '支持普货',
    restrictions: ['不接受液体', '不接受纯电池'],
  },
]

// 报价计算引擎
export class QuotationEngine {
  // 解析重量范围
  private static parseWeightRange(range: string): { min: number; max: number } {
    // 处理不同格式的重量范围
    // "0-20" -> {min: 0, max: 20}
    // "0<W≤0.1" -> {min: 0, max: 0.1}
    // "2<W≤30" -> {min: 2, max: 30}

    if (range.includes('-')) {
      const [min, max] = range.split('-').map(Number)
      return { min, max }
    } else if (range.includes('<W≤')) {
      const parts = range.split('<W≤')
      const min = parts[0] ? Number(parts[0]) : 0
      const max = Number(parts[1])
      return { min, max }
    } else if (range.includes('<W<')) {
      const parts = range.split('<W<')
      const min = Number(parts[0])
      const max = Number(parts[1])
      return { min, max }
    }

    return { min: 0, max: 999 }
  }

  // 计算体积重
  static calculateVolumeWeight(
    length: number,
    width: number,
    height: number,
    divisor: number = 6000
  ): number {
    return (length * width * height) / divisor
  }

  // 获取计费重量
  static getBillableWeight(
    actualWeight: number,
    volumeWeight: number,
    minBillableWeight: number = 0
  ): number {
    const maxWeight = Math.max(actualWeight, volumeWeight)
    return Math.max(maxWeight, minBillableWeight)
  }

  // 匹配适用的运费规则
  static matchShippingRules(
    country: string,
    weight: number,
    company?: string,
    channel?: string,
    productType: string = 'general'
  ): ShippingRule[] {
    let rules = [...WANBPricingRules]

    // 按国家筛选
    if (country) {
      rules = rules.filter(r => r.country === country)
    }

    // 按公司筛选
    if (company) {
      rules = rules.filter(r => r.company === company)
    }

    // 按渠道筛选
    if (channel) {
      rules = rules.filter(r => r.channel === channel)
    }

    // 按产品类型筛选
    rules = rules.filter(r =>
      r.productType === productType || r.productType === 'general'
    )

    // 按重量筛选
    rules = rules.filter(r => {
      const range = this.parseWeightRange(r.weightRange)
      return weight > range.min && weight <= range.max
    })

    return rules
  }

  // 计算运费
  static calculateShippingCost(
    rule: ShippingRule,
    billableWeight: number
  ): {
    shippingFee: number // 运费
    registrationFee: number // 挂号费
    totalCost: number // 总费用
    unitPrice: number // 单价
  } {
    const shippingFee = billableWeight * rule.pricePerKg
    const registrationFee = rule.registrationFee
    const totalCost = shippingFee + registrationFee

    return {
      shippingFee: Math.round(shippingFee * 100) / 100,
      registrationFee,
      totalCost: Math.round(totalCost * 100) / 100,
      unitPrice: rule.pricePerKg,
    }
  }

  // 生成完整报价
  static generateQuotation(
    productInfo: {
      name: string
      weight: number
      length: number
      width: number
      height: number
      value: number
      quantity: number
      productType: string
    },
    shippingInfo: {
      country: string
      company: string
      channel: string
    }
  ) {
    // 计算体积重
    const volumeWeight = this.calculateVolumeWeight(
      productInfo.length,
      productInfo.width,
      productInfo.height
    )

    // 获取适用规则
    const rules = this.matchShippingRules(
      shippingInfo.country,
      productInfo.weight,
      shippingInfo.company,
      shippingInfo.channel,
      productInfo.productType
    )

    if (rules.length === 0) {
      throw new Error('没有找到适用的运费规则')
    }

    // 计算每个规则的报价
    const quotes = rules.map(rule => {
      const billableWeight = this.getBillableWeight(
        productInfo.weight,
        volumeWeight,
        rule.minBillableWeight
      )

      const cost = this.calculateShippingCost(rule, billableWeight)

      // 计算总成本
      const productCost = productInfo.value * productInfo.quantity
      const serviceFee = 1.2 * productInfo.quantity // 服务费
      const domesticShipping = 1 * productInfo.quantity // 国内运费
      const totalCost = productCost + serviceFee + domesticShipping + cost.totalCost

      return {
        rule,
        productInfo, // 添加产品信息
        actualWeight: productInfo.weight,
        volumeWeight: Math.round(volumeWeight * 100) / 100,
        billableWeight: Math.round(billableWeight * 100) / 100,
        shippingCost: cost,
        productCost,
        serviceFee,
        domesticShipping,
        totalCost: Math.round(totalCost * 100) / 100,
        timeRange: rule.timeRange,
        channel: rule.channel,
        company: rule.company,
        notes: rule.notes,
      }
    })

    return quotes
  }
}

// 导出万邦速达专用格式报价表
export function exportWANBQuotation(quotes: any[]): string {
  const headers = [
    '序号', '产品图片', '产品名称', '颜色', '每包件数', '包装尺寸',
    '毛重', '国家', '订单处理时间', '产品成本', '服务费',
    '国内运费', '国际运费', '关税', '快递运输时间', '总成本价'
  ]

  const rows = quotes.map((quote, index) => [
    index + 1,
    '-', // 产品图片
    quote.productInfo?.name || '产品',
    '-', // 颜色
    quote.productInfo?.quantity || 1,
    `${quote.productInfo?.length}*${quote.productInfo?.width}*${quote.productInfo?.height}cm`,
    `${quote.billableWeight}kg`,
    quote.rule.country,
    '24 HOURS',
    `$${quote.productCost}`,
    `$${quote.serviceFee}`,
    `$${quote.domesticShipping}`,
    `$${quote.shippingCost.totalCost}`,
    '$0',
    quote.timeRange,
    `$${quote.totalCost}`
  ])

  return [headers, ...rows]
    .map(row => row.join('\t'))
    .join('\n')
}