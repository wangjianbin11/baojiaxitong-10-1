import { NextRequest, NextResponse } from 'next/server'
import { MultiBaseAirtableService } from '@/lib/airtable-multi'
import { getCompanyChannels, getAllCompanies as getAllCompaniesFromConfig } from '@/lib/airtable-bases'
import { logisticsCache, CacheKeys } from '@/lib/logistics-cache'

// 获取物流公司及其渠道的级联数据
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const company = searchParams.get('company')
    const channel = searchParams.get('channel')

    // 尝试从缓存获取数据库记录
    let allRecords = logisticsCache.get<any[]>(CacheKeys.allRecords())

    if (!allRecords) {
      // 如果缓存中没有，从所有Base获取数据
      allRecords = await MultiBaseAirtableService.getAllChannels()
      // 缓存5分钟
      logisticsCache.set(CacheKeys.allRecords(), allRecords, 5 * 60 * 1000)
      console.log(`从数据库获取到 ${allRecords.length} 条记录`)
    } else {
      console.log(`从缓存获取到 ${allRecords.length} 条记录`)
    }

    // 获取所有国家
    const allCountries = new Set<string>()
    const countryZones: Record<string, string[]> = {}

    allRecords.forEach(record => {
      const country = record.fields['国家/地区']
      if (country) {
        allCountries.add(country)
        const zone = record.fields['分区']
        if (zone) {
          if (!countryZones[country]) {
            countryZones[country] = []
          }
          if (!countryZones[country].includes(zone)) {
            countryZones[country].push(zone)
          }
        }
      }
    })

    const countriesArray = Array.from(allCountries)
    console.log(`找到 ${countriesArray.length} 个国家`)

    // 如果指定了公司和渠道，返回该渠道的国家
    if (company && channel) {
      console.log(`查询 ${company} - ${channel} 的国家`)

      // 尝试从缓存获取
      const cacheKey = CacheKeys.countries(company, channel)
      const cachedData = logisticsCache.get<any>(cacheKey)

      if (cachedData) {
        console.log('从缓存返回国家数据')
        return NextResponse.json(cachedData)
      }

      // 从Airtable直接获取该渠道的国家
      const channelCountries = await MultiBaseAirtableService.getCountriesForChannel(company, channel)
      console.log(`${company} - ${channel} 有 ${channelCountries.length} 个国家`)

      const responseData = {
        success: true,
        data: {
          company,
          channel,
          countries: channelCountries,
          zones: countryZones
        }
      }

      // 缓存结果
      logisticsCache.set(cacheKey, responseData, 5 * 60 * 1000)

      return NextResponse.json(responseData)
    }

    // 如果只指定了公司，返回该公司的渠道
    if (company && !channel) {
      console.log(`查询 ${company} 的渠道`)

      const channels = getCompanyChannels(company)

      return NextResponse.json({
        success: true,
        data: {
          company,
          channels
        }
      })
    }

    // 默认返回所有公司列表
    const companies = getAllCompaniesFromConfig()

    console.log(`返回 ${companies.length} 个物流公司`)
    console.log('物流公司列表:', companies)

    return NextResponse.json({
      success: true,
      data: {
        companies,
        totalCountries: countriesArray.length,
        totalRecords: allRecords.length
      }
    })

  } catch (error) {
    console.error('获取物流数据失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取物流数据失败',
      },
      { status: 500 }
    )
  }
}