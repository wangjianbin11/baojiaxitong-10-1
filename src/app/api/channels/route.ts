import { NextRequest, NextResponse } from 'next/server'
import { AirtableService, DataTransformer } from '@/lib/airtable'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 获取查询参数
    const country = searchParams.get('country')
    const company = searchParams.get('company')
    const transportType = searchParams.get('transportType')
    const cargoType = searchParams.get('cargoType')

    let records

    // 根据是否有筛选条件选择不同的查询方法
    if (country || company || transportType || cargoType) {
      records = await AirtableService.getChannelsByFilters({
        country: country || undefined,
        company: company || undefined,
        transportType: transportType || undefined,
        cargoType: cargoType || undefined,
      })
    } else {
      records = await AirtableService.getAllChannels()
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filters } = body

    const records = await AirtableService.getChannelsByFilters(filters)
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