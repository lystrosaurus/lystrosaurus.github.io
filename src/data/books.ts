/**
 * 知识花园 / 书库 —— 数据单一真相源（由 scripts/knowledge-garden-agent.mjs 自动生成）。
 * 请勿手改；如需修改请运行 runner，或编辑后运行 npm run garden:validate。
 */
import type {
  Book,
  Category,
  GardenMeta,
  KnowledgePoint,
  LogEntry,
  Synthesis,
} from './books.types';

export function assertIntegrity(model) {
  const errors = [];
  const catIds = new Set(model.categories.map((c) => c.id));
  if (catIds.size !== model.categories.length) errors.push('分类 id 不唯一');
  const bookIds = new Set(model.books.map((b) => b.id));
  if (bookIds.size !== model.books.length) errors.push('书籍 id 不唯一');
  for (const b of model.books) {
    if (!catIds.has(b.category)) errors.push('书籍 ' + b.id + ' 的分类 ' + b.category + ' 不存在');
    for (const r of b.relatedBookIds) {
      if (!bookIds.has(r)) errors.push('书籍 ' + b.id + ' 的 relatedBookIds 含不存在的 id: ' + r);
    }
    if (b.extracted && (!b.knowledgePoints || b.knowledgePoints.length === 0)) {
      errors.push('书籍 ' + b.id + ' 标记为已榨取但缺少 knowledgePoints');
    }
  }
  for (const s of model.syntheses) {
    for (const bid of s.bookIds) {
      if (!bookIds.has(bid)) errors.push('复盘 ' + s.id + ' 的 bookIds 含不存在的 id: ' + bid);
    }
  }
  if (model.meta.bookCount !== model.books.length) {
    errors.push('meta.bookCount(' + model.meta.bookCount + ') !== books.length(' + model.books.length + ')');
  }
  if (errors.length) {
    throw new Error('[garden] 数据完整性校验失败:\n' + errors.join('\n'));
  }
}

export const categories: Category[] = [
  {
    "id": "ai",
    "name": "AI 与未来",
    "icon": "⚙",
    "desc": "理解智能的本质与技术在文明中的走向",
    "accent": "#a98b5a"
  },
  {
    "id": "bio",
    "name": "传记与思维史",
    "icon": "🎭",
    "desc": "在伟人与科学家的轨迹中看见思维演进",
    "accent": "#b9935a"
  },
  {
    "id": "classic",
    "name": "东方智慧",
    "icon": "☯",
    "desc": "从东方经典中提炼可践行的处世心法",
    "accent": "#cf9b6a"
  },
  {
    "id": "comm",
    "name": "沟通与表达",
    "icon": "💬",
    "desc": "让观点被听懂、被信任、被打动",
    "accent": "#d4b483"
  },
  {
    "id": "habits",
    "name": "习惯与效能",
    "icon": "⚡",
    "desc": "用系统与复利打造可持续的高效习惯",
    "accent": "#d9a05b"
  },
  {
    "id": "psychology",
    "name": "心理与行为",
    "icon": "🌱",
    "desc": "读懂动机、情绪与人类行为背后的机制",
    "accent": "#c98a5a"
  },
  {
    "id": "thinking",
    "name": "思维与认知",
    "icon": "🧠",
    "desc": "理解大脑如何思考、如何做更聪明的决策",
    "accent": "#c9954a"
  },
  {
    "id": "wealth",
    "name": "财富与投资",
    "icon": "💰",
    "desc": "建立可复制的财富认知与长期投资纪律",
    "accent": "#b8863f"
  }
];

