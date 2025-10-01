// 物流公司配置
export const LOGISTICS_COMPANIES = {
  '燕文物流': {
    name: '燕文物流',
    code: 'YWWL',
    channels: ['普货渠道', '带电渠道'],
    prefix: ['YWWL']
  },
  '万邦物流': {
    name: '万邦物流',
    code: 'WBWL',
    channels: ['万邦速达专线挂号普货', '万邦速达专线挂号含电'],
    prefix: ['WBWL']
  },
  '邮政物流': {
    name: '邮政物流',
    code: 'YZWL',
    channels: [
      'E 速宝',
      '越洋宝美国空派普货-YSBBSKDG',
      '越洋宝英国空派普货-YSBDGGBP',
      '越洋宝英国空派特货-YSBDGGBT',
      '越洋宝欧洲空派普货-YSBDGOMP',
      '越洋宝欧洲空派普货-YSBDGOMT'
    ],
    prefix: ['YSBJTT', 'YSBJZP', 'YSBJDP', 'YSBDGI']
  },
  '云途物流': {
    name: '云途物流',
    code: 'YTWL',
    channels: [
      '特惠普货',
      '特惠带电',
      '云途专线挂号标快普货',
      '云途专线挂号标快带电',
      'A01特惠普货',
      'A01带电',
      '云途大货1800专线挂号（特惠带电）',
      '云途大货1800专线挂号（特惠普货）',
      '云途全球化妆品类专线挂号'
    ],
    prefix: ['YTWL']
  },
  '浩源物流': {
    name: '浩源物流',
    code: 'HYWL',
    channels: ['土耳其HY特惠普货专线', '土耳其HY特惠带电专线'],
    prefix: ['HYWL']
  },
  '4PX递四方物流': {
    name: '4PX递四方物流',
    code: '4PX',
    channels: ['工作表2', '工作表2 2'],
    prefix: ['4PX']
  }
}

// 获取物流公司列表
export function getLogisticsCompanies(): string[] {
  return Object.keys(LOGISTICS_COMPANIES)
}

// 根据产品代码判断所属物流公司
export function getCompanyByProductCode(productCode: string): string | null {
  for (const [company, config] of Object.entries(LOGISTICS_COMPANIES)) {
    if (config.prefix.some(prefix => productCode.startsWith(prefix))) {
      return company
    }
  }
  return null
}

// 获取物流公司的渠道
export function getCompanyChannels(company: string): string[] {
  return LOGISTICS_COMPANIES[company]?.channels || []
}

// 汇率配置
export const EXCHANGE_RATES = {
  CNY_TO_USD: 0.143,  // 人民币转美元 (1 RMB = 0.143 USD，1:7汇率)
  CNY_TO_EUR: 0.131,  // 人民币转欧元
}

// 运输方式
export const TRANSPORT_TYPES = [
  { value: 'air', label: '空运', description: '所有渠道均支持' },
  { value: 'sea', label: '海运', description: '部分渠道支持，时效较长' }
]