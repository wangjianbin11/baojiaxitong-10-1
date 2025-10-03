import Airtable from 'airtable'

// 配置 Airtable
const airtableConfig = {
  apiKey: process.env.AIRTABLE_API_KEY!,
  baseId: process.env.AIRTABLE_BASE_ID!,
  tableId: process.env.AIRTABLE_TABLE_ID!,
}

// 初始化 Airtable
const base = new Airtable({
  apiKey: airtableConfig.apiKey,
}).base(airtableConfig.baseId)

// 云途物流9个渠道对应的表ID
export const YUNTU_CHANNEL_TABLES = {
  '特惠普货': 'tbl1NsBnrQBvEGq29',
  '特惠带电': 'tblQXa9nxhdJGx35i',
  '云途专线挂号标快普货': 'tblWEit1mv7qVE3qA',
  '云途专线挂号标快带电': 'tbld4OBdtIyaCPJoP',
  'A01特惠普货': 'tblOeBAkruhV0DCYh',
  'A01带电': 'tblEFX1KGvTqrg2Ue',
  '云途大货1800专线挂号（特惠带电）': 'tbllXDMjb9PWRyjWI',
  '云途大货1800专线挂号（特惠普货）': 'tbloPYA9ogi8VW1Uo',
  '云途全球化妆品类专线挂号': 'tblN708KcMSd6rni5'
}

// 获取表实例 - 默认使用第一个表
export const shippingTable = base(airtableConfig.tableId)

// Airtable 记录类型定义（基于真实数据结构）
export interface AirtableShippingRecord {
  id: string
  createdTime: string
  fields: {
    '国家/地区': string
    '参考时效': string
    '重量(KG)': string
    '运费(RMB/KG)': number
    '挂号费(RMB/票)': number
    '分区'?: string
    '进位制(KG)'?: number
    '最低计费重(KG)'?: number
    '物流公司'?: string
    '渠道'?: string
  }
}

// 数据库操作类
export class AirtableService {
  // 从指定表获取数据
  static async getChannelData(tableId: string, channelName: string): Promise<AirtableShippingRecord[]> {
    try {
      const table = base(tableId)
      const records = await table
        .select({
          sort: [{ field: '运费(RMB/KG)', direction: 'asc' }],
        })
        .all()

      return records.map(record => ({
        id: record.id,
        createdTime: (record as { createdTime?: string }).createdTime || new Date().toISOString(),
        fields: {
          ...record.fields,
          '物流公司': '云途物流',
          '渠道': channelName
        } as AirtableShippingRecord['fields'],
      }))
    } catch (error) {
      console.error(`获取渠道 ${channelName} 数据失败:`, error)
      return []
    }
  }

  // 获取所有云途渠道数据
  static async getAllYuntuChannels(): Promise<AirtableShippingRecord[]> {
    try {
      const allRecords: AirtableShippingRecord[] = []

      // 并行获取所有渠道的数据
      const promises = Object.entries(YUNTU_CHANNEL_TABLES).map(([channelName, tableId]) =>
        this.getChannelData(tableId, channelName)
      )

      const results = await Promise.all(promises)
      results.forEach(records => allRecords.push(...records))

      return allRecords
    } catch (error) {
      console.error('获取云途渠道数据失败:', error)
      throw new Error('无法获取云途渠道数据')
    }
  }

  // 获取所有渠道数据（兼容旧代码）
  static async getAllChannels(): Promise<AirtableShippingRecord[]> {
    return this.getAllYuntuChannels()
  }

  // 根据国家筛选渠道
  static async getChannelsByCountry(country: string): Promise<AirtableShippingRecord[]> {
    try {
      const allRecords = await this.getAllChannels()
      return allRecords.filter(record => record.fields['国家/地区'] === country)
    } catch (error) {
      console.error('根据国家筛选渠道失败:', error)
      throw new Error('筛选渠道数据失败')
    }
  }

  // 获取所有可用的国家列表
  static async getAvailableCountries(): Promise<string[]> {
    try {
      const records = await this.getAllChannels()
      const countries = new Set<string>()
      records.forEach(record => {
        const country = record.fields['国家/地区']
        if (country) countries.add(country)
      })
      return Array.from(countries).sort()
    } catch (error) {
      console.error('获取国家列表失败:', error)
      throw new Error('无法获取国家列表')
    }
  }

  // 获取所有可用的物流公司列表
  static async getAvailableCompanies(): Promise<string[]> {
    try {
      const records = await this.getAllChannels()
      const companies = new Set<string>()
      records.forEach(record => {
        const company = record.fields['物流公司']
        if (company) companies.add(company)
      })

      // 如果数据库中没有物流公司字段，使用默认值
      if (companies.size === 0) {
        return [
          '邮政物流',
          '万邦物流',
          '燕文物流',
          '云途物流',
          '浩源物流',
          '4PX 递四方物流'
        ]
      }

      return Array.from(companies).sort()
    } catch (error) {
      console.error('获取物流公司列表失败:', error)
      // 返回默认值
      return [
        '邮政物流',
        '万邦物流',
        '燕文物流',
        '云途物流',
        '浩源物流',
        '4PX 递四方物流'
      ]
    }
  }

