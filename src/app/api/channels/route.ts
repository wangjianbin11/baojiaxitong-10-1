import { NextRequest, NextResponse } from 'next/server'
import { MultiBaseAirtableService } from '@/lib/airtable-multi'
import { DataTransformer } from '@/lib/airtable'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 获取查询参数
    const country = searchParams.get('country')
    const company = searchParams.get('company')
  // const transportType = searchParams.get('transportType')
  // const cargoType = searchParams.get('cargoType')

    let records

    // 获取所有渠道数据
    records = await MultiBaseAirtableService.getAllChannels()
    
    // 应用筛选条件
    if (country) {
      records = records.filter(record => record.fields['国家/地区'] === country)
    }
    if (company) {
      records = records.filter(record => record.fields['物流公司'] === company)
    }

    // 转换数据格式
    const channels = records.map(record =>
      DataTransformer.airtableToShippingChannel(record)
    )

    return NextResponse.json({
      success: true,
      data: channels,
      count: channels.length,
    })

  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取渠道数据失败',
      },
      { status: 500 }
    )
  }
}

export async function POST(_request: NextRequest) {
  try {
    // const body = await request.json()
    // const { filters } = body

    const records = await MultiBaseAirtableService.getAllChannels()
    const channels = records.map(record =>
      DataTransformer.airtableToShippingChannel(record)
    )

    return NextResponse.json({
      success: true,
      data: channels,
      count: channels.length,
    })

  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '筛选渠道数据失败',
      },
      { status: 500 }
    )
  }
}