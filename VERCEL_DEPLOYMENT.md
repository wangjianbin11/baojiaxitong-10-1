# Vercel 部署指南

## 环境变量配置

在 Vercel 部署之前，需要在项目设置中配置以下环境变量：

### 必需的环境变量

1. **AIRTABLE_API_KEY**
   - 描述：Airtable API 密钥
   - 获取方式：登录 Airtable → Account → Generate API key
   - 示例：`keyXXXXXXXXXXXXXX`

2. **AIRTABLE_BASE_ID**
   - 描述：Airtable Base ID
   - 获取方式：在 Airtable Base URL 中获取
   - 示例：`appXXXXXXXXXXXXXX`

3. **AIRTABLE_TABLE_ID**
   - 描述：Airtable Table ID
   - 获取方式：在 Airtable Table URL 中获取
   - 示例：`tblXXXXXXXXXXXXXX`

### 可选的环境变量

4. **OPENAI_API_KEY**
   - 描述：OpenAI API 密钥（用于 AI 聊天功能）
   - 获取方式：OpenAI 官网注册获取
   - 示例：`sk-XXXXXXXXXXXXXXXXXXXXXXXX`

5. **JWT_SECRET**
   - 描述：JWT 签名密钥（用于用户认证）
   - 生成方式：可以使用随机字符串
   - 示例：`your-super-secret-jwt-key-here`

6. **NEXT_PUBLIC_APP_URL**
   - 描述：应用 URL（用于 CORS 配置）
   - 示例：`https://your-app.vercel.app`

## 在 Vercel 中配置环境变量

1. 登录 Vercel Dashboard
2. 选择你的项目
3. 进入 Settings → Environment Variables
4. 添加上述环境变量
5. 确保为 Production、Preview 和 Development 环境都添加了变量

## 部署步骤

1. 确保代码已推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 点击 Deploy

## 注意事项

- 如果没有配置 Airtable API 密钥，应用仍可正常构建和运行，但物流数据功能将不可用
- 建议在生产环境中配置所有必需的环境变量
- 环境变量更改后需要重新部署才能生效

## 故障排除

### 构建失败：Airtable API 密钥错误
- 检查 `AIRTABLE_API_KEY` 是否正确配置
- 确保 API 密钥有访问相应 Base 的权限

### 构建失败：环境变量未找到
- 确保所有必需的环境变量都已配置
- 检查环境变量名称是否正确（区分大小写）

### 运行时错误：Airtable 连接失败
- 检查网络连接
- 验证 API 密钥和 Base ID 是否正确
- 查看 Vercel 函数日志获取详细错误信息