export const books: Book[] = [
  {
    "id": "7-habits",
    "title": "高效能人士的七个习惯",
    "author": "Stephen Covey",
    "category": "habits",
    "year": 1989,
    "accent": "#d9a05b",
    "summary": "",
    "coreThesis": "",
    "knowledgePoints": [],
    "actionable": [],
    "quotes": [],
    "relatedBookIds": [
      "atomic-habits"
    ],
    "extracted": false,
    "extractedAt": null
  },
  {
    "id": "atomic-habits",
    "title": "原子习惯",
    "author": "James Clear",
    "category": "habits",
    "year": 2018,
    "accent": "#E17055",
    "summary": "不靠意志力，而靠系统的设计与身份的重构，让 1% 的微小改进在复利下累积成巨大改变。",
    "coreThesis": "你得到的不是你想要的，而是你反复做的。",
    "knowledgePoints": [
      {
        "concept": "1% 复利",
        "detail": "每天进步 1%，一年后会提升约 37 倍；每天退步 1%，一年后会趋近于零。习惯是复利，方向比强度更重要。",
        "level": "基础"
      },
      {
        "concept": "系统优于目标",
        "detail": "目标决定方向，系统决定进步。赢得冠军的人也常输掉比赛，但持续下注正确系统的人终会胜出。",
        "level": "基础"
      },
      {
        "concept": "环境设计",
        "detail": "让好习惯的触发显而易见（如把书放在床头），让坏习惯的阻力变大（如把零食锁起来）。环境比自律更可靠。",
        "level": "进阶"
      },
      {
        "concept": "四步行为模型",
        "detail": "提示 → 渴求 → 反应 → 奖赏。习惯养成要凸显提示、增强渴求、降低反应阻力、即时奖赏。",
        "level": "进阶"
      },
      {
        "concept": "身份导向",
        "detail": "不要问「我要达成什么目标」，而问「我想成为谁」。每个习惯都是为身份投票：你是「跑步者」而非「在跑步的人」。",
        "level": "心法"
      }
    ],
    "actionable": [
      "加入把目标身份视为常态的群体（如跑团），让身份被环境反复确认。",
      "建立习惯追踪，连续标记；错过一次是意外，错过两次是开始新习惯。",
      "设定「两分钟法则」：任何习惯先压缩到两分钟可执行，降低启动门槛。",
      "用「习惯叠加」把新习惯绑在旧习惯后：冥想 = 倒完咖啡后，立即冥想 1 分钟。"
    ],
    "quotes": [
      "每一个行动都是为你想成为的自己投下的一票。",
      "你不会改变目标，你会改变系统。",
      "你得到的不是你想要的，而是你反复做的。"
    ],
    "relatedBookIds": [
      "7-habits",
      "deep-work",
      "naval"
    ],
    "extracted": true,
    "extractedAt": "2026-07-26 09:00"
  },
  {
    "id": "courage-to-be-disliked",
    "title": "被讨厌的勇气",
    "author": "岸见一郎 / 古贺史健",
    "category": "psychology",
    "year": 2013,
    "accent": "#c98a5a",
    "summary": "",
    "coreThesis": "",
    "knowledgePoints": [],
    "actionable": [],
    "quotes": [],
    "relatedBookIds": [],
    "extracted": false,
    "extractedAt": null
  },
  {
    "id": "daode",
    "title": "道德经",
    "author": "老子",
    "category": "classic",
    "year": -571,
    "accent": "#cf9b6a",
    "summary": "",
    "coreThesis": "",
    "knowledgePoints": [],
    "actionable": [],
    "quotes": [],
    "relatedBookIds": [],
    "extracted": false,
    "extractedAt": null
  },
  {
    "id": "deep-work",
    "title": "深度工作",
    "author": "Cal Newport",
    "category": "habits",
    "year": 2016,
    "accent": "#d9a05b",
    "summary": "",
    "coreThesis": "",
    "knowledgePoints": [],
    "actionable": [],
    "quotes": [],
    "relatedBookIds": [
      "atomic-habits"
    ],
    "extracted": false,
    "extractedAt": null
  },
  {
    "id": "deliberate",
    "title": "刻意练习",
    "author": "Anders Ericsson",
    "category": "bio",
    "year": 2016,
    "accent": "#b9935a",
    "summary": "",
    "coreThesis": "",
    "knowledgePoints": [],
    "actionable": [],
    "quotes": [],
    "relatedBookIds": [],
    "extracted": false,
    "extractedAt": null
  },
  {
    "id": "flow",
    "title": "心流",
    "author": "Mihaly Csikszentmihalyi",
    "category": "psychology",
    "year": 1990,
    "accent": "#c98a5a",
    "summary": "",
    "coreThesis": "",
    "knowledgePoints": [],
    "actionable": [],
    "quotes": [],
    "relatedBookIds": [],
    "extracted": false,
    "extractedAt": null
  },
  {
    "id": "hackers-painters",
    "title": "黑客与画家",
    "author": "Paul Graham",
    "category": "ai",
    "year": 2004,
    "accent": "#a98b5a",
    "summary": "",
    "coreThesis": "",
    "knowledgePoints": [],
    "actionable": [],
    "quotes": [],
    "relatedBookIds": [],
    "extracted": false,
    "extractedAt": null
  },
  {
    "id": "influence",
    "title": "影响力",
    "author": "Robert Cialdini",
    "category": "psychology",
    "year": 1984,
    "accent": "#c98a5a",
    "summary": "",
    "coreThesis": "",
    "knowledgePoints": [],
    "actionable": [],
    "quotes": [],
    "relatedBookIds": [
      "thinking-fast-slow"
    ],
    "extracted": false,
    "extractedAt": null
  },
  {
    "id": "intelligent-investor",
    "title": "聪明的投资者",
    "author": "Benjamin Graham",
    "category": "wealth",
    "year": 1949,
    "accent": "#b8863f",
    "summary": "",
    "coreThesis": "",
    "knowledgePoints": [],
    "actionable": [],
    "quotes": [],
    "relatedBookIds": [
      "poor-charlie"
    ],
    "extracted": false,
    "extractedAt": null
  },
  {
    "id": "jobs",
    "title": "史蒂夫·乔布斯传",
    "author": "Walter Isaacson",
    "category": "bio",
    "year": 2011,
    "accent": "#b9935a",
    "summary": "",
    "coreThesis": "",
    "knowledgePoints": [],
    "actionable": [],
    "quotes": [],
    "relatedBookIds": [],
    "extracted": false,
    "extractedAt": null
  },
  {
    "id": "life3",
    "title": "生命3.0",
    "author": "Max Tegmark",
    "category": "ai",
    "year": 2017,
    "accent": "#a98b5a",
    "summary": "",
    "coreThesis": "",
    "knowledgePoints": [],
    "actionable": [],
    "quotes": [],
    "relatedBookIds": [],
    "extracted": false,
    "extractedAt": null
  },
  {
    "id": "naval",
    "title": "纳瓦尔宝典",
    "author": "Naval Ravikant",
    "category": "wealth",
    "year": 2020,
    "accent": "#b8863f",
    "summary": "",
    "coreThesis": "",
    "knowledgePoints": [],
    "actionable": [],
    "quotes": [],
    "relatedBookIds": [
      "atomic-habits"
    ],
    "extracted": false,
    "extractedAt": null
  },
  {
    "id": "nonviolent",
    "title": "非暴力沟通",
    "author": "Marshall Rosenberg",
    "category": "comm",
    "year": 1999,
    "accent": "#d4b483",
    "summary": "",
    "coreThesis": "",
    "knowledgePoints": [],
    "actionable": [],
    "quotes": [],
    "relatedBookIds": [],
    "extracted": false,
    "extractedAt": null
  },
  {
    "id": "poor-charlie",
    "title": "穷查理宝典",
    "author": "Charlie Munger",
    "category": "thinking",
    "year": 2005,
    "accent": "#9a7b5b",
    "summary": "查理·芒格多元思维模型与逆向思考的集大成：用跨学科的格栅看清世界，以「反过来想，总是反过来想」规避愚蠢。",
    "coreThesis": "要变得聪明，先学会避免愚蠢——掌握多元思维模型，并永远反过来想。",
    "knowledgePoints": [
      {
        "concept": "多元思维模型",
        "detail": "单一学科像拿锤子的人看什么都像钉子。从数学、物理、生物、心理等多学科借工具，才能逼近真实。",
        "level": "基础"
      },
      {
        "concept": "逆向思考",
        "detail": "想知道如何成功，先研究怎样会失败并避开它。「反过来想，总是反过来想。」",
        "level": "基础"
      },
      {
        "concept": "能力圈",
        "detail": "重要的不是圈有多大，而是你清楚知道边界在哪里。只在能力圈内下重注。",
        "level": "进阶"
      },
      {
        "concept": "误判心理学",
        "detail": "芒格列出约 25 种人类认知偏差（激励导致的偏见、社会认同、嫉妒等），理解它们是防护自身判断的前提。",
        "level": "进阶"
      },
      {
        "concept": "坐等投资法",
        "detail": "绝大多数时间什么也不做，只在极少数的好机会出现时重仓出击——耐心本身就是一种策略。",
        "level": "心法"
      }
    ],
    "actionable": [
      "把「不加杠杆、不做不懂的事」列为不可逾越的底线。",
      "对重决定，先写「我可能在哪里错」，再决定下注大小。",
      "每个季度补充一个学科的核心模型（如复利、临界点、反馈回路）。",
      "遇到难题先列「怎样会搞砸」，把规避清单当作行动前提。"
    ],
    "quotes": [
      "得到一个结果最好的方式，是研究怎样会失去它。",
      "反过来想，总是反过来想。",
      "我的生活就是不断地避免愚蠢，而非追求高明。"
    ],
    "relatedBookIds": [
      "intelligent-investor",
      "principles",
      "thinking-fast-slow"
    ],
    "extracted": true,
    "extractedAt": "2026-07-26 09:10"
  },
  {
    "id": "principles",
    "title": "原则",
    "author": "Ray Dalio",
    "category": "thinking",
    "year": 2017,
    "accent": "#c9954a",
    "summary": "",
    "coreThesis": "",
    "knowledgePoints": [],
    "actionable": [],
    "quotes": [],
    "relatedBookIds": [
      "poor-charlie",
      "thinking-fast-slow"
    ],
    "extracted": false,
    "extractedAt": null
  },
  {
    "id": "pyramid",
    "title": "金字塔原理",
    "author": "Barbara Minto",
    "category": "comm",
    "year": 1996,
    "accent": "#d4b483",
    "summary": "",
    "coreThesis": "",
    "knowledgePoints": [],
    "actionable": [],
    "quotes": [],
    "relatedBookIds": [],
    "extracted": false,
    "extractedAt": null
  },
  {
    "id": "rich-dad-poor-dad",
    "title": "穷爸爸富爸爸",
    "author": "Robert Kiyosaki",
    "category": "wealth",
    "year": 1997,
    "accent": "#b8863f",
    "summary": "",
    "coreThesis": "",
    "knowledgePoints": [],
    "actionable": [],
    "quotes": [],
    "relatedBookIds": [],
    "extracted": false,
    "extractedAt": null
  },
  {
    "id": "story",
    "title": "故事",
    "author": "Robert McKee",
    "category": "comm",
    "year": 1997,
    "accent": "#d4b483",
    "summary": "",
    "coreThesis": "",
    "knowledgePoints": [],
    "actionable": [],
    "quotes": [],
    "relatedBookIds": [],
    "extracted": false,
    "extractedAt": null
  },
  {
    "id": "sunzi",
    "title": "孙子兵法",
    "author": "孙武",
    "category": "classic",
    "year": -512,
    "accent": "#cf9b6a",
    "summary": "",
    "coreThesis": "",
    "knowledgePoints": [],
    "actionable": [],
    "quotes": [],
    "relatedBookIds": [],
    "extracted": false,
    "extractedAt": null
  },
  {
    "id": "thinking-fast-slow",
    "title": "思考，快与慢",
    "author": "Daniel Kahneman",
    "category": "thinking",
    "year": 2011,
    "accent": "#5b8a9a",
    "summary": "揭示人类两套思维系统：直觉而快速的 System 1 与缓慢而理性的 System 2，并剖析我们在判断与决策中反复落入的认知偏差。",
    "coreThesis": "我们并非理性机器，而是被直觉与框架深刻塑造、且常常不自知的判断者。",
    "knowledgePoints": [
      {
        "concept": "启发式与偏差",
        "detail": "代表性启发、可得性启发、锚定效应等让我们在不确定性下快速但系统性地偏离理性。",
        "level": "基础"
      },
      {
        "concept": "系统一与系统二",
        "detail": "System 1 自动、快速、凭直觉；System 2 缓慢、费力、需主动。多数错误来自把难题误交给 System 1。",
        "level": "基础"
      },
      {
        "concept": "前景理论",
        "detail": "人对损失比对收益更敏感（损失厌恶），决策依参照点而非绝对值，解释了许多非理性选择。",
        "level": "进阶"
      },
      {
        "concept": "窄框架与宽框架",
        "detail": "孤立地看每个决策（窄框架）会放大波动与恐惧；把多决策合并审视（宽框架）能做出更稳健的选择。",
        "level": "进阶"
      },
      {
        "concept": "认知谦逊",
        "detail": "明确区分「所知」与「未知」，对直觉结论保持怀疑，必要时强制启用 System 2 复核。",
        "level": "心法"
      }
    ],
    "actionable": [
      "把一系列小决策合并为年度复盘（宽框架），减少被单点波动支配。",
      "对「直觉很确信」的事，问一句：如果我是外行，这个把握还成立吗？",
      "对带数字的判断先设定外部基准（锚），再核对是否被随意锚点带偏。",
      "在重要决策前强制写下反方论证，抵消确认偏误。"
    ],
    "quotes": [
      "没有什么比一个好故事更能让我们误以为自己理解了世界。",
      "我们容易高估自己对世界的了解，却低估了事件中的随机性。"
    ],
    "relatedBookIds": [
      "influence",
      "poor-charlie",
      "principles"
    ],
    "extracted": true,
    "extractedAt": "2026-07-26 09:05"
  }
];