  // 获取所有可用的渠道列表
  static async getAvailableChannels(): Promise<string[]> {
    try {
      const records = await this.getAllChannels()
      const channels = new Set<string>()
      records.forEach(record => {
        const channelName = record.fields['渠道']
        if (channelName) {
          channels.add(channelName)
        }
      })
      return Array.from(channels).sort()
    } catch (error) {
      console.error('获取渠道列表失败:', error)
      throw new Error('无法获取渠道列表')
    }
  }

  // 获取所有可用的运输方式列表
  static async getAvailableTransportTypes(): Promise<string[]> {
    // 返回空运和海运选项（目前数据库中都是空运）
    return ['空运', '海运']
  }
}

// 数据转换工具
export class DataTransformer {
  // 将 Airtable 记录转换为前端格式
  static airtableToShippingChannel(record: AirtableShippingRecord) {
    // 解析重量范围字符串，例如："0＜W≤30"
    const weightRange = record.fields['重量(KG)'] || ''
    const minWeight = DataTransformer.parseMinWeight(weightRange)
    const maxWeight = DataTransformer.parseMaxWeight(weightRange)

    // 将人民币转换为美元（汇率为7）
    const exchangeRate = 7
    const priceUSD = record.fields['运费(RMB/KG)'] / exchangeRate

    // 生成渠道名称（基于国家和分区）
    const channelName = record.fields['分区']
      ? `${record.fields['国家/地区']} ${record.fields['分区']}`
      : record.fields['国家/地区']

    return {
      id: record.id,
      channelName: channelName,
      country: record.fields['国家/地区'],
      zone: record.fields['分区'] || '',
      restrictions: ['general'], // 默认支持普货
      timeRange: record.fields['参考时效'],
      priceUSD: Math.round(priceUSD * 100) / 100,
      priceEUR: Math.round((priceUSD * 0.92) * 100) / 100, // 估算欧元价格
      priceCNY: record.fields['运费(RMB/KG)'],
      volumeCoefficient: 6000, // 默认使用6000
      minWeight: minWeight,
      maxWeight: maxWeight,
      isRecommended: false,
      notes: `挂号费: ¥${record.fields['挂号费(RMB/票)']}`,
      registrationFee: record.fields['挂号费(RMB/票)'],
      increment: record.fields['进位制(KG)'] || 0.1,
      minimumChargeWeight: record.fields['最低计费重(KG)'] || minWeight,
    }
  }

  // 解析最小重量
  static parseMinWeight(weightRange: string): number {
    // 例如："0＜W≤30" -> 0, "0.15＜W≤0.3" -> 0.15
    const match = weightRange.match(/([\d.]+)/)
    return match ? parseFloat(match[1]) : 0
  }

  // 解析最大重量
  static parseMaxWeight(weightRange: string): number {
    // 例如："0＜W≤30" -> 30, "0.15＜W≤0.3" -> 0.3
    const match = weightRange.match(/≤([\d.]+)/)
    return match ? parseFloat(match[1]) : 999
  }

  // 检查重量是否在范围内
  static isWeightInRange(weight: number, weightRange: string): boolean {
    const minWeight = DataTransformer.parseMinWeight(weightRange)
    const maxWeight = DataTransformer.parseMaxWeight(weightRange)
    return weight > minWeight && weight <= maxWeight
  }

