import { NextResponse } from 'next/server'
import { AirtableService } from '@/lib/airtable'

export async function GET() {
  try {
    console.log('开始测试 Airtable 连接...')

    // 测试获取所有渠道
    console.log('测试1: 获取所有渠道')
    const allChannels = await AirtableService.getAllChannels()
    console.log(`成功获取 ${allChannels.length} 个渠道`)

    // 测试获取基础数据
    console.log('测试2: 获取基础数据')
    const countries = await AirtableService.getAvailableCountries()
    const companies = await AirtableService.getAvailableCompanies()
    const channels = await AirtableService.getAvailableChannels()
    const transportTypes = await AirtableService.getAvailableTransportTypes()

    console.log(`国家数量: ${countries.length}`)
    console.log(`公司数量: ${companies.length}`)
    console.log(`渠道数量: ${channels.length}`)
    console.log(`运输方式数量: ${transportTypes.length}`)

    // 返回测试结果
    return NextResponse.json({
      success: true,
      message: 'Airtable 连接测试成功!',
      data: {
        totalChannels: allChannels.length,
        sampleChannel: allChannels[0] || null,
        baseData: {
          countries: countries.slice(0, 5), // 只返回前5个作为示例
          companies: companies.slice(0, 5),
          channels: channels.slice(0, 5),
          transportTypes: transportTypes.slice(0, 5),
        },
        environment: {
          hasApiKey: !!process.env.AIRTABLE_API_KEY,
          hasBaseId: !!process.env.AIRTABLE_BASE_ID,
          hasTableId: !!process.env.AIRTABLE_TABLE_ID,
        }
      }
    })

  } catch (error) {
    console.error('Airtable 连接测试失败:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Airtable 连接测试失败',
        error: error instanceof Error ? error.message : '未知错误',
        environment: {
          hasApiKey: !!process.env.AIRTABLE_API_KEY,
          hasBaseId: !!process.env.AIRTABLE_BASE_ID,
          hasTableId: !!process.env.AIRTABLE_TABLE_ID,
        }
      },
      { status: 500 }
    )
  }
}