// 物流公司和渠道映射配置
// 由于数据库中没有直接的物流公司和渠道字段，我们基于国家和分区创建映射

export interface LogisticsMapping {
  company: string
  channels: {
    name: string
    countries: string[]
  }[]
}

// 定义物流公司和其渠道的映射关系
export const logisticsMappings: LogisticsMapping[] = [
  {
    company: '邮政物流',
    channels: [
      {
        name: 'e优宝',
        countries: ['美国', '英国', '法国', '意大利', '西班牙', '荷兰', '比利时']
      },
      {
        name: 'e速宝',
        countries: ['日本', '韩国', '新加坡', '马来西亚', '泰国', '菲律宾', '越南']
      },
      {
        name: '越洋宝',
        countries: ['澳大利亚', '新西兰', '加拿大']
      }
    ]
  },
  {
    company: '万邦物流',
    channels: [
      {
        name: '万邦欧洲专线',
        countries: ['德国', '丹麦', '瑞典', '挪威', '芬兰', '冰岛', '爱尔兰', '葡萄牙', '奥地利', '瑞士']
      },
      {
        name: '万邦美洲专线',
        countries: ['墨西哥', '巴西', '阿根廷', '智利', '秘鲁']
      }
    ]
  },
  {
    company: '燕文物流',
    channels: [
      {
        name: '燕文中东专线',
        countries: ['沙特', '阿联酋', '土耳其', '以色列', '卡塔尔', '科威特']
      },
      {
        name: '燕文东欧专线',
        countries: ['俄罗斯', '乌克兰', '波兰', '捷克', '匈牙利', '罗马尼亚']
      }
    ]
  },
  {
    company: '云途物流',
    channels: [
      {
        name: '特惠普货',
        countries: ['阿拉伯联合酋长国', '爱尔兰', '爱沙尼亚', '安哥拉', '奥地利', '澳大利亚', '巴林', '巴西', '保加利亚', '比利时', '波兰', '丹麦', '法国', '菲律宾', '芬兰', '韩国', '荷兰', '加拿大', '加纳', '捷克', '卡塔尔', '克罗地亚', '肯尼亚', '拉脱维亚', '立陶宛', '卢旺达', '马来西亚', '美国', '秘鲁', '摩洛哥', '墨西哥', '南非', '尼日利亚', '挪威', '葡萄牙', '日本', '瑞典', '瑞士', '沙特阿拉伯', '斯洛文尼亚', '泰国', '坦桑尼亚', '土耳其', '乌干达', '希腊', '新西兰', '以色列', '英国', '约旦']
      },
      {
        name: '特惠带电',
        countries: ['阿根廷', '阿拉伯联合酋长国', '埃及', '爱尔兰', '爱沙尼亚', '安哥拉', '奥地利', '澳大利亚', '巴基斯坦', '巴林', '巴西', '比利时', '波兰', '丹麦', '德国', '俄罗斯联邦', '厄瓜多尔', '法国', '菲律宾', '芬兰', '哥伦比亚', '荷兰', '加拿大', '加纳', '捷克', '克罗地亚', '肯尼亚', '拉脱维亚', '黎巴嫩', '立陶宛', '卢森堡', '罗马尼亚', '马耳他', '马来西亚', '美国', '秘鲁', '摩洛哥', '墨西哥', '南非', '尼日利亚', '葡萄牙', '日本', '瑞典', '瑞士', '萨尔瓦多', '沙特阿拉伯', '斯洛伐克', '斯洛文尼亚', '土耳其', '乌干达', '西班牙', '新西兰', '匈牙利', '以色列', '印度尼西亚', '英国', '越南']
      },
      {
        name: '云途专线挂号标快普货',
        countries: ['奥地利', '澳大利亚', '比利时', '波兰', '丹麦', '德国', '法国', '荷兰', '加拿大', '美国', '日本', '瑞典', '西班牙', '意大利', '英国']
      },
      {
        name: '云途专线挂号标快带电',
        countries: ['奥地利', '澳大利亚', '比利时', '波兰', '丹麦', '德国', '法国', '荷兰', '加拿大', '美国', '瑞典', '西班牙', '意大利', '英国']
      },
      {
        name: 'A01特惠普货',
        countries: ['美国']
      },
      {
        name: 'A01带电',
        countries: ['美国']
      },
      {
        name: '云途大货1800专线挂号（特惠带电）',
        countries: [] // 此渠道暂无国家数据
      },
      {
        name: '云途大货1800专线挂号（特惠普货）',
        countries: ['爱尔兰', '爱沙尼亚', '奥地利', '保加利亚', '比利时', '波兰', '丹麦', '德国', '法国', '芬兰', '荷兰', '捷克', '克罗地亚', '拉脱维亚', '立陶宛', '卢森堡', '罗马尼亚', '美国', '葡萄牙', '瑞典', '斯洛伐克', '斯洛文尼亚', '西班牙', '希腊', '匈牙利', '意大利', '英国']
      },
      {
        name: '云途全球化妆品类专线挂号',
        countries: ['阿拉伯联合酋长国', '爱尔兰', '爱沙尼亚', '奥地利', '澳大利亚', '巴林', '保加利亚', '比利时', '波兰', '丹麦', '德国', '法国', '芬兰', '荷兰', '加拿大', '捷克', '卡塔尔', '科威特', '克罗地亚', '拉脱维亚', '立陶宛', '卢森堡', '罗马尼亚', '美国', '墨西哥', '南非', '挪威', '葡萄牙', '日本', '瑞典', '瑞士', '沙特阿拉伯', '斯洛伐克', '斯洛文尼亚', '泰国', '西班牙', '希腊', '新加坡', '新西兰', '匈牙利', '以色列', '意大利', '英国']
      }
    ]
  },
  {
    company: '浩源物流',
    channels: [
      {
        name: '土耳其HY特惠普货专线',
        countries: ['土耳其']
      },
      {
        name: '土耳其HY特惠带电专线',
        countries: ['土耳其']
      }
    ]
  },
  {
    company: '4PX递四方物流',
    channels: [
      {
        name: '4PX全球优选',
        countries: [] // 将接收所有未分配的国家
      }
    ]
  }
]

// 根据国家获取对应的物流公司和渠道
export function getCompanyAndChannelByCountry(country: string): { company: string; channel: string } | null {
  for (const mapping of logisticsMappings) {
    for (const channel of mapping.channels) {
      if (channel.countries.includes(country)) {
        return {
          company: mapping.company,
          channel: channel.name
        }
      }
    }
  }

  // 如果没有找到特定映射，返回4PX全球优选
  return {
    company: '4PX递四方物流',
    channel: '4PX全球优选'
  }
}

// 获取所有物流公司
export function getAllCompanies(): string[] {
  return logisticsMappings.map(m => m.company)
}

// 获取指定公司的所有渠道
export function getChannelsByCompany(company: string): string[] {
  const mapping = logisticsMappings.find(m => m.company === company)
  return mapping ? mapping.channels.map(c => c.name) : []
}

// 获取指定公司和渠道的所有国家
export function getCountriesByCompanyAndChannel(company: string, channel: string): string[] {
  const mapping = logisticsMappings.find(m => m.company === company)
  if (!mapping) return []

  const channelData = mapping.channels.find(c => c.name === channel)
  if (!channelData) return []

  // 如果是4PX全球优选，返回所有未分配的国家
  if (company === '4PX递四方物流' && channel === '4PX全球优选') {
    // 这里需要从数据库获取所有国家，然后排除已分配的
    return [] // 将在API中处理
  }

  return channelData.countries
}