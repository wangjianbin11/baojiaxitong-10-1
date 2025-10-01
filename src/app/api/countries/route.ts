import { NextResponse } from 'next/server'
import { AirtableService } from '@/lib/airtable'

export async function GET() {
  try {
    const countries = await AirtableService.getAvailableCountries()
    const companies = await AirtableService.getAvailableCompanies()
    const channels = await AirtableService.getAvailableChannels()
    const transportTypes = await AirtableService.getAvailableTransportTypes()

    return NextResponse.json({
      success: true,
      data: {
        countries,
        companies,
        channels,
        transportTypes,
      },
    })

  } catch (error) {
    console.error('获取基础数据错误:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取基础数据失败',
      },
      { status: 500 }
    )
  }
}