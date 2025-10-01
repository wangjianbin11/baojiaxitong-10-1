import { NextRequest, NextResponse } from 'next/server'
import { MultiBaseAirtableService } from '@/lib/airtable-multi'
import { DataTransformer } from '@/lib/airtable'

// OpenRouter AI 配置
const OPENROUTER_API_KEY = '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'
const OPENROUTER_MODEL = 'deepseek/deepseek-chat-v3-0324:free'

// 使用 AI 分析包裹特征并提供推荐理由
async function getAIRecommendation(packageInfo: any, topOptions: any[]) {
  try {
    const prompt = `作为一名国际物流专家，请根据以下包裹信息和可选渠道，提供专业的物流推荐分析：

包裹信息：
- 重量：${packageInfo.weight}kg
- 尺寸：${packageInfo.length}×${packageInfo.width}×${packageInfo.height}cm
- 体积重：${((packageInfo.length * packageInfo.width * packageInfo.height) / 6000).toFixed(2)}kg
- 货物类型：${packageInfo.cargoType === 'general' ? '普货' : packageInfo.cargoType === 'battery' ? '带电' : packageInfo.cargoType}
- 产品价值：${packageInfo.productValue || 0} ${packageInfo.productCurrency || 'USD'}

可选的前三个最佳渠道：
${topOptions.map((opt, i) => `${i + 1}. ${opt.channel.company} - ${opt.channel.channelName}
   目的地：${opt.channel.country}
   价格：$${opt.totalCost.toFixed(2)} (¥${opt.totalCostCNY.toFixed(2)})
   时效：${opt.channel.timeRange}天`).join('\n\n')}

请提供简洁的分析（不超过100字），说明：
1. 这个包裹的主要特征（体积重是否大于实重、是否适合空运等）
2. 为什么推荐第1个渠道作为最佳选择
3. 其他渠道的优劣势

要求：直接给出分析结果，不要有任何开场白或结束语。`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      console.error('AI 分析失败:', await response.text())
      return null
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || null
  } catch (error) {
    console.error('AI 分析出错:', error)
    return null
  }
}

