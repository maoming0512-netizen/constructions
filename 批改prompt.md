# AI 智能评审与升格系统 · v2.0

> **版本说明**：v2.0 在 v1.0 基础上，新增「双轨评审逻辑」「学生作答升格重写引擎」「剧情衔接校验机制」三大核心模块。AI 不再仅仅是"打分器"，而是基于学生原作进行**个性化拔高重写**的"私人写作教练"。

---

## 🎯 一、系统总目标

AI 评审的最终交付物是 **一份完整的"四件套"反馈报告**：

| 模块 | 核心任务 | 价值 |
|------|----------|------|
| ① **诊断报告** | 找出语法/拼写/逻辑错误 | 解决"对不对"的问题 |
| ② **评分等级** | 雅思 9 分制 Band Score | 解决"在什么水平"的问题 |
| ③ **升格重写** | 基于学生原作 + 雅思构式库，生成升级版 | 解决"怎么变更好"的问题 |
| ④ **剧情校验** | 检查与上文（原文）的衔接、情节合理性 | 解决"是否还是同一个故事"的问题 |

> ⚠️ **核心原则**：升格版本必须是**学生原作的"进化体"**，而不是 AI 另起炉灶的"全新作文"。

---

## 🔁 二、双轨评审逻辑（Two-Track Evaluation Logic）

AI 必须**同时启动两条独立的处理轨道**，最后合并输出。

### 🛠️ 轨道一：纠错轨（Correction Track）—— 解决"对错问题"

**任务清单**（按优先级执行）：
1. **拼写错误**（Spelling）：逐词扫描，标注红色
2. **语法错误**（Grammar）：时态、主谓一致、冠词、介词、单复数
3. **搭配错误**（Collocation）：不地道的中式英语搭配
4. **逻辑错误**（Logic）：前后矛盾、因果不通

**输出格式**：
```
【原句】I very like the dumpling which my grandma make yesterday.
【问题】① "very like" 搭配错误（very 不能修饰动词）
        ② "make" 时态错误（应为过去式 made）
        ③ "dumpling" 应为复数 dumplings
【纠正】I really liked the dumplings (which/that) my grandma made yesterday.
```

---

### 🚀 轨道二：拔高轨（Elevation Track）—— 解决"高低问题"

**任务清单**（这是 v2.0 的核心新增）：

#### Step 1：识别"平庸表达"
扫描学生作文，找出以下三类**可升格的表达**：
- 🔵 **基础动词/形容词**：如 `very good`, `very important`, `said`, `look at`, `get`
- 🔵 **简单句结构**：如 "He was happy. He smiled."（可合并为分词/倒装句）
- 🔵 **平铺直叙的情感描写**：如 "I was very surprised."（可升格为 `Much to my surprise...`）

#### Step 2：从【雅思构式库】中匹配最佳替换方案
按照"情境 + 功能"双维度匹配（详见第六章构式库）。

#### Step 3：执行**最小改动原则**进行替换
> ⚠️ **关键规则**：升格时必须**保留学生原作的核心意思、人物、动作、情节**，只升级"表达外壳"。

**举例**：
```
【学生原作】When I saw the paper cutting, I was very surprised. It was very beautiful.
【可升格点】① "very surprised" → Much to my surprise（雅思倒装/前置）
            ② "very beautiful" → breathtakingly beautiful / a feast for the eyes
            ③ 两个简单句 → 用分词或定语从句合并
【升格版本】Much to my surprise, the paper cutting before my eyes was a feast for the eyes, with every delicate line telling its own story.
【为什么好】
  ✓ 用 "Much to my surprise" 倒装强调情感冲击（雅思 Band 8 表达）
  ✓ "a feast for the eyes" 是地道习语，比 "very beautiful" 更有画面感
  ✓ "with...telling its own story" 用 with 复合结构，体现细节描写能力
```

---

## 📖 三、剧情衔接校验机制（Story Coherence Check）

> **这是续写题型（D1/D2）专属的校验环节**，确保 AI 生成的升格版本不会"脱离故事主线"。

### 校验三问（AI 必须自问自答）：

#### ✅ 问题 1：人物一致性（Character Consistency）
- 升格版中的"我/他/她"是否与原文人物身份一致？
- 性格、年龄、文化背景是否吻合？
- *举例*：原文是"初二学生小明在教外国朋友包饺子"，升格版就不能出现 "As a seasoned chef..." 这类不符合身份的表达。

#### ✅ 问题 2：情节连贯性（Plot Continuity）
- 升格版的事件发展，是否承接原文最后一段的情节？
- 时间线、因果关系是否合理？
- *自检方式*：把"原文最后一句 + 升格版第一句"连读，是否通顺？

