import { NextRequest, NextResponse } from 'next/server'
import { MultiBaseAirtableService } from '@/lib/airtable-multi'
import { DataTransformer } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packageInfo } = body

    // 验证必要的包裹信息
    if (!packageInfo?.company || !packageInfo?.channelName || !packageInfo?.country ||
        !packageInfo?.weight || !packageInfo?.length || !packageInfo?.width || !packageInfo?.height) {
      console.log('收到的包裹信息:', packageInfo)
      return NextResponse.json(
        {
          success: false,
          error: '包裹信息不完整，请检查必填字段（物流公司、渠道、国家、重量、尺寸）',
        },
        { status: 400 }
      )
    }

    console.log(`开始为 ${packageInfo.company} - ${packageInfo.channelName} - ${packageInfo.country} 计算报价...`)
    console.log('包裹详情:', {
      重量: packageInfo.weight + 'kg',
      尺寸: `${packageInfo.length}×${packageInfo.width}×${packageInfo.height}cm`,
      产品价值: packageInfo.productValue
    })

    // 获取所有渠道数据
    const allRecords = await MultiBaseAirtableService.getAllChannels()

    // 根据物流公司、渠道和国家精确筛选
    const records = allRecords.filter(record =>
      record.fields['物流公司'] === packageInfo.company &&
      record.fields['渠道'] === packageInfo.channelName &&
      record.fields['国家/地区'] === packageInfo.country
    )

    console.log(`为国家 "${packageInfo.country}" 找到 ${records.length} 个渠道`)

    // 计算每个渠道的运费 - 使用新的正确算法
    const quoteResults = []
    for (const record of records) {
      // 直接传入record，让计算函数内部处理重量匹配
      const result = DataTransformer.calculateShippingCost(packageInfo, record)
      if (result) {
        console.log(`渠道 ${result.channel.channelName}: ¥${result.totalShippingCNY.toFixed(2)} (含挂号费¥${result.registrationFeeCNY})`)
        quoteResults.push(result)
      } else {
        // 如果没有结果，说明重量不在此区间
        const weightRange = record.fields['重量(KG)'] || ''
        const channelName = record.fields['分区']
          ? `${record.fields['国家/地区']} ${record.fields['分区']}`
          : record.fields['国家/地区']
        console.log(`渠道 ${channelName} 重量不符合: ${weightRange}`)
      }
    }

    // 按价格排序
    quoteResults.sort((a, b) => a.totalCost - b.totalCost)

    // 标记最便宜、最快、推荐的渠道
    if (quoteResults.length > 0) {
      // 最便宜
      quoteResults[0].isCheapest = true

      // 最快（根据时效字符串的第一个数字判断）
      const sortedByTime = [...quoteResults].sort((a, b) => {
        const timeA = parseInt(a.channel.timeRange.split('-')[0]) || 999
        const timeB = parseInt(b.channel.timeRange.split('-')[0]) || 999
        return timeA - timeB
      })
      const fastest = quoteResults.find(r => r.channel.id === sortedByTime[0].channel.id)
      if (fastest) fastest.isFastest = true

      // 推荐渠道（来自数据库的推荐标记）
      const recommended = quoteResults.find(r => r.channel.isRecommended)
      if (recommended) recommended.isRecommended = true
    }

    return NextResponse.json({
      success: true,
      data: {
        packageInfo,
        results: quoteResults,
        count: quoteResults.length,
        summary: {
          cheapest: quoteResults.find(r => r.isCheapest),
          fastest: quoteResults.find(r => r.isFastest),
          recommended: quoteResults.find(r => r.isRecommended),
        }
      }
    })

  } catch (error) {
    console.error('报价计算错误:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '报价计算失败',
      },
      { status: 500 }
    )
  }
}