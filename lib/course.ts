import type { Locale } from "@/lib/i18n/config";

export type CourseStep = {
  id: string;
  order: number;
  title: string;
  summary: string;
};

const courseMap: Record<Locale, CourseStep[]> = {
  en: [
    { id: "wallet-basics", order: 1, title: "Wallet Basics", summary: "Create and secure your first wallet." },
    { id: "first-transfer", order: 2, title: "First Transfer", summary: "Send and verify a small SOL transaction." },
    { id: "fee-model", order: 3, title: "Fees and confirmations", summary: "Understand fees, slots, and finality." },
    { id: "staking", order: 4, title: "Staking fundamentals", summary: "Learn validator delegation basics." },
    { id: "dapp-safety", order: 5, title: "DApp safety", summary: "Connect wallets safely and inspect permissions." },
    { id: "tooling", order: 6, title: "Core tools", summary: "Use explorer, docs, and community channels." },
    { id: "personal-plan", order: 7, title: "Personal learning plan", summary: "Build your ongoing weekly routine." },
  ],
  "zh-CN": [
    { id: "wallet-basics", order: 1, title: "钱包基础", summary: "创建并加固你的第一个钱包。" },
    { id: "first-transfer", order: 2, title: "第一笔转账", summary: "完成并核对一笔小额 SOL 交易。" },
    { id: "fee-model", order: 3, title: "手续费与确认", summary: "理解手续费、slot 与最终确认。" },
    { id: "staking", order: 4, title: "质押基础", summary: "掌握验证者委托的基本逻辑。" },
    { id: "dapp-safety", order: 5, title: "DApp 安全", summary: "安全连接钱包并检查授权范围。" },
    { id: "tooling", order: 6, title: "核心工具", summary: "学会使用浏览器、文档和社区渠道。" },
    { id: "personal-plan", order: 7, title: "个人学习计划", summary: "建立可持续的每周学习节奏。" },
  ],
};

export function getCourseSteps(locale: Locale) {
  return courseMap[locale];
}
