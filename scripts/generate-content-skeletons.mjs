import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

const COURSE_STEPS = [
  {
    slug: "01-wallet-basics",
    title: { en: "Wallet Basics", zh: "钱包基础" },
    description: {
      en: "Set up your first Solana wallet and protect your recovery phrase.",
      zh: "完成第一个 Solana 钱包配置并保护恢复短语。",
    },
    tags: ["wallet", "security", "onboarding"],
    glossary: ["wallet", "seed-phrase", "private-key"],
  },
  {
    slug: "02-transactions-fees",
    title: { en: "Transactions and Fees", zh: "交易与手续费" },
    description: {
      en: "Understand signing, confirmation, and fee behavior on Solana.",
      zh: "理解 Solana 的签名、确认流程与手续费行为。",
    },
    tags: ["transactions", "fees", "confirmation"],
    glossary: ["transaction", "signature", "blockhash"],
  },
  {
    slug: "03-staking-basics",
    title: { en: "Staking Basics", zh: "质押基础" },
    description: {
      en: "Learn delegation flow and how to evaluate validators.",
      zh: "学习委托流程以及如何评估验证者。",
    },
    tags: ["staking", "validators", "delegation"],
    glossary: ["stake", "delegation", "validator"],
  },
  {
    slug: "04-rpc-and-explorers",
    title: { en: "RPC and Explorers", zh: "RPC 与浏览器" },
    description: {
      en: "Use RPC endpoints and explorers to verify on-chain activity.",
      zh: "使用 RPC 节点和浏览器核对链上活动。",
    },
    tags: ["rpc", "explorer", "verification"],
    glossary: ["rpc", "slot", "on-chain"],
  },
  {
    slug: "05-defi-safety",
    title: { en: "DeFi Safety", zh: "DeFi 安全" },
    description: {
      en: "Identify common risk patterns before using DeFi protocols.",
      zh: "在使用 DeFi 协议前识别常见风险模式。",
    },
    tags: ["defi", "risk", "safety"],
    glossary: ["defi", "slippage", "liquidity-pool"],
  },
  {
    slug: "06-solana-ecosystem-tools",
    title: { en: "Solana Ecosystem Tools", zh: "Solana 生态工具" },
    description: {
      en: "Build a practical toolkit for daily learning and troubleshooting.",
      zh: "建立用于日常学习与排错的实用工具集合。",
    },
    tags: ["tooling", "ecosystem", "workflow"],
    glossary: ["dapp", "node", "oracle"],
  },
  {
    slug: "07-nfts-next-steps",
    title: { en: "NFTs and Next Steps", zh: "NFT 与下一步" },
    description: {
      en: "Explore practical NFT use-cases and continue your learning path.",
      zh: "了解 NFT 的实用场景并规划后续学习路径。",
    },
    tags: ["nft", "roadmap", "next-steps"],
    glossary: ["nft", "mint", "whitelist"],
  },
];

const GLOSSARY_TERMS = [
  ["account", "Account", "账户"],
  ["address", "Address", "地址"],
  ["airdrop", "Airdrop", "空投"],
  ["amm", "AMM", "自动做市商"],
  ["apr", "APR", "年化利率"],
  ["apy", "APY", "年化收益率"],
  ["block", "Block", "区块"],
  ["blockhash", "Blockhash", "区块哈希"],
  ["burn", "Burn", "销毁"],
  ["cold-wallet", "Cold Wallet", "冷钱包"],
  ["consensus", "Consensus", "共识"],
  ["custody", "Custody", "托管"],
  ["dapp", "DApp", "去中心化应用"],
  ["defi", "DeFi", "去中心化金融"],
  ["delegation", "Delegation", "委托"],
  ["fee", "Fee", "手续费"],
  ["finality", "Finality", "最终确认"],
  ["gasless", "Gasless", "免 Gas"],
  ["hardware-wallet", "Hardware Wallet", "硬件钱包"],
  ["hot-wallet", "Hot Wallet", "热钱包"],
  ["liquidity", "Liquidity", "流动性"],
  ["liquidity-pool", "Liquidity Pool", "流动性池"],
  ["mainnet", "Mainnet", "主网"],
  ["memecoin", "Memecoin", "迷因币"],
  ["mint", "Mint", "铸造"],
  ["multisig", "Multisig", "多重签名"],
  ["nft", "NFT", "非同质化代币"],
  ["node", "Node", "节点"],
  ["nonce", "Nonce", "随机数"],
  ["on-chain", "On-chain", "链上"],
  ["oracle", "Oracle", "预言机"],
  ["orderbook", "Orderbook", "订单簿"],
  ["pda", "PDA", "程序派生地址"],
  ["private-key", "Private Key", "私钥"],
  ["public-key", "Public Key", "公钥"],
  ["rpc", "RPC", "远程过程调用"],
  ["seed-phrase", "Seed Phrase", "助记词"],
  ["signature", "Signature", "签名"],
  ["slot", "Slot", "时隙"],
  ["smart-contract", "Smart Contract", "智能合约"],
  ["stake", "Stake", "质押"],
  ["stablecoin", "Stablecoin", "稳定币"],
  ["testnet", "Testnet", "测试网"],
  ["token-account", "Token Account", "代币账户"],
  ["transaction", "Transaction", "交易"],
  ["validator", "Validator", "验证者"],
  ["vesting", "Vesting", "解锁"],
  ["wallet", "Wallet", "钱包"],
  ["whitelist", "Whitelist", "白名单"],
  ["slippage", "Slippage", "滑点"],
];

const LOCALES = ["en", "zh-CN"];

function yamlArray(values) {
  return values.map((v) => `  - "${v}"`).join("\n");
}

