import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { SankeyChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { loadAllData } from './data/dataLoader';

echarts.use([SankeyChart, TooltipComponent, CanvasRenderer]);

// Components
import Slide1Cover from './components/Charts/Slide1Cover';
import Slide0Background from './components/Charts/Slide0Background';
import Slide3MediaBias from './components/Charts/Slide3MediaBias';
import SlideSourceClass from './components/Charts/SlideSourceClass';
import SlideSourceNetwork from './components/Charts/SlideSourceNetwork';
import SlideStanceSpectrum from './components/Charts/SlideStanceSpectrum';
import Slide4Timeline from './components/Charts/Slide4Timeline';
import Slide5Network from './components/Charts/Slide5Network';
import Slide6Collapse from './components/Charts/Slide6Collapse';
import Slide6Countdown from './components/Charts/Slide6Countdown';
// Relationships and internal signals
import Slide6Heatmap from './components/Charts/Slide6Heatmap';
import Slide2Overview from './components/Charts/Slide2Overview';
import SlideTopicHeatmap from './components/Charts/SlideTopicHeatmap';
import SlideWordCompare from './components/Charts/SlideWordCompare';
import SlideMediaRadar from './components/Charts/SlideMediaRadar';
import SlideNetworkTransition from './components/Charts/SlideNetworkTransition';
import SlidePOKHistory from './components/Charts/SlidePOKHistory';
import Slide7Conclusion from './components/Charts/Slide7Conclusion';
import SlideMethodCompare from './components/Charts/SlideMethodCompare';

type NarrativeStep = {
  id: number | string;
  phase: string;
  title: string;
  question: string;
  text: React.ReactNode;
  takeaway: string;
};

type DataRow = Record<string, string | number | boolean | null | undefined>;

type AppData = {
  anchorEvents?: DataRow[];
  mediaStance?: DataRow[];
  emailNetwork?: DataRow[];
  networkNodes?: DataRow[];
  networkEdges?: DataRow[];
  timelineMaster?: DataRow[];
  sources?: DataRow[];
  entities?: DataRow[];
  emails?: DataRow[];
  employees?: DataRow[];
  sourceRelations?: DataRow[];
  wordFrequencies?: unknown;
};

const PanelFrame = ({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <div className="h-full w-full bg-[#F9F9F6] border border-[#E2E2E2] rounded-sm shadow-inner p-5 flex flex-col">
    <div className="mb-4">
      <div className="text-[11px] font-sans tracking-[0.24em] text-[#8B7355]">{eyebrow}</div>
      <h2 className="mt-1 text-[25px] font-serif font-bold text-[#111111]">{title}</h2>
      <p className="mt-1 text-sm font-sans text-[#6B7280]">{subtitle}</p>
    </div>
    <div className="min-h-0 flex-1">{children}</div>
  </div>
);

const FalseTruthOpeningPanel = ({ mediaStance, wordFrequencies }: Pick<AppData, 'mediaStance' | 'wordFrequencies'>) => (
  <div className="h-full w-full overflow-hidden border border-[#E2E2E2] bg-[#F5F2EB] shadow-inner p-6">
    <div className="h-full min-h-0 rounded-sm border border-[#D8D0C4] bg-[#F5F2EB] overflow-hidden">
      <Slide3MediaBias data={mediaStance || []} wordData={wordFrequencies} />
    </div>
  </div>
);

const SourceClassPanel = ({ sources }: Pick<AppData, 'sources'>) => (
  <PanelFrame
    eyebrow="信息来源"
    title="哪些新闻是一手资料，哪些只是转述？"
    subtitle="同样是新闻，原始报道、机构口径、聚合转载和国际衍生报道并不等价。先分清来源，才能判断哪些信息更接近现场。"
  >
    <SlideSourceClass sources={sources || []} />
  </PanelFrame>
);

const SourceNetworkPanel = ({ sourceRelations, sources }: Pick<AppData, 'sourceRelations' | 'sources'>) => (
  <PanelFrame
    eyebrow="信息来源"
    title="谁抄了谁：188 条转载链"
    subtitle="845 篇报道并非彼此独立，原始→衍生的传播关系构成一张信息漏斗。节点大小=文章数量，连线=衍生关系。"
  >
    <SlideSourceNetwork sourceRelations={sourceRelations || []} sources={sources || []} />
  </PanelFrame>
);

const StanceEvidencePanel = ({ mediaStance }: Pick<AppData, 'mediaStance'>) => (
  <PanelFrame
    eyebrow="媒体立场"
    title="谁被写成威胁，谁被写成受害者？"
    subtitle="立场光谱展示不同媒体如何呈现 POK、GAStech、Kronos 政府和污染事件。偏见不一定来自一句假话，也可能来自反复强调和反复忽略。"
  >
    <div className="grid h-full min-h-0 grid-cols-[1fr_240px] gap-4">
      <div className="min-h-0">
        <SlideStanceSpectrum data={mediaStance || []} />
      </div>
      <div className="flex min-h-0 flex-col gap-3">
        <div className="rounded-sm border border-[#E2DDD5] bg-white/75 p-4">
          <div className="text-[11px] font-sans font-bold tracking-[0.18em] text-[#8C3636]">偏见会出现在哪里</div>
          <div className="mt-3 space-y-3 font-sans text-[12px] leading-relaxed text-[#4A5568]">
            <div><span className="font-bold text-[#111111]">人物：</span>POK 成员常被贴上 criminal、terrorist、thugs 等标签。</div>
            <div><span className="font-bold text-[#111111]">地点：</span>Elodis 污染区更少被作为核心背景展开。</div>
            <div><span className="font-bold text-[#111111]">事件：</span>抗议、死亡和污染争议被弱化，绑架嫌疑被放大。</div>
          </div>
        </div>
        <div className="rounded-sm border border-[#8C3636]/30 bg-[#8C3636]/[0.05] p-4">
          <div className="text-[11px] font-sans font-bold tracking-[0.18em] text-[#8C3636]">这意味着</div>
          <div className="mt-2 font-serif text-[17px] font-bold leading-relaxed text-[#111111]">
            公众看到的"POK 是唯一凶手"，可能是新闻立场和传播声量共同塑造出的第一印象。
          </div>
        </div>
      </div>
    </div>
  </PanelFrame>
);

const DataOverviewPanel = ({ sources, entities, networkNodes, networkEdges, employees }: Pick<AppData, 'sources' | 'entities' | 'networkNodes' | 'networkEdges' | 'employees'>) => (
  <div className="h-full w-full">
    <Slide2Overview sources={sources} networkNodes={networkNodes} networkEdges={networkEdges} employees={employees} />
  </div>
);

const TopicHeatmapPanel = ({ sources }: Pick<AppData, 'sources'>) => (
  <PanelFrame
    eyebrow="主题分布"
    title="来源类型决定报道焦点"
    subtitle="不同类型的媒体关注的主题差异巨大——衍生媒体几乎不报环境议题"
  >
    <SlideTopicHeatmap sources={sources || []} />
  </PanelFrame>
);

const POKHistoryTimelinePanel = ({ anchorEvents }: Pick<AppData, 'anchorEvents'>) => (
  <SlidePOKHistory anchorEvents={anchorEvents} />
);

const ComplexRelationTransitionPanel = () => (
  <SlideNetworkTransition />
);

const SankeyPanel = ({ sources }: Pick<AppData, 'sources'>) => (
  <PanelFrame
    eyebrow="MEDIA BIAS"
    title="谁在定调：声量结构"
    subtitle="企业/政府口径和衍生媒体共同把 POK 推成最容易被相信的答案。看信息从哪里来，又流向哪里。"
  >
    <div className="grid h-full min-h-0 grid-cols-[1fr_230px] gap-4">
      <div className="min-h-0 rounded-sm border border-[#E2DDD5] bg-white/70">
        <MediaControlSankey sources={sources || []} />
      </div>
      <div className="flex min-h-0 flex-col gap-3">
        <div className="rounded-sm border border-[#E2DDD5] bg-white/75 p-4">
          <div className="text-[11px] font-sans font-bold tracking-[0.18em] text-[#8C3636]">先看这里</div>
          <div className="mt-2 font-serif text-[16px] font-bold leading-relaxed text-[#111111]">
            看信息从哪里来，又流向哪里：谁更容易影响公众第一印象。
          </div>
          <div className="mt-2 font-sans text-xs leading-relaxed text-[#6B7280]">
            这不是说每一篇新闻都在造假，而是提醒我们：传播结构本身会放大某些声音。
          </div>
        </div>
        <div className="rounded-sm border border-[#8C3636]/30 bg-[#8C3636]/[0.05] p-4">
          <div className="text-[11px] font-sans font-bold tracking-[0.18em] text-[#8C3636]">你会看到</div>
          <div className="mt-2 space-y-2 font-sans text-xs leading-relaxed text-[#4A5568]">
            <div>官方与主流报道拥有更大声量。</div>
            <div>污染和死亡背景更容易被淹没。</div>
            <div className="font-bold text-[#8C3636]">POK 很快变成公众最容易相信的答案。</div>
          </div>
        </div>
      </div>
    </div>
  </PanelFrame>
);

const WordComparePanel = ({ wordFrequencies }: Pick<AppData, 'wordFrequencies'>) => (
  <PanelFrame
    eyebrow="MEDIA BIAS"
    title="词汇武器：谁在用定罪语言？"
    subtitle="同一事件，亲建制媒体与独立媒体使用截然不同的词汇——criminal、terrorist、thugs 在亲建制媒体中出现频次远高于独立媒体。"
  >
    <SlideWordCompare wordData={wordFrequencies} />
  </PanelFrame>
);

const MediaRadarPanel = ({ sources }: Pick<AppData, 'sources'>) => (
  <PanelFrame
    eyebrow="媒体解剖"
    title="三家媒体，三种叙事"
    subtitle="Central Bulletin（亲建制）vs Homeland Illumination（独立）vs The Light of Truth（亲POK）"
  >
    <SlideMediaRadar sources={sources || []} />
  </PanelFrame>
);

/**
 * 媒体控制桑基图 — 数据全部来自 sources.csv，运行时动态计算。
 * 节点文章数 = sources.csv 各 source 的 article_count 汇总。
 * 流向值 = 源媒体文章数（表示信息从媒体流向衍生/公众）。
 * 若 sources 数据更新，图表自动反映最新数字，零硬编码。
 */
const MediaControlSankey = ({ sources }: { sources: DataRow[] }) => {
  // 从 sources 动态聚合
  const count = (name: string) => {
    const s = sources.find((r: DataRow) => String(r.source || '') === name);
    return s ? Number(s.article_count) || 0 : 0;
  };
  const derivTotal = sources
    .filter((r: DataRow) => String(r.source_type || '') === 'derivative_international')
    .reduce((sum: number, r: DataRow) => sum + (Number(r.article_count) || 0), 0);
  const derivCount = sources.filter((r: DataRow) => String(r.source_type || '') === 'derivative_international').length;
  // 独立/异见媒体 (Homeland + Athena + Light of Truth)
  const indepTotal = count('Homeland Illumination') + count('Athena Speaks') + count('The Light of Truth');

  const tnCount = count('Tethys News');
  const csCount = count('Centrum Sentinel');
  const cbCount = count('Central Bulletin');
  const ksCount = count('Kronos Star');

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: (params: { dataType?: string; data?: { source?: string; target?: string; value?: number }; name?: string }) => {
        if (params.dataType === 'edge') {
          return `${params.data?.source} → ${params.data?.target}<br/>${params.data?.value} 篇`;
        }
        return String(params.name || '').replace(/\n/g, '<br/>');
      },
    },
    series: [{
      type: 'sankey',
      layout: 'none',
      left: 20,
      right: 44,
      top: 24,
      bottom: 24,
      nodeWidth: 18,
      nodeGap: 12,
      draggable: false,
      lineStyle: {
        color: 'gradient',
        curveness: 0.5,
      },
      label: {
        show: true,
        fontSize: 11,
        color: '#333',
        fontFamily: '"Helvetica Neue", "Noto Serif SC", sans-serif',
        overflow: 'break' as const,
        lineHeight: 14,
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: { opacity: 0.8 },
      },
      data: [
        { name: 'GAStech / Tethys\n企业', itemStyle: { color: '#8C3636' } },
        { name: 'Kronos 政府', itemStyle: { color: '#526E4F' } },
        { name: `Tethys News\n${tnCount}篇`, itemStyle: { color: '#C0392B' } },
        { name: `Centrum Sentinel\n${csCount}篇`, itemStyle: { color: '#C0392B' } },
        { name: `Central Bulletin\n${cbCount}篇`, itemStyle: { color: '#27AE60' } },
        { name: `Kronos Star\n${ksCount}篇`, itemStyle: { color: '#27AE60' } },
        { name: `${derivCount}家国际衍生媒体\n${derivTotal}篇`, itemStyle: { color: '#D4C4A8' } },
        { name: `异见/独立媒体\n${indepTotal}篇`, itemStyle: { color: '#95A5A6' } },
      ],
      links: [
        { source: 'GAStech / Tethys\n企业', target: `Tethys News\n${tnCount}篇`, value: tnCount },
        { source: 'GAStech / Tethys\n企业', target: `Centrum Sentinel\n${csCount}篇`, value: csCount },
        { source: 'Kronos 政府', target: `Central Bulletin\n${cbCount}篇`, value: cbCount },
        { source: 'Kronos 政府', target: `Kronos Star\n${ksCount}篇`, value: ksCount },
        { source: `Tethys News\n${tnCount}篇`, target: `${derivCount}家国际衍生媒体\n${derivTotal}篇`, value: tnCount },
        { source: `Centrum Sentinel\n${csCount}篇`, target: `${derivCount}家国际衍生媒体\n${derivTotal}篇`, value: csCount },
        { source: `Central Bulletin\n${cbCount}篇`, target: `${derivCount}家国际衍生媒体\n${derivTotal}篇`, value: cbCount },
        { source: `Kronos Star\n${ksCount}篇`, target: `${derivCount}家国际衍生媒体\n${derivTotal}篇`, value: ksCount },
      ],
    }],
  };

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
};