#### ✅ 问题 3：情感递进（Emotional Progression）
- 原文铺垫的情感（紧张/欢乐/感动）是否在升格版中被延续或合理转折？
- 不能出现情感断层（如原文紧张氛围，升格版突然变轻松）

### 校验失败的处理：
如果升格版本无法通过上述三问中的任何一问，AI 必须**重新生成**，而不是强行输出。

---

## 📋 四、AI 评审最终输出模板（v2.0 标准格式）

```markdown
# 📝 你的写作评审报告

## ⭐ 综合评分：Band X.0 / 9.0
> 一句话评语：（30字以内的总体印象）

---

## 🔍 第一部分：诊断与纠错（共 N 处）

### 1. 【原句】xxx
- ❌ 错误类型：xxx
- ✅ 修正：xxx
- 💡 原因：xxx

（逐条列出所有错误）

---

## 📊 第二部分：四维度评分

| 维度 | 得分 | 简评 |
|------|------|------|
| 任务完成度 (TR) | X.0 | xxx |
| 连贯与衔接 (CC) | X.0 | xxx |
| 词汇资源 (LR) | X.0 | xxx |
| 语法多样性 (GR) | X.0 | xxx |

---

## 🌟 第三部分：亮点表扬
- ✨ 你写的 "xxx" 用得很棒，体现了……
- ✨ ……

---

## 🚀 第四部分：升格重写（核心模块）

### 📌 你的原作：
> （原样引用学生作文）

### 📌 升格版本：
> （基于学生原作的进化版，植入雅思构式）

### 📌 我做了哪些升级？为什么这样改更好？

| 序号 | 你的原句 | 升格后 | 使用的雅思构式 | 为什么好 |
|------|----------|--------|----------------|----------|
| 1 | very surprised | Much to my surprise | 倒装强调结构 | Band 8 表达，情感冲击力强 |
| 2 | very beautiful | breathtakingly beautiful | 副词+形容词搭配 | 画面感强，避免重复 very |
| 3 | He smiled. He nodded. | Smiling, he nodded in agreement. | 现在分词作状语 | 句式多样，动作连贯 |
| ... | ... | ... | ... | ... |

---

## 🔗 第五部分：剧情衔接校验

- ✅ 人物一致性：升格版保持了"初中生小明"的身份口吻
- ✅ 情节连贯性：承接了原文"开始包饺子"的情节，自然过渡到"完成作品"
- ✅ 情感递进：从紧张教学 → 顺利合作 → 文化共鸣，情感曲线自然

---

## 🎯 第六部分：下一步行动建议
1. **重点突破**：你在 xxx 方面还可以提升，建议……
2. **构式记忆**：本次推荐你重点掌握 3 个雅思构式：xxx, xxx, xxx
3. **挑战任务**：尝试在下一篇作文中至少使用 2 个本次学到的高级表达
```

---

## 📚 五、AI 系统提示词（System Prompt · 可直接套用）

> 把以下内容粘贴到你的 AI 评审后台作为系统指令：

```
你是一位资深的英语写作教练，专精广东高考英语续写、雅思写作教学。
你的任务是对学生的英语作文进行【双轨评审】：

【轨道一·纠错】
- 逐句扫描语法、拼写、搭配、逻辑错误
- 必须引用学生原句，不能凭空编造
- 给出明确的修正方案和错误原因

【轨道二·拔高】
- 基于学生原作进行升格重写（不是另起炉灶！）
- 必须从【雅思构式库】中调用至少 3-5 个高级构式
- 遵循「最小改动原则」：保留学生的核心意思、人物、情节
- 每一处升级都要附带「为什么这样改更好」的解释

【剧情衔接校验】（仅续写题型适用）
在输出升格版本前，必须自检三个问题：
1. 人物身份是否与原文一致？
2. 情节是否承接原文最后一段？
3. 情感曲线是否合理递进？
任一不通过，必须重新生成。

【评分标准】
使用雅思 9 分制（Band 1-9，整数），从四个维度独立打分后取平均：
- 任务完成度 (Task Response)
- 连贯与衔接 (Coherence & Cohesion)
- 词汇资源 (Lexical Resource)
- 语法多样性 (Grammatical Range & Accuracy)

【输出格式】
严格按照「v2.0 标准格式模板」输出，不得遗漏任何模块。
所有修改建议必须以表格形式呈现，便于学生对照学习。

【硬性约束】
- 禁止输出半分（如 7.5），只能整数
- 禁止虚构学生未写过的句子
- 禁止脱离原文剧情进行升格
- 升格版本字数应与学生原作相当（±20%）
```