// 智能推荐API - 根据包裹信息推荐最佳物流渠道
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packageInfo } = body

    // 验证必要的包裹信息
    if (!packageInfo?.weight || !packageInfo?.length || !packageInfo?.width || !packageInfo?.height) {
      return NextResponse.json(
        {
          success: false,
          error: '请输入完整的包裹信息（重量、长、宽、高）',
        },
        { status: 400 }
      )
    }

    console.log('开始智能推荐...')
    console.log('包裹信息:', {
      重量: packageInfo.weight + 'kg',
      尺寸: `${packageInfo.length}×${packageInfo.width}×${packageInfo.height}cm`,
      目的国家: packageInfo.country || '未指定',
      货物类型: packageInfo.cargoType || '普货'
    })

    // 获取所有渠道数据
    const allRecords = await MultiBaseAirtableService.getAllChannels()
    console.log(`共获取 ${allRecords.length} 条渠道数据`)

    // 第一步：按目的国家筛选（最重要的过滤条件）
    let filteredRecords = allRecords
    if (packageInfo.country) {
      filteredRecords = allRecords.filter(record => {
        const recordCountry = record.fields['国家/地区']
        return recordCountry === packageInfo.country
      })
      console.log(`按国家 "${packageInfo.country}" 筛选后: ${filteredRecords.length} 条`)
    }

    // 第二步：按货物类型筛选（横向对比所有支持该货物类型的渠道）
    if (packageInfo.cargoType) {
      const cargoType = packageInfo.cargoType
      filteredRecords = filteredRecords.filter(record => {
        const channelName = record.fields['渠道'] || ''

        // 带电货物：只匹配包含"带电"的渠道
        if (cargoType === 'battery' || cargoType === '带电') {
          return channelName.includes('带电') || channelName.includes('特货')
        }

        // 普货：匹配包含"普货"的渠道
        if (cargoType === 'general' || cargoType === '普货') {
          return channelName.includes('普货') || (!channelName.includes('带电') && !channelName.includes('特货'))
        }

        // 其他类型（液体、敏感货等）：暂时返回所有
        return true
      })
      console.log(`按货物类型 "${cargoType}" 筛选后: ${filteredRecords.length} 条`)
    }

    // 如果筛选后没有结果，返回友好提示
    if (filteredRecords.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          hasRecommendations: false,
          message: packageInfo.country
            ? `抱歉，暂无支持 ${packageInfo.country} 的 ${packageInfo.cargoType || '该类型'} 物流渠道`
            : '抱歉，没有找到适合该包裹的渠道'
        }
      })
    }

    // 计算筛选后渠道的运费
    const allQuotes: any[] = []

    for (const record of filteredRecords) {
      const result = DataTransformer.calculateShippingCost(packageInfo, record)
      if (result) {
        allQuotes.push(result)
      }
    }

    console.log(`成功计算 ${allQuotes.length} 个渠道的报价`)

    if (allQuotes.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          hasRecommendations: false,
          message: '抱歉,没有找到适合该包裹的渠道'
        }
      })
    }

    // 按价格排序找最便宜
    const cheapest = [...allQuotes].sort((a, b) => a.totalCost - b.totalCost)[0]

    // 按时效排序找最快
    const fastest = [...allQuotes].sort((a, b) => {
      const timeA = parseInt(a.channel?.timeRange?.split('-')[0]) || 999
      const timeB = parseInt(b.channel?.timeRange?.split('-')[0]) || 999
      return timeA - timeB
    })[0]

    // 综合推荐：性价比最高（价格适中且时效快）
    const recommended = [...allQuotes]
      .sort((a, b) => {
        // 计算性价比分数: 时效越短越好 + 价格越低越好
        const timeA = parseInt(a.channel?.timeRange?.split('-')[0]) || 999
        const timeB = parseInt(b.channel?.timeRange?.split('-')[0]) || 999
        const scoreA = (a.totalCost / 10) + timeA // 价格权重更高
        const scoreB = (b.totalCost / 10) + timeB
        return scoreA - scoreB
      })[0]

    // 获取 AI 分析（异步，不阻塞响应）
    const topThree = [recommended, cheapest, fastest].filter((v, i, a) =>
      a.findIndex(t => t.channel.id === v.channel.id) === i
    ).slice(0, 3)

    console.log('正在获取 AI 分析...')
    const aiAnalysis = await getAIRecommendation(packageInfo, topThree)
    console.log('AI 分析结果:', aiAnalysis)

    return NextResponse.json({
      success: true,
      data: {
        hasRecommendations: true,
        totalChannels: allQuotes.length,
        aiAnalysis: aiAnalysis,
        recommendations: {
          cheapest: {
            company: cheapest.channel.company,
            channel: cheapest.channel.channelName,
            country: cheapest.channel.country,
            price: `$${cheapest.totalCost.toFixed(2)}`,
            priceCNY: `¥${cheapest.totalCostCNY.toFixed(2)}`,
            time: cheapest.channel.timeRange,
            reason: '最便宜',
            savings: null
          },
          fastest: {
            company: fastest.channel.company,
            channel: fastest.channel.channelName,
            country: fastest.channel.country,
            price: `$${fastest.totalCost.toFixed(2)}`,
            priceCNY: `¥${fastest.totalCostCNY.toFixed(2)}`,
            time: fastest.channel.timeRange,
            reason: '最快送达',
            timeDays: parseInt(fastest.channel.timeRange.split('-')[0])
          },
          recommended: {
            company: recommended.channel.company,
            channel: recommended.channel.channelName,
            country: recommended.channel.country,
            price: `$${recommended.totalCost.toFixed(2)}`,
            priceCNY: `¥${recommended.totalCostCNY.toFixed(2)}`,
            time: recommended.channel.timeRange,
            reason: '综合推荐 (性价比最高)',
            badge: '推荐'
          }
        }
      }
    })

  } catch (error) {
    console.error('智能推荐错误:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '智能推荐失败',
      },
      { status: 500 }
    )
  }
}