const SecurityHeatmapPanel = ({ emails }: Pick<AppData, 'emails'>) => (
  <PanelFrame
    eyebrow="SECURITY SIGNALS"
    title="邮件热力图：安全话题在案发前升温"
    subtitle="先看时间信号：1 月 13 日之后，安保、VIP 访问和路线调整等邮件明显集中。"
  >
    <div className="grid h-full min-h-0 grid-cols-[1fr_230px] gap-4">
      <div className="min-h-0 overflow-hidden rounded-sm border border-[#E2DDD5] bg-white/45">
        <div className="border-b border-[#E2DDD5] px-4 py-2 text-[11px] font-sans font-bold tracking-[0.16em] text-[#8C3636]">
          邮件主题热力图
        </div>
        <div className="h-[calc(100%-34px)] min-h-0">
          <Slide6Heatmap data={emails} />
        </div>
      </div>
      <div className="flex min-h-0 flex-col gap-3">
        <div className="rounded-sm border border-[#E2DDD5] bg-white/75 p-4">
          <div className="text-[11px] font-sans font-bold tracking-[0.18em] text-[#8C3636]">先看这里</div>
          <div className="mt-2 font-serif text-[16px] font-bold leading-relaxed text-[#111111]">
            先看日期，再看主题：安全、接待和巡逻安排是否在案发前突然变密。
          </div>
          <div className="mt-2 font-sans text-xs leading-relaxed text-[#6B7280]">
            如果这些话题在案发前集中出现，就说明公司内部已经感到风险正在靠近。
          </div>
        </div>
        <div className="rounded-sm border border-[#E2DDD5] bg-[#FCFAF6] p-4">
          <div className="text-[11px] font-sans font-bold tracking-[0.18em] text-[#2C3E50]">重点留意</div>
          <div className="mt-3 space-y-2 font-sans text-xs text-[#555]">
            <div className="rounded-sm bg-white/80 px-3 py-2">Patrol schedule · 巡逻调整</div>
            <div className="rounded-sm bg-white/80 px-3 py-2">VIP visit · 政府接待准备</div>
            <div className="rounded-sm bg-white/80 px-3 py-2">Security procedures · 安保程序</div>
          </div>
        </div>
      </div>
    </div>
  </PanelFrame>
);

