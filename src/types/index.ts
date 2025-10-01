// 包裹信息类型
export interface PackageInfo {
  country: string;           // 目的地国家
  weight: number;           // 包裹重量(KG)
  length: number;           // 长(CM)
  width: number;            // 宽(CM)
  height: number;           // 高(CM)
  cargoType: CargoType;     // 货物属性
  productValue: number;     // 产品价格
  productCurrency?: 'CNY' | 'USD';  // 产品价格货币
  exchangeRate?: number;    // 自定义汇率
  volumeFormula: VolumeFormula; // 体积重计算公式
  company?: string;         // 物流公司
  channelName?: string;     // 渠道名称
  transportType?: string;   // 运输方式
  productImage?: string;    // 产品图片（Base64编码）
}

// 货物类型
export type CargoType = 'general' | 'battery' | 'liquid' | 'sensitive';

// 体积重计算公式
export type VolumeFormula = '6000' | '8000';

// 物流渠道信息（基于真实数据库结构）
export interface ShippingChannel {
  id: string;
  channelName: string;      // 渠道名称（国家 + 分区）
  company: string;          // 物流公司
  transportType: string;    // 运输方式
  country: string;          // 目的地国家/地区
  zone?: string;            // 分区（如澳大利亚1-4区）
  restrictions: CargoType[]; // 支持的货物类型
  timeRange: string;        // 参考时效
  priceUSD: number;         // 美元价格（从人民币转换）
  priceEUR?: number;        // 欧元价格
  priceCNY: number;         // 人民币价格
  volumeCoefficient?: number; // 体积重系数
  minWeight: number;        // 最小重量
  maxWeight: number;        // 最大重量
  isRecommended?: boolean;  // 是否推荐
  notes?: string;           // 备注
  registrationFee: number;  // 挂号费
  increment: number;        // 进位制
  minimumChargeWeight: number; // 最低计费重量
}

// 搜索筛选条件
export interface SearchFilters {
  country?: string;
  zone?: string;
  channelName?: string;
  cargoType?: CargoType;
}

// 报价结果
export interface QuoteResult {
  channel: ShippingChannel;
  actualWeight: number;     // 实际重量
  volumeWeight: number;     // 体积重
  chargeWeight: number;     // 计费重量

  // 费用明细
  productCost?: number;          // 产品成本

  // 运费明细（人民币）
  internationalShippingCNY: number;  // 国际运费（人民币）
  domesticShippingCNY: number;        // 国内运费（人民币）
  serviceFeeCNY: number;              // 服务费（人民币）
  totalShippingCNY: number;           // 总运费（人民币）

  // 运费明细（美元）
  internationalShippingUSD: number;  // 国际运费（美元）
  domesticShippingUSD: number;        // 国内运费（美元）
  serviceFeeUSD: number;              // 服务费（美元）
  totalShippingUSD: number;           // 总运费（美元）

  // 单价和挂号费
  registrationFeeCNY: number;   // 挂号费（人民币）
  pricePerKgCNY: number;        // 单价（人民币/公斤）

  totalCost: number;        // 总费用（美元）
  totalCostCNY: number;     // 总费用（人民币）
  currency: string;         // 币种
  isRecommended?: boolean;  // 是否推荐
  isCheapest?: boolean;     // 是否最便宜
  isFastest?: boolean;      // 是否最快
}

// 导出格式
export type ExportFormat = 'excel' | 'csv' | 'pdf';

// 用户信息
export interface User {
  id: string;
  name: string;
  company: string;
  role: string;
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

// 基础数据类型
export interface BaseData {
  countries: string[];
  companies: string[];
  channels: string[];
  transportTypes: string[];
}

// 报价请求类型
export interface QuoteRequest {
  packageInfo: PackageInfo;
}

// 报价响应类型
export interface QuoteResponse {
  packageInfo: PackageInfo;
  results: QuoteResult[];
  count: number;
  summary: {
    cheapest?: QuoteResult;
    fastest?: QuoteResult;
    recommended?: QuoteResult;
  };
}