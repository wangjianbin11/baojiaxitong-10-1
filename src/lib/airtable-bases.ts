// 所有物流公司的Airtable Base配置
// 每个物流公司都有自己独立的Base和多个表(渠道)

export interface AirtableBaseConfig {
  company: string // 物流公司名称
  baseId: string // Airtable Base ID
  tables: {
    [channelName: string]: string // 渠道名称 -> Table ID
  }
}

// 所有物流公司的Base ID和渠道配置
export const LOGISTICS_BASES: AirtableBaseConfig[] = [
  {
    company: '云途物流',
    baseId: 'appur7ayCSYypothO',
    tables: {
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
  },
  {
    company: '浩源物流',
    baseId: 'appwOXc2f0bhQTR9m',
    tables: {
      '土耳其HY特惠普货专线': 'tbl1NsBnrQBvEGq29',
      '土耳其HY特惠带电专线': 'tblajsQKzQsJ4Q9Ym'
    }
  },
  {
    company: '万邦物流',
    baseId: 'appKtMeZXJ34LhR79',
    tables: {
      '万邦速达专线挂号普货': 'tbl1NsBnrQBvEGq29',
      '万邦速达专线挂号含电': 'tblTFYKUmqztho3IU'
    }
  },
  {
    company: '燕文物流',
    baseId: 'appJExpiR0BioJcpe',
    tables: {
      '普货渠道': 'tbl1NsBnrQBvEGq29',
      '带电渠道': 'tblQXa9nxhdJGx35i'
    }
  },
  {
    company: '邮政物流',
    baseId: 'app9Myd4WwCX100Th',
    tables: {
      'E 速宝': 'tbl1NsBnrQBvEGq29',
      '越洋宝美国空派普货-YSBBSKDG': 'tblQXa9nxhdJGx35i',
      '越洋宝英国空派普货-YSBDGGBP': 'tblItN4eGJjLoZw5d',
      '越洋宝英国空派特货-YSBDGGBT': 'tblbfDJxetGcpVASc',
      '越洋宝欧洲空派普货-YSBDGOMP': 'tblU6W3Kd47EFaraV',
      '越洋宝欧洲空派普货-YSBDGOMT': 'tblNi3DmbtXF2LSwM'
    }
  },
  {
    company: '4PX递四方物流',
    baseId: 'appBCcl0C9U1XBKzM',
    tables: {
      '工作表2': 'tbl1NsBnrQBvEGq29',
      '工作表2 2': 'tblQXa9nxhdJGx35i'
    }
  }
]

// 根据公司名称获取Base配置
export function getBaseConfig(company: string): AirtableBaseConfig | undefined {
  return LOGISTICS_BASES.find(base => base.company === company)
}

// 获取指定公司的所有渠道名称
export function getCompanyChannels(company: string): string[] {
  const config = getBaseConfig(company)
  return config ? Object.keys(config.tables) : []
}

// 获取指定公司和渠道的表ID
export function getTableId(company: string, channel: string): string | undefined {
  const config = getBaseConfig(company)
  return config?.tables[channel]
}

// 获取所有物流公司名称
export function getAllCompanies(): string[] {
  return LOGISTICS_BASES.map(base => base.company)
}