/**
 * Q4 面板：2014 vs 2026 方法论对比。
 * Q4 要求反思与 2014 年方法相比的变化，SlideMethodCompare 以左右对比卡片展示。
 */
const MethodComparePanel = () => (
  <PanelFrame
    eyebrow="方法论"
    title="如果 2014 年做了这个挑战，今年怎么做得更好？"
    subtitle="左侧为 2014 年典型分析工具链，右侧为本项目 2026 年的方法。交互探索、NLP 自动化、力导向网络和 Web 可视化让分析从静态报告升级为可探索的叙事体验。"
  >
    <SlideMethodCompare />
  </PanelFrame>
);

const FinalJudgmentPanel = () => (
  <Slide7Conclusion />
);

const narrativeSteps: NarrativeStep[] = [
  {
    id: 0,
    phase: '01 案件开场',
    title: '谁带走了 GAStech 高管？',
    question: '2014 年 1 月 20 日，政府接待前发生了什么？',
    text: 'GAStech 多名高管原本要前往 Kronos 政府接待活动，却在接待前集体失踪。官方与媒体很快把目光投向 POK。但当我们继续往下看，这个看似直接的答案开始变得不够完整。',
    takeaway: '这不是普通失踪案，而是发生在 IPO 余波、政府接待和安全压力交汇处的案件。',
  },
  {
    id: 1,
    phase: '02 错误真相',
    title: 'POK 就是真正的凶手？',
    question: '官方与媒体给出的第一答案是什么？',
    text: '案发后，POK 很快被推到舆论中心。criminal、terrorist、kidnapping 这些词不断出现，给公众留下一个强烈印象：POK 就是凶手。但这只是最先出现的答案，不一定是真相的全部。',
    takeaway: 'POK 被迅速塑造成最容易被相信的嫌疑对象。',
  },
  {
    id: 2,
    phase: '03 数据总览',
    title: '我们掌握了哪些数据？',
    question: '要穿透迷雾，先看手上有什么材料。',
    text: '我们没有盲信官方通报，而是收集了从 1993 年到 2014 年的 800 多篇新闻报道、数千封内部加密邮件以及完整的员工档案。新闻报道覆盖 29 个来源、4 种类型；员工档案还原了 GAStech 的组织结构；邮件记录揭示了案发前后的通信异常。三类数据互相印证，才有可能逼近更完整的真相。',
    takeaway: '三类数据各自揭示案件的一个切面，合在一起才能拼出更完整的图景。',
  },
  {
    id: 3,
    phase: '04 信息来源',
    title: '先分清：谁在报道，谁在转述？',
    question: '这些新闻资料来自哪里？',
    text: '原始资料包括本地一手报道，以及公司、政府或机构直接发布的口径；衍生资料则包括聚合转载和国际二次报道。衍生资料不是没有价值，但它们离现场更远，也更容易出现翻译偏差、措辞升级和立场偏移。',
    takeaway: '原始资料更接近事件现场，衍生资料更容易放大已有叙事。',
  },
  {
    id: 4,
    phase: '05 转载关系',
    title: '谁抄了谁：188 条转载链',
    question: '845 篇报道之间有什么传播关系？',
    text: '845 篇报道并非彼此独立。我们从数据中提取了 188 条原始→衍生的转载关系。中心是高产的原始报道源（如 News Online Today），外围是从属的衍生媒体。12 家国际衍生媒体几乎都从同一组本地原始报道衍生，形成了信息漏斗效应。',
    takeaway: '衍生报道放大的不只是信息，也包括已有叙事的偏差和措辞升级。',
  },
  {
    id: 5,
    phase: '06 主题分布',
    title: '来源类型决定报道焦点',
    question: '不同来源的媒体关注哪些主题？',
    text: '不同类型的媒体关注的主题也截然不同。本地一手媒体覆盖最全面（安全、商业、环境、抗议、绑架），机构口径集中在商业和安全领域，而 12 家国际衍生媒体几乎只转述安全和商业新闻——对环境议题的覆盖接近为零。这意味着 Elodis 污染真相在国际传播中几乎完全消失了。',
    takeaway: '衍生媒体不是没有价值，但它们离现场更远，更容易遗漏关键背景。',
  },
  {
    id: 6,
    phase: '07 媒体偏见',
    title: '新闻是在证明，还是在塑造嫌疑？',
    question: 'POK 为什么会这么快成为公众默认答案？',
    text: '当同一种说法被不断重复，公众很容易把"被怀疑"看成"已被证明"。亲政府和亲企业的声音更容易被看见，而污染争议、死亡事件和长期抗议背景则被压到后面。',
    takeaway: '新闻不只是传递信息，也可能影响公众先相信谁有罪。',
  },
  {
    id: 7,
    phase: '08 舆论定调',
    title: '谁拥有更大的声音？',
    question: '媒体偏见如何进入公众认知？',
    text: '立场偏向并不总是靠直接撒谎发生。更多时候，它来自谁被频繁引用、哪些词被反复使用、哪些背景被放到角落。企业、政府和衍生媒体的声量越大，POK 就越容易被看成唯一答案。',
    takeaway: '偏见会通过声量、措辞和选择性忽略进入公众判断。',
  },
  {
    id: 8,
    phase: '09 词汇武器',
    title: '同一事件，两套话术',
    question: '亲建制媒体与独立媒体使用哪些不同的词汇？',
    text: '以 criminals 为例：亲建制媒体报道中使用 12 次，独立媒体为 0 次。guards（31 vs 17）、kidnapping（23 vs 7）、thugs（4 vs 0）等定罪词汇在亲建制阵营中均以 2-4 倍的频率出现。词汇选择本身就在塑造"谁是罪犯"的公众认知。',
    takeaway: '措辞偏向会潜移默化地影响读者对事件的判断。',
  },
  {
    id: 9,
    phase: '10 媒体解剖',
    title: '三家媒体，三种叙事',
    question: '相同事件，不同立场的媒体如何报道？',
    text: '选三家有代表性的媒体来看：Central Bulletin（亲建制）几乎只报安全和商业，是官方立场的忠实放大器；Homeland Illumination（独立）均衡覆盖环境、抗议和安全，是信息最全面的来源；The Light of Truth（亲POK）则以商业和环境为主，关注 IPO 利益分配和污染真相。同一件事，三家媒体的报道重点完全不同。',
    takeaway: '新闻立场不只体现在措辞上，更体现在什么被报道、什么被忽略。',
  },
  {
    id: 10,
    phase: '11 四方关系',
    title: '从四方关系锁定重点嫌疑对象',
    question: 'GAStech、POK、APA 和政府之间有什么关系？',
    text: 'GAStech 与 Kronos 政府围绕能源开发、许可和接待活动形成公开合作；POK 与二者长期对立；APA 则作为区域安全力量，被卷入政府执法、POK 冲突和案发风险之中。这些关系说明 POK 为什么会被怀疑，也说明现场并不只有一个力量在行动。',
    takeaway: '官方关系指向政企合作，非官方关系则指向抗议、安保和区域冲突。',
  },
  {
    id: 11,
    phase: '12 POK 历史',
    title: '长期冲突如何走向绑架',
    question: 'POK 的动机从哪里来？',
    text: 'POK 的愤怒不是突然出现的。污染、抗议、死亡事件和政府强硬回应不断累积，让环保诉求一步步变成安全冲突。到绑架发生前，双方早已不是第一次对立。',
    takeaway: 'POK 有长期动机，但"有动机"不等于"唯一凶手"。',
  },
  {
    id: 12,
    phase: '13 利益冲突',
    title: '上层庆功，下层付代价',
    question: '长期冲突为什么会在 IPO 后变得危险？',
    text: '一边是 GAStech 财富增长、IPO 和高管收益；另一边是污染、死亡和抗议。两条线放在一起，就能看到同一场发展对不同人意味着完全不同的结果。',
    takeaway: '绑架背后不只有仇恨，也有财富、环境代价和不平等积累。',
  },
  {
    id: 13,
    phase: '14 邮件主题',
    title: 'IPO、VIP 与安保邮件的集中出现',
    question: '绑架前，公司内部是否已经感到风险升高？',
    text: '在绑架前，GAStech 内部关于 IPO、VIP 接待、安保程序和巡逻安排的邮件明显集中。外部冲突正在逼近，公司内部也已经开始感到风险。',
    takeaway: '危险不只在公司外部，内部安全系统也已经出现压力。',
  },
  {
    id: 14,
    phase: '15 网络转场',
    title: '复杂的关系网络',
    question: '为什么要从外部嫌疑转向内部网络？',
    text: '到这里，我们已经知道为什么 POK 会被怀疑。但绑架高管不是一句口号就能完成的事，它需要路线、信息、安保漏洞，甚至内部接触条件。调查开始从"谁想做"转向"谁做得到"。',
    takeaway: '真正的问题变成：谁拥有让绑架发生的条件？',
  },
  {
    id: 15,
    phase: '16 木马暗网',
    title: '谁能从内部打开门？',
    question: '如果绑架发生在安保场景中，内部通道在哪里？',
    text: (
      <>
        如果有人想带走 GAStech 高管，仅有外部动机还不够，还需要进入公司安全体系的方式。这里出现的幽灵员工、家族关系和安保节点，让内部通道的可能性浮出水面。
        <br/><br/>
        <span className="text-sm italic text-[#8C3636] cursor-pointer font-bold">（点击右侧图表，可以逐步看到异常人员、家族关系和潜在内应通道）</span>
      </>
    ),
    takeaway: 'POK 解释了动机，内部通道开始解释绑架如何可能发生。',
  },
  {
    id: 16,
    phase: '17 金蝉脱壳',
    title: '谁在消失，谁在删除真相？',
    question: '高层异常、删除、逃离与文件转移说明什么？',
    text: (
      <>
        线索继续向公司内部延伸：异常通信、Files 转移和离场路径都指向一个问题。高层是否只是受害者，还是有人提前知道、转移或隐藏了什么？
        <br/><br/>
        <span className="text-sm italic text-[#D4AF37] cursor-pointer font-bold">（点击右侧图表，可以依次查看异常通信线、文件转移和关键节点）</span>
      </>
    ),
    takeaway: '这些内部异常让"POK 单独作案"的说法变得不够完整。',
  },
  {
    id: 17,
    phase: '18 四股汇流',
    title: '外部与内部风险在同一窗口汇合',
    question: '为什么偏偏是 2014 年 1 月 20 日？',
    text: '到 2014 年 1 月 20 日，长期环境冲突、媒体定调、IPO/VIP 接待、安保压力和内部异常同时靠近同一个时间点。绑架不再像一个突然发生的单点事件，而像多个风险一起压到临界点后的爆发。',
    takeaway: '案发当天不是孤立的偶然，而是多条风险线同时汇合的结果。',
  },
  {
    id: 18,
    phase: '19 结尾篇',
    title: '数据结案',
    question: '四类证据合在一起，告诉我们什么？',
    text: '至此，我们可以得到一个比"POK 单独策划绑架"更稳妥的判断：这起事件更像是长期冲突、内部异动、异常通信与现场失控共同汇流后的爆发点。我们的可视化项目并没有试图简单指定唯一主谋，而是通过新闻、时间线、关系网与邮件证据，展示出这场绑架为何会在那一夜发生。',
    takeaway: '最终判断：绑架是长期冲突、舆论操纵、内部渗透与安保失控在案发前 72 小时内同步汇流的必然结果。',
  },
  {
    id: 19,
    phase: '20 Q4 方法对比',
    title: '2014 年的方法 vs 2026 年的方法',
    question: '如果十年前有人做了这个挑战，我们今年做得哪里不同？',
    text: '2014 年的典型工具链是静态统计图 + 逐篇阅读 + 手工关系图 + PPT 汇报。2026 年，我们用 Scrollytelling 可探索叙事、NLP 自动化实体/情感分析、力导向网络图和 Web 实时渲染，把原本需要 PDF 翻页才能理解的复杂关系变成了用户可自主探索的交互体验。方法进步本身也是分析结论可信度的保障。',
    takeaway: '从"读报告"到"探索证据"——交互式数据叙事是本次与 2014 年方法最大的差异。',
  }
];