export const syntheses: Synthesis[] = [
  {
    "id": "synthesis-decision-thinking",
    "title": "更聪明的决策：认知偏差与多元模型",
    "theme": "思维与决策",
    "bookIds": [
      "thinking-fast-slow",
      "poor-charlie",
      "principles"
    ],
    "summary": "三本书共同指向一个结论：人类并非理性机器，但可以通过结构化方法减少系统性错误——卡尼曼揭示偏差，芒格提供多元模型与逆向法，达利欧把它工程化为可复用的原则。",
    "points": [
      "先承认 System 1 的不可靠，再强制启用 System 2 复核关键判断。",
      "用跨学科「思维格栅」替代单一学科视角，避免「手里只有锤子」。",
      "把反复验证有效的做法固化为书面原则，让决策可复制、可审计。",
      "重大决定先做「逆向清单」：列出会搞砸的路径并逐一规避。"
    ]
  }
];

export const agentLog: LogEntry[] = [
  {
    "time": "2026-07-26 12:15",
    "action": "关联",
    "detail": "Agent 周期：对称化相关书目、清理悬空引用、重算书目计数。"
  }
];

export const meta: GardenMeta = {
  "generatedAt": "2026-07-26 09:00",
  "lastReviewedAt": "2026-07-26 12:15",
  "agentVersion": "1.0.0",
  "bookCount": 21,
  "note": "初始种子：3 本完整示例 + 18 本目录条目。"
};

assertIntegrity({ categories, books, syntheses, agentLog, meta });