  // 计算运费（基于真实数据库重量区间的正确算法）
  static calculateShippingCost(
    packageInfo: {
      weight: number
      length: number
      width: number
      height: number
      volumeFormula: '6000' | '8000'
      productValue?: number
      productCurrency?: 'CNY' | 'USD'
      exchangeRate?: number
    },
    record: AirtableShippingRecord
  ) {
    // 获取该记录的重量区间和价格信息
    const weightRange = record.fields['重量(KG)'] || ''
    const pricePerKgCNY = record.fields['运费(RMB/KG)'] || 0
    const registrationFeeCNY = record.fields['挂号费(RMB/票)'] || 0
    const minChargeWeight = (record.fields as Record<string, unknown>)['最低设备重(KG)'] as number || 0

    // 检查重量是否在此区间内
    if (!DataTransformer.isWeightInRange(packageInfo.weight, weightRange)) {
      return null // 重量不在此区间内
    }

    // 计算体积重（长×宽×高÷6000或8000）
    const volume = packageInfo.length * packageInfo.width * packageInfo.height
    const volumeDivisor = packageInfo.volumeFormula === '6000' ? 6000 : 8000
    const volumeWeight = volume / volumeDivisor

    // 计费重量取实际重量和体积重的较大值
    let chargeWeight = Math.max(packageInfo.weight, volumeWeight)

    // 应用最低计费重量
    if (minChargeWeight > 0) {
      chargeWeight = Math.max(chargeWeight, minChargeWeight)
    }

    // 应用进位制（如果有的话）
    const increment = record.fields['进位制(KG)'] || 0.01
    if (increment > 0) {
      chargeWeight = Math.ceil(chargeWeight / increment) * increment
    }

    // 🎯 正确的计算方式：重量 × 每公斤单价 + 挂号费
    const internationalShippingCNY = chargeWeight * pricePerKgCNY + registrationFeeCNY

    // 固定费用（美元）
    const serviceFeeUSD = 1.20  // 服务费 $1.20
    const domesticShippingUSD = 1.00  // 国内运费 $1.00

    // 转换为其他货币（汇率1:7）
    const exchangeRate = packageInfo.exchangeRate || 7
    const internationalShippingUSD = internationalShippingCNY / exchangeRate
    const serviceFeeCNY = serviceFeeUSD * exchangeRate
    const domesticShippingCNY = domesticShippingUSD * exchangeRate

    // 产品成本（如果提供的话）
    let productCostUSD = 0
    if (packageInfo.productValue) {
      if (packageInfo.productCurrency === 'CNY') {
        productCostUSD = packageInfo.productValue / exchangeRate
      } else {
        productCostUSD = packageInfo.productValue
      }
    }

    // 生成渠道信息 - 尝试从数据库获取物流公司和渠道信息
    const company = record.fields['物流公司'] || ''
    const channelCode = record.fields['渠道'] || ''

    // 如果有渠道代码，使用它；否则使用国家+分区
    let channelName = ''
    if (channelCode) {
      channelName = channelCode  // 例如：e优宝
    } else if (record.fields['分区']) {
      channelName = `${record.fields['国家/地区']} ${record.fields['分区']}`
    } else {
      channelName = record.fields['国家/地区']
    }

    const channel = {
      id: record.id,
      channelName: channelName,
      company: company || '未知物流公司',  // 添加物流公司字段
      transportType: '空运' as const,  // 数据库中都是空运
      country: record.fields['国家/地区'],
      zone: record.fields['分区'] || '',
      restrictions: ['general'],
      timeRange: record.fields['参考时效'],
      priceUSD: Math.round((pricePerKgCNY / exchangeRate) * 100) / 100,
      priceCNY: pricePerKgCNY,
      registrationFee: registrationFeeCNY,
      minWeight: DataTransformer.parseMinWeight(weightRange),
      maxWeight: DataTransformer.parseMaxWeight(weightRange),
      minimumChargeWeight: minChargeWeight,
      increment: increment,
      isRecommended: false,
      notes: `重量区间: ${weightRange}, 挂号费: ¥${registrationFeeCNY}`,
    }

    // 计算总的运费（国际运费 + 固定费用）
    const totalShippingCNY = internationalShippingCNY + serviceFeeCNY + domesticShippingCNY
    const totalShippingUSD = internationalShippingUSD + serviceFeeUSD + domesticShippingUSD

    return {
      channel,
      actualWeight: packageInfo.weight,
      volumeWeight: Math.round(volumeWeight * 100) / 100,
      chargeWeight: Math.round(chargeWeight * 100) / 100,

      // 详细的费用结构
      productCost: Math.round(productCostUSD * 100) / 100,

      // 运费明细（人民币）
      internationalShippingCNY: Math.round(internationalShippingCNY * 100) / 100,
      domesticShippingCNY: Math.round(domesticShippingCNY * 100) / 100,
      serviceFeeCNY: Math.round(serviceFeeCNY * 100) / 100,
      totalShippingCNY: Math.round(totalShippingCNY * 100) / 100,

      // 运费明细（美元）
      internationalShippingUSD: Math.round(internationalShippingUSD * 100) / 100,
      domesticShippingUSD: domesticShippingUSD,
      serviceFeeUSD: serviceFeeUSD,
      totalShippingUSD: Math.round(totalShippingUSD * 100) / 100,

      // 单价和挂号费
      registrationFeeCNY: registrationFeeCNY,
      pricePerKgCNY: pricePerKgCNY,

      // 总费用
      totalCost: Math.round((totalShippingUSD + productCostUSD) * 100) / 100,
      totalCostCNY: Math.round((totalShippingCNY + (packageInfo.productValue || 0) * (packageInfo.productCurrency === 'USD' ? exchangeRate : 1)) * 100) / 100,
      currency: 'USD' as const,
    }
  }
}