function App() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      const data = await loadAllData();
      setAppData(data as AppData);
      setLoading(false);
    };
    initData();
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen bg-nyt-paper flex items-center justify-center font-serif text-nyt-title text-2xl">
        正在打开调查档案...
      </div>
    );
  }

  // Determine which chart to show — matches the condensed narrative order.
  const renderChart = () => {
    switch (currentStepIndex) {
      case 0:  return <Slide1Cover />;
      case 1:  return <FalseTruthOpeningPanel mediaStance={appData?.mediaStance} wordFrequencies={appData?.wordFrequencies} />;
      case 2:  return <DataOverviewPanel sources={appData?.sources} entities={appData?.entities} networkNodes={appData?.networkNodes} networkEdges={appData?.networkEdges} employees={appData?.employees} />;
      case 3:  return <SourceClassPanel sources={appData?.sources} />;
      case 4:  return <SourceNetworkPanel sourceRelations={appData?.sourceRelations} sources={appData?.sources} />;
      case 5:  return <TopicHeatmapPanel sources={appData?.sources} />;
      case 6:  return <StanceEvidencePanel mediaStance={appData?.mediaStance} />;
      case 7:  return <SankeyPanel sources={appData?.sources} />;
      case 8:  return <WordComparePanel wordFrequencies={appData?.wordFrequencies} />;
      case 9:  return <MediaRadarPanel sources={appData?.sources} />;
      case 10: return <Slide0Background />;
      case 11: return <POKHistoryTimelinePanel anchorEvents={appData?.anchorEvents} />;
      case 12: return <Slide4Timeline data={appData?.timelineMaster} />;
      case 13: return <SecurityHeatmapPanel emails={appData?.emails} />;
      case 14: return <ComplexRelationTransitionPanel />;
      case 15: return <Slide5Network nodesData={appData?.networkNodes} edgesData={appData?.networkEdges} />;
      case 16: return <Slide6Collapse nodesData={appData?.networkNodes} edgesData={appData?.networkEdges} />;
      case 17: return <Slide6Countdown />;
      case 18: return <FinalJudgmentPanel />;
      case 19: return <MethodComparePanel />;
      default: return <Slide1Cover />;
    }
  };

  const StepContent = ({ step, index, isActive }: { step: NarrativeStep, index: number, isActive: boolean }) => {
    const { ref, inView } = useInView({
      threshold: 0.5,
      rootMargin: "-20% 0px -20% 0px"
    });

    useEffect(() => {
      if (inView) {
        setCurrentStepIndex(index);
      }
    }, [inView, index]);

    return (
      <div 
        ref={ref}
        className={`
          my-[60vh] p-8 border-l-4 transition-all duration-700 ease-in-out
          ${isActive 
            ? 'border-nyt-title opacity-100 transform translate-x-0 bg-white/70 shadow-sm' 
            : 'border-nyt-sand opacity-30 transform -translate-x-4'
          }
        `}
      >
        <div className="mb-4 flex items-center gap-3 font-sans">
          <span className="rounded-sm border border-nyt-sand/70 bg-[#F7F3EA] px-2 py-1 text-[11px] font-bold tracking-[0.18em] text-[#8B7355]">
            {step.phase}
          </span>
          <span className="text-[11px] uppercase tracking-widest text-nyt-text/40">
            第 {index + 1} / {narrativeSteps.length} 页
          </span>
        </div>
        <h2 className="text-2xl font-serif font-bold text-nyt-title mb-4">
          {step.title}
        </h2>
        <div className="mb-5 rounded-sm border-l-2 border-[#8C3636] bg-white/65 px-4 py-3 font-serif text-[17px] font-bold leading-relaxed text-[#111111]">
          {step.question}
        </div>
        <div className="text-lg leading-relaxed font-serif text-nyt-text">
          {step.text}
        </div>
        <div className="mt-6 rounded-sm border border-dashed border-[#C9B79C] bg-[#FCFAF6] px-4 py-3 font-sans text-[13px] leading-relaxed text-[#4A5568]">
          <span className="mr-2 font-bold tracking-[0.14em] text-[#8C3636]">请记住</span>
          {step.takeaway}
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full bg-nyt-paper min-h-screen text-nyt-text selection:bg-nyt-sand">
      {/* Left Narrative Panel (35%) */}
      <div className="w-[35%] z-10 relative px-12 py-24 shadow-[10px_0_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="sticky top-0 z-20 -mx-12 -mt-24 border-b border-nyt-border bg-nyt-paper/95 px-12 py-5 backdrop-blur">
          <div className="text-[11px] font-sans tracking-[0.28em] text-[#8B7355]">调查路线</div>
          <div className="mt-2 text-lg font-serif font-bold text-nyt-title">
            案件 → 信息来源 → 媒体偏见 → 外部关系 → 内部通道 → 最终判断
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#E2DDD5]">
            <div
              className="h-full rounded-full bg-[#8C3636] transition-all duration-500"
              style={{ width: `${((currentStepIndex + 1) / narrativeSteps.length) * 100}%` }}
            />
          </div>
        </div>
        {narrativeSteps.map((step, index) => {
          const isActive = currentStepIndex === index;
          return (
            <StepContent key={step.id} step={step} index={index} isActive={isActive} />
          );
        })}
      </div>

      {/* Right Visualization Panel (65% - Sticky) */}
      <div className="w-[65%] sticky top-0 h-screen bg-[#FCFCFA] p-8 border-l border-nyt-border flex flex-col">
        {/* Top subtle branding */}
        <div className="h-12 w-full border-b border-nyt-border/50 flex justify-between items-center px-4 font-sans text-xs tracking-widest text-nyt-text/40 mb-4">
          <span>THE KRONOS INVESTIGATION</span>
          <span>EVIDENCE VAULT</span>
        </div>
        
        {/* Chart Container with fade transition */}
        <div className="flex-1 relative w-full h-full overflow-hidden" key={`chart-${currentStepIndex}`}>
          <div className="absolute inset-0 animate-[fadeIn_1s_ease-in-out]">
            {renderChart()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
