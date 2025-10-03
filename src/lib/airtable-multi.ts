import Airtable from 'airtable'
import { LOGISTICS_BASES, getBaseConfig } from './airtable-bases'

// Airtable 记录类型定义
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

// 字段名映射配置 - 将不同公司的字段名映射到统一字段名
const FIELD_MAPPINGS: Record<string, Record<string, string[]>> = {
  '云途物流': {
    '国家/地区': ['国家/地区'],
    '参考时效': ['参考时效'],
    '重量(KG)': ['重量(KG)'],
    '运费(RMB/KG)': ['运费(RMB/KG)'],
    '挂号费(RMB/票)': ['挂号费(RMB/票)'],
    '分区': ['分区'],
    '进位制(KG)': ['进位制(KG)'],
    '最低计费重(KG)': ['最低计费重(KG)']
  },
  '浩源物流': {
    '国家/地区': ['国家/地区'],
    '参考时效': ['参考时效'],
    '重量(KG)': ['重量段（KG）', '重量段(KG)'],
    '运费(RMB/KG)': ['公斤重（RMB/KG）', '公斤重(RMB/KG)'],
    '挂号费(RMB/票)': ['挂号费（RMB/票）', '挂号费(RMB/票)'],
    '分区': ['分区']
  },
  '万邦物流': {
    '国家/地区': ['国家', '国家/地区'],
    '参考时效': ['参考时效 （工作日）', '参考时效（工作日）', '参考时效'],
    '重量(KG)': ['重量段', '重量(KG)'],
    '运费(RMB/KG)': ['公斤重 （RMB/KG）', '公斤重（RMB/KG）', '公斤重(RMB/KG)', '运费(RMB/KG)'],
    '挂号费(RMB/票)': ['操作费 （RMB/PCS）', '操作费（RMB/PCS）', '操作费(RMB/PCS)', '挂号费(RMB/票)']
  },
  '燕文物流': {
    '国家/地区': ['国家/地区'],
    '参考时效': ['参考时效'],
    '重量(KG)': ['重量(KG)'],
    '运费(RMB/KG)': ['运费(RMB/KG)'],
    '挂号费(RMB/票)': ['挂号费(RMB/票)'],
    '分区': ['分区']
  },
  '邮政物流': {
    '国家/地区': ['国家/地区'],
    '参考时效': ['参考时效  （自然日）', '参考时效 （自然日）', '参考时效（自然日）', '参考时效'],
    '重量(KG)': ['起始重', '重量(KG)'], // 邮政使用起始重-终止重范围
    '运费(RMB/KG)': ['运费（元/KG）', '运费(元/KG)', '运费(RMB/KG)'],
    '挂号费(RMB/票)': ['处理费（元/件）', '处理费(元/件)', '挂号费(RMB/票)']
  },
  '4PX递四方物流': {
    '国家/地区': ['国家/地区', '国家'],
    '参考时效': ['参考时效'],
    '重量(KG)': ['重量(KG)', '重量段'],
    '运费(RMB/KG)': ['运费(RMB/KG)', '公斤重(RMB/KG)'],
    '挂号费(RMB/票)': ['挂号费(RMB/票)', '操作费(RMB/PCS)']
  }
}

// 字段值规范化函数
function normalizeFieldValue(company: string, targetField: string, rawFields: Record<string, unknown>): unknown {
  const mapping = FIELD_MAPPINGS[company]
  if (!mapping || !mapping[targetField]) {
    return rawFields[targetField]
  }

  // 尝试从多个可能的字段名中获取值
  for (const possibleField of mapping[targetField]) {
    if (rawFields[possibleField] !== undefined && rawFields[possibleField] !== null) {
      return rawFields[possibleField]
    }
  }

  return undefined
}