function courseBody(locale, step, nextSlug) {
  const placeholder = locale === "en" ? "Add concise bullet points here." : "在此补充精简要点。";
  const nextText = nextSlug ? `Continue to step ${step + 1} from /${locale}/course/${nextSlug}.` : "Course complete. Continue from /glossary.";
  return `## TL;DR\n\n- ${placeholder}\n- ${placeholder}\n\n## What you'll learn\n\n- ${placeholder}\n- ${placeholder}\n- ${placeholder}\n\n## Steps\n\n1. ${placeholder}\n2. ${placeholder}\n3. ${placeholder}\n\n## Common mistakes\n\n- ${placeholder}\n- ${placeholder}\n\n## Quick quiz\n\n1. ${placeholder}\n2. ${placeholder}\n\n## Glossary\n\n- ${placeholder}\n- ${placeholder}\n\n## Security note\n\n${placeholder}\n\n## Next up\n\n${nextText}\n`;
}

function glossaryBody(locale) {
  const placeholder = locale === "en" ? "Add short explanation." : "补充简短说明。";
  return `## Definition\n\n${placeholder}\n\n## Why it matters\n\n${placeholder}\n\n## Common pitfalls\n\n- ${placeholder}\n- ${placeholder}\n\n## Safety note\n\n${placeholder}\n\n## See also\n\n- ${placeholder}\n- ${placeholder}\n`;
}

function courseFrontmatter(locale, entry, index) {
  const next = COURSE_STEPS[index + 1];
  const nextSlug = next ? next.slug : "";
  const nextLink = next ? `/course/${nextSlug}` : "/glossary";

  return `---\ntype: "course"\nlocale: "${locale}"\ntitle: "${locale === "en" ? entry.title.en : entry.title.zh}"\ndescription: "${locale === "en" ? entry.description.en : entry.description.zh}"\nstep: ${index + 1}\nslug: "${entry.slug}"\nnext: "${nextSlug}"\nnextLink: "${nextLink}"\nrouteHint: "${nextLink}"\ntags:\n${yamlArray(entry.tags)}\nglossary:\n${yamlArray(entry.glossary)}\n---\n`;
}

function glossaryFrontmatter(locale, term, i) {
  const [slug, enTitle, zhTitle] = term;
  const relatedLessons = [COURSE_STEPS[i % COURSE_STEPS.length].slug, COURSE_STEPS[(i + 1) % COURSE_STEPS.length].slug];
  const relatedTerms = [
    GLOSSARY_TERMS[(i + 1) % GLOSSARY_TERMS.length][0],
    GLOSSARY_TERMS[(i + 2) % GLOSSARY_TERMS.length][0],
  ];

  return `---\ntype: "glossary"\nlocale: "${locale}"\ntitle: "${locale === "en" ? enTitle : zhTitle}"\nslug: "${slug}"\ndescription: "${locale === "en" ? `${enTitle} concept skeleton.` : `${zhTitle} 词条骨架。`}"\nrelatedLessons:\n${yamlArray(relatedLessons)}\nrelatedTerms:\n${yamlArray(relatedTerms)}\n---\n`;
}

function courseIndexFrontmatter(locale) {
  return `---\ntype: "course_index"\nlocale: "${locale}"\ntitle: "${locale === "en" ? "7-Step Solana Course" : "7 步 Solana 课程"}"\ndescription: "${locale === "en" ? "Outline index for the beginner course." : "面向新手课程的大纲索引。"}"\n---\n`;
}

function glossaryIndexFrontmatter(locale) {
  return `---\ntype: "glossary_index"\nlocale: "${locale}"\ntitle: "${locale === "en" ? "Glossary" : "术语表"}"\ndescription: "${locale === "en" ? "Core vocabulary skeleton for Solana beginners." : "面向 Solana 新手的核心术语骨架。"}"\n---\n`;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeFile(filePath, content) {
  await fs.writeFile(filePath, content, "utf8");
}

async function generateLocale(locale) {
  const courseDir = path.join(ROOT, "content", locale, "course");
  const glossaryDir = path.join(ROOT, "content", locale, "glossary");

  await ensureDir(courseDir);
  await ensureDir(glossaryDir);

  const courseIndexBody = locale === "en"
    ? "## Course Outline\n\nUse this index to draft each lesson before filling full explanations."
    : "## 课程大纲\n\n先用本索引搭建每课结构，再补充完整解释。";

  await writeFile(path.join(courseDir, "_index.mdx"), `${courseIndexFrontmatter(locale)}\n${courseIndexBody}\n`);

  for (let i = 0; i < COURSE_STEPS.length; i += 1) {
    const entry = COURSE_STEPS[i];
    const nextSlug = COURSE_STEPS[i + 1]?.slug || "";
    const mdx = `${courseFrontmatter(locale, entry, i)}\n${courseBody(locale, i + 1, nextSlug)}\n`;
    await writeFile(path.join(courseDir, `${entry.slug}.mdx`), mdx);
  }

  const glossaryIndexBody = locale === "en"
    ? "## Glossary Index\n\nDraft concise definitions before adding deep examples."
    : "## 术语索引\n\n先写简明定义，再补充深入示例。";

  await writeFile(path.join(glossaryDir, "_index.mdx"), `${glossaryIndexFrontmatter(locale)}\n${glossaryIndexBody}\n`);

  for (let i = 0; i < GLOSSARY_TERMS.length; i += 1) {
    const term = GLOSSARY_TERMS[i];
    const mdx = `${glossaryFrontmatter(locale, term, i)}\n${glossaryBody(locale)}\n`;
    await writeFile(path.join(glossaryDir, `${term[0]}.mdx`), mdx);
  }
}

async function main() {
  for (const locale of LOCALES) {
    await generateLocale(locale);
  }

  console.log("Generated course/glossary skeletons for en and zh-CN.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