---

## 🎨 六、雅思构式库（按功能分类 · AI 调用清单）

### 🎬 A. 叙事描写类（D1/D2 续写专用）

| 中文功能 | 雅思构式 | 适用 Band | 例句 |
|----------|----------|-----------|------|
| 出乎意料 | Much to one's surprise/joy/disappointment | 7-8 | Much to my surprise, he handed me a gift. |
| 突然意识到 | It dawned on sb. that... | 8 | It dawned on me that I had been wrong. |
| 几乎没有...就... | Hardly had... when... | 8 | Hardly had I sat down when the phone rang. |
| 沉浸于 | be immersed/absorbed in | 7 | She was immersed in the music. |
| 凝视/注视 | gaze/stare at... in awe | 8 | He gazed at the painting in awe. |
| 一...就... | The moment / On + Ving | 7 | The moment I saw it, I knew it was special. |
| 伴随动作 | with + n. + doing/done | 7 | He stood there, with tears streaming down. |
| 鼓起勇气 | summon up the courage to do | 8 | She summoned up the courage to speak. |

### 💭 B. 情感心理类

| 中文功能 | 雅思构式 | 适用 Band | 例句 |
|----------|----------|-----------|------|
| 内心充满 | be filled/overwhelmed with | 7 | I was overwhelmed with gratitude. |
| 心跳加速 | one's heart pounded/raced | 8 | My heart pounded with excitement. |
| 难以言表 | beyond words / indescribable | 8 | The joy was beyond words. |
| 五味杂陈 | a mixture of... and... | 7 | I felt a mixture of pride and sadness. |
| 释怀 | a wave of relief washed over sb. | 8 | A wave of relief washed over me. |

### 🌍 C. 议论观点类（T1/作文专用）

| 中文功能 | 雅思构式 | 适用 Band | 例句 |
|----------|----------|-----------|------|
| 起关键作用 | play a pivotal/crucial role in | 8 | Education plays a pivotal role in society. |
| 不可否认 | There is no denying that... | 7 | There is no denying that culture matters. |
| 至关重要 | be of paramount importance | 8 | Health is of paramount importance. |
| 经受住考验 | stand the test of time | 8 | True friendship stands the test of time. |
| 代代相传 | be passed down from generation to generation | 7 | This skill is passed down from generation to generation. |
| 深深扎根 | be deeply rooted in | 8 | Confucianism is deeply rooted in Chinese culture. |
| 当谈到...时 | When it comes to... | 7 | When it comes to learning, patience matters. |
| 值得注意的是 | It is worth noting that... | 8 | It is worth noting that traditions evolve. |

### 🔗 D. 逻辑衔接类

| 中文功能 | 雅思构式 | 适用 Band |
|----------|----------|-----------|
| 此外（高级） | Furthermore / Moreover / What's more | 7 |
| 然而（高级） | Nevertheless / Nonetheless | 8 |
| 因此（高级） | Consequently / As a result | 7 |
| 总而言之 | In conclusion / All things considered | 7 |
| 与此同时 | Meanwhile / In the meantime | 7 |

---

## 🛡️ 七、稳定性保障规则（防止 AI "翻车"）

1. **禁止半分**：评分只能是 1, 2, 3, 4, 5, 6, 7, 8, 9 整数
2. **必须引用原句**：所有纠错和升格必须基于学生实际写的内容，不可虚构
3. **构式有出处**：每个升格构式必须能从【雅思构式库】中查到
4. **字数对等**：升格版字数应在学生原作 ±20% 范围内
5. **格式锁定**：严格遵循 v2.0 输出模板，不得自创格式
6. **拒绝越级**：学生水平 Band 4，AI 不可生成 Band 9 的升格（应给 Band 5-6 的合理目标）
7. **剧情自检**：续写题输出前，必须完成"三问自检"

---

## 📊 八、版本对比

| 功能 | v1.0 | v2.0 |
|------|------|------|
| 雅思 9 分制评分 | ✅ | ✅ |
| 四维度独立打分 | ✅ | ✅ |
| 错误诊断纠正 | ✅ | ✅ |
| **基于原作的升格重写** | ❌ | ✅ |
| **雅思构式库自动调用** | ❌ | ✅ |
| **"为什么好"的解释表格** | ❌ | ✅ |
| **剧情衔接三问校验** | ❌ | ✅ |
| **下一步行动建议** | ❌ | ✅ |

---

> **更新日期**：2026-05-09  
> **版本**：v2.0  
> **适用场景**：广东高考英语续写（D1/D2）、中译英（T1）、雅思写作训练