// 规范化记录字段
function normalizeRecord(company: string, rawRecord: { id: string; createdTime: string; fields: Record<string, unknown> }, channelName?: string): AirtableShippingRecord {
  const rawFields = rawRecord.fields

  return {
    id: rawRecord.id,
    createdTime: rawRecord.createdTime,
    fields: {
      '国家/地区': (normalizeFieldValue(company, '国家/地区', rawFields) as string) || '',
      '参考时效': (normalizeFieldValue(company, '参考时效', rawFields) as string) || '',
      '重量(KG)': (normalizeFieldValue(company, '重量(KG)', rawFields) as string) || '',
      '运费(RMB/KG)': (normalizeFieldValue(company, '运费(RMB/KG)', rawFields) as number) || 0,
      '挂号费(RMB/票)': (normalizeFieldValue(company, '挂号费(RMB/票)', rawFields) as number) || 0,
      '分区': (normalizeFieldValue(company, '分区', rawFields) as string) || undefined,
      '进位制(KG)': (normalizeFieldValue(company, '进位制(KG)', rawFields) as number) || (rawFields['进位制(KG)'] as number),
      '最低计费重(KG)': (normalizeFieldValue(company, '最低计费重(KG)', rawFields) as number) || (rawFields['最低计费重(KG)'] as number),
      '物流公司': company,
      '渠道': channelName || (rawFields['渠道'] as string) || ''
    }
  }
}

// 初始化 Airtable
const apiKey = process.env.AIRTABLE_API_KEY!

// 多Base Airtable服务
export class MultiBaseAirtableService {
  // 从指定Base和表获取数据
  static async getChannelData(
    baseId: string,
    tableId: string,
    company: string,
    channelName: string
  ): Promise<AirtableShippingRecord[]> {
    try {
      const base = new Airtable({ apiKey }).base(baseId)
      const table = base(tableId)

      const records = await table
        .select({
          // 不指定排序字段，因为不同公司字段名不同
        })
        .all()

      // 规范化每条记录，并添加公司和渠道信息
      return records.map(record => {
        const normalized = normalizeRecord(company, {
          id: record.id,
          createdTime: (record as { createdTime?: string }).createdTime || new Date().toISOString(),
          fields: record.fields
        }, channelName)
        return normalized
      })
    } catch (error) {
      console.error(`获取渠道 ${company} - ${channelName} 数据失败:`, error)
      return []
    }
  }

  // 获取指定公司的所有渠道数据
  static async getCompanyChannels(company: string): Promise<AirtableShippingRecord[]> {
    const config = getBaseConfig(company)
    if (!config) {
      console.error(`未找到 ${company} 的配置`)
      return []
    }

    const allRecords: AirtableShippingRecord[] = []

    // 并行获取该公司所有渠道的数据
    const promises = Object.entries(config.tables).map(([channelName, tableId]) =>
      this.getChannelData(config.baseId, tableId, company, channelName)
    )

    const results = await Promise.all(promises)
    results.forEach(records => allRecords.push(...records))

    console.log(`从 ${company} 获取了 ${allRecords.length} 条记录`)
    return allRecords
  }

  // 获取所有物流公司的所有渠道数据
  static async getAllChannels(): Promise<AirtableShippingRecord[]> {
    const allRecords: AirtableShippingRecord[] = []

    // 串行获取每个物流公司的数据(避免并发太多)
    for (const baseConfig of LOGISTICS_BASES) {
      const records = await this.getCompanyChannels(baseConfig.company)
      allRecords.push(...records)
    }

    console.log(`从所有物流公司共获取了 ${allRecords.length} 条记录`)
    return allRecords
  }

  // 获取指定公司和渠道的国家列表
  static async getCountriesForChannel(
    company: string,
    channel: string
  ): Promise<string[]> {
    const config = getBaseConfig(company)
    if (!config) return []

    const tableId = config.tables[channel]
    if (!tableId) return []

    const records = await this.getChannelData(
      config.baseId,
      tableId,
      company,
      channel
    )

    const countries = new Set<string>()
    records.forEach(record => {
      const country = record.fields['国家/地区']
      if (country) countries.add(country)
    })

    return Array.from(countries).sort()
  }

  // 获取所有可用的国家列表
  static async getAvailableCountries(): Promise<string[]> {
    const records = await this.getAllChannels()
    const countries = new Set<string>()

    records.forEach(record => {
      const country = record.fields['国家/地区']
      if (country) countries.add(country)
    })

    return Array.from(countries).sort()
  }

  // 根据国家筛选渠道
  static async getChannelsByCountry(country: string): Promise<AirtableShippingRecord[]> {
    const allRecords = await this.getAllChannels()
    return allRecords.filter(record => record.fields['国家/地区'] === country)
  }
}
