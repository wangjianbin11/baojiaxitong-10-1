import { NextRequest, NextResponse } from 'next/server'
import openai, { AI_MODEL, SYSTEM_PROMPT } from '@/lib/openai'
import { AirtableService, DataTransformer } from '@/lib/airtable'
import { knowledgeBase } from '@/lib/knowledgeBase'

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json(
        { success: false, error: '消息不能为空' },
        { status: 400 }
      )
    }

    // 搜索知识库
    const knowledgeResults = knowledgeBase.search(message)
    let knowledgeContext = ''
    if (knowledgeResults.length > 0) {
      knowledgeContext = '\n相关物流知识：\n' +
        knowledgeResults.slice(0, 2).map(item =>
          `【${item.category}】${item.question}\n答：${item.answer}`
        ).join('\n\n')
    }

    // 获取相关的物流数据作为上下文
    let contextData = ''
    let specificQuoteData = ''

    try {
      // 获取所有可用国家和基础信息
      const countries = await AirtableService.getAvailableCountries()

      contextData = `
当前系统真实数据：
- 支持的国家/地区: ${countries.length}个（${countries.slice(0, 8).join('、')}等）
- 服务类型: 国际邮政小包、DHL、UPS、FedEx、EMS等
- 重量范围: 0.1kg-30kg
- 计费方式: 按实际重量和体积重取大者
`

      // 检测用户询问的具体内容
      const countryKeywords = ['美国', '日本', '德国', '英国', '法国', '意大利', '加拿大', '澳大利亚', '新加坡', '韩国']
      const mentionedCountry = countryKeywords.find(country => message.includes(country))

      // 提取重量信息
      const weightMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:kg|公斤|千克|KG)/i)
      const weight = weightMatch ? parseFloat(weightMatch[1]) : null

      if (mentionedCountry) {
        const countryRecords = await AirtableService.getChannelsByCountry(mentionedCountry)

        if (countryRecords.length > 0) {
          specificQuoteData = `\n【${mentionedCountry}真实报价数据】\n`

          if (weight) {
            // 有具体重量，计算精确报价
            const packageInfo = {
              weight,
              length: 30,
              width: 20,
              height: 15,
              volumeFormula: '6000' as const
            }

            let validQuotes = 0
            countryRecords.forEach((record, index) => {
              if (index >= 5) return // 最多显示5个渠道

              const channel = DataTransformer.airtableToShippingChannel(record)
              const result = DataTransformer.calculateShippingCost(packageInfo, record)

              if (result) {
                validQuotes++
                specificQuoteData += `${validQuotes}. ${channel.channelName}\n`
                specificQuoteData += `   - 运费：¥${result.totalCostCNY.toFixed(2)}（$${result.totalCost.toFixed(2)}）\n`
                specificQuoteData += `   - 时效：${channel.timeRange}\n`
                specificQuoteData += `   - 计费重：${result.chargeWeight}kg\n`
                if (channel.notes) {
                  specificQuoteData += `   - 备注：${channel.notes}\n`
                }
              }
            })

            if (validQuotes === 0) {
              specificQuoteData += `${weight}kg超出该国家所有渠道的重量限制\n`
            }
          } else {
            // 没有具体重量，显示价格区间
            const priceRange = countryRecords.map(r => r.fields['运费(RMB/KG)'])
            specificQuoteData += `- 渠道数量：${countryRecords.length}个\n`
            specificQuoteData += `- 价格范围：¥${Math.min(...priceRange)}-${Math.max(...priceRange)}/kg\n`
            specificQuoteData += `- 参考时效：${countryRecords[0].fields['参考时效']}\n`

            // 显示前3个渠道的详细信息
            countryRecords.slice(0, 3).forEach((record, index) => {
              specificQuoteData += `\n${index + 1}. ${record.fields['国家/地区']}${record.fields['分区'] ? ' ' + record.fields['分区'] : ''}\n`
              specificQuoteData += `   - 单价：¥${record.fields['运费(RMB/KG)']}/kg\n`
              specificQuoteData += `   - 挂号费：¥${record.fields['挂号费(RMB/票)']}/票\n`
              specificQuoteData += `   - 重量范围：${record.fields['重量(KG)']}\n`
            })
          }
        }
      }

      // 如果询问支持的国家
      if (message.includes('哪些国家') || message.includes('支持') || message.includes('可以寄')) {
        contextData += `\n所有支持的国家/地区：\n${countries.join('、')}`
      }
    } catch (error) {
      console.warn('获取数据库信息失败:', error)
    }

    // 构建完整的系统提示
    const systemMessage = `${SYSTEM_PROMPT}

重要指示：
1. 你必须基于真实数据库数据回答，不要编造价格
2. 优先使用【真实报价数据】中的信息
3. 价格使用人民币（¥）为主，美元为辅
4. 回答要简洁、准确、专业
5. 如果有多个渠道，推荐性价比最高的

${contextData}
${specificQuoteData}
${knowledgeContext}

${context ? `用户当前页面上下文：${context}` : ''}`

    // 调用OpenRouter AI API
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 800,
      temperature: 0.5, // 降低温度以获得更准确的答案
    })

    const aiResponse = completion.choices[0]?.message?.content || '抱歉，我现在无法回答这个问题。'

    return NextResponse.json({
      success: true,
      data: {
        message: aiResponse,
        usage: completion.usage,
      }
    })

  } catch (error) {
    console.error('AI Chat API错误:', error)

    // 如果是OpenAI API相关错误，提供更友好的错误信息
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { success: false, error: 'AI API Key未配置，请联系管理员' },
          { status: 500 }
        )
      }
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { success: false, error: 'API额度不足，请稍后再试' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'AI助手暂时不可用，请稍后再试',
      },
      { status: 500 }
    )
  }
}