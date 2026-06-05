import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { loadAllData } from './data/dataLoader';

// Components
import Slide1Cover from './components/Charts/Slide1Cover';
import Slide2Overview from './components/Charts/Slide2Overview';
import Slide3InkDrop from './components/Charts/Slide3InkDrop';
import Slide4Timeline from './components/Charts/Slide4Timeline';
import Slide5Network from './components/Charts/Slide5Network';
import Slide6Collapse from './components/Charts/Slide6Collapse';
import Slide6Heatmap from './components/Charts/Slide6Heatmap';
import Slide7Conclusion from './components/Charts/Slide7Conclusion';
import { ErrorBoundary } from './components/ErrorBoundary';

const narrativeSteps = [
  {
    id: 0,
    title: "开场篇：抛出悬念",
    text: "各位老师同学好。2014 年 1 月 20 日，Kronos 岛的能源巨头 GAStech 举办了一场造富神话般的 IPO 庆功宴。但在当晚，多名核心高管集体离奇失踪。官方定性为极端环保组织 POK 的恐怖绑架。但这，真的是全部的真相吗？"
  },
  {
    id: 1,
    title: "数据概览",
    text: "为了刺透迷雾，我们没有盲信官方通报。我们截获了 800 多篇新闻报道、数千封内部加密邮件以及绝密的员工档案。当我们将这些零散的数据碎片拼接在一起时，一个令人毛骨悚然的局中局浮出水面。"
  },
  {
    id: 2,
    title: "第一幕：非对称的舆论屠杀",
    text: `调查伊始，我们遭遇了一堵巨大的“舆论高墙”。请看右侧的词汇气泡：代表官方建制派的 800 篇报道，用绝对的声量碾压，将 POK 强行定罪为“暴徒”与“瘟疫”。而那些试图指出污染真相的微弱发声，被彻底边缘化。在真相尚未查明之时，媒体就已经完成了“死刑判决”。`
  },
  {
    id: 3,
    title: "第二幕：鲜血浇灌的 IPO",
    text: (
      <>
        穿透舆论，我们将二十年的数据铺入时间轴，发现了极度刺眼的<strong>"利益剪刀差"</strong>。
        <br /><br />
        上方金线，是高管们一路飙升至 20 亿美元的财富神话；下方红线，则是被原油污染的地下水、死于白血病的 10 岁女孩 Juliana，以及在狱中离奇死亡的 POK 领袖。
        <br /><br />
        <span className="block border-l-4 border-[#8C3636] pl-4 italic font-bold mt-2">
          "巨大的贫富与生死撕裂，注定了这场庆功宴将是一场血色晚宴。"
        </span>
      </>
    )
  },
  {
    id: 4,
    title: "第三幕（上）：木马与裙带暗网",
    text: (
      <>
        谁能在安保森严的晚宴上带走所有人？我们重构了 GAStech 严密的金字塔结构。<br/><br/>
        你会发现，在森严的阶级之下，底层的"家族血脉"织成了一张情报暗网。最致命的内鬼（The Moles）——Vann 兄弟，正好把控着安保核心。而他们，与当年死去的女孩 Juliana 同姓。复仇的种子早已埋下，案发当晚，正是弟弟为绑匪留了门。<br/><br/>
        <span className="text-sm italic text-[#8C3636] cursor-pointer font-bold">（请在右侧连续点击两次图表，揭开裙带暗网与内鬼红线）</span>
      </>
    )
  },
  {
    id: 5,
    title: "第三幕（下）：高层掩盖与金蝉脱壳",
    text: (
      <>
        当底层在复仇时，高层在干什么？数据追踪显示，高层正联合政府强行【删除】抗议照片，试图用资本捂住真相。<br/><br/>
        更让人胆寒的是：头号目标 CEO 根本没有被绑架！案发前，他反常地向自己发送了 23 封加密邮件，并越级联系卡车司机转移神秘的"Files"。案发时刻，他早已乘坐绝密私人航班逃之夭夭。<br/><br/>
        <span className="text-sm italic text-[#D4AF37] cursor-pointer font-bold">（请在右侧连续点击两次图表，追踪高层删稿与 CEO 逃跑轨迹）</span>
      </>
    )
  },
  {
    id: 6,
    title: "第四幕：沾血的预谋（铁证）",
    text: "外部的血海深仇，高层真的毫无察觉吗？我们提取了内部邮件热力图。案发前两周，涉及'VIP 接待'与'安保巡逻'的邮件频率出现了异常的深红色飙升。他们清清楚楚地知道危险即将来临。但 IPO 敲钟带来的巨大财富诱惑，让他们选择了让其他高管充当诱饵。"
  },
  {
    id: 7,
    title: "结尾篇：数据结案",
    text: "至此，真相大白。这绝不仅是 POK 单方面宣称负责的极端袭击，更是一场资本嗜血、掩盖真相、内鬼渗透以及 CEO 金蝉脱壳的联合绞杀。我们的可视化项目，在庞杂的海量数据中抽丝剥茧，还原了这幅血淋淋的利益拼图。汇报完毕，谢谢大家！"
  }
];

// StepContent 组件移到 App 外部，避免每次渲染重新创建导致 React 反复卸载/挂载
const StepContent = ({
  step, index, isActive, onVisible
}: {
  step: any; index: number; isActive: boolean; onVisible: (idx: number) => void;
}) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    rootMargin: "-20% 0px -20% 0px"
  });

  useEffect(() => {
    if (inView) {
      onVisible(index);
    }
  }, [inView, index, onVisible]);

  return (
    <div
      ref={ref}
      className={`
        my-[60vh] p-8 border-l-4 transition-all duration-700 ease-in-out
        ${isActive
          ? 'border-nyt-title opacity-100 transform translate-x-0 bg-white/50 shadow-sm'
          : 'border-nyt-sand opacity-30 transform -translate-x-4'
        }
      `}
    >
      <h3 className="text-sm uppercase tracking-widest text-nyt-text/50 mb-2 font-sans">
        Document {index + 1} of 8
      </h3>
      <h2 className="text-2xl font-serif font-bold text-nyt-title mb-4">
        {step.title}
      </h2>
      <p className="text-lg leading-relaxed font-serif text-nyt-text">
        {step.text}
      </p>
    </div>
  );
};

function App() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // useCallback 确保引用稳定，StepContent 不会因此重新挂载
  const handleStepVisible = useCallback((idx: number) => {
    setCurrentStepIndex(idx);
  }, []);

  useEffect(() => {
    const initData = async () => {
      const data = await loadAllData();
      setAppData(data);
      setLoading(false);
    };
    initData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center text-[#F9F9F6]">
        <div className="mb-8">
          <svg width="60" height="60" viewBox="0 0 60 60" className="animate-spin" style={{ animationDuration: '3s' }}>
            <circle cx="30" cy="30" r="25" fill="none" stroke="#D4C4A8" strokeWidth="1" opacity="0.3" />
            <circle cx="30" cy="30" r="25" fill="none" stroke="#8C3636" strokeWidth="2"
              strokeDasharray="40 120" strokeLinecap="round" />
          </svg>
        </div>
        <div className="text-lg tracking-[0.3em] uppercase font-serif mb-3 animate-pulse">
          Decrypting Investigation Archives
        </div>
        <div className="text-sm text-[#D4C4A8]/60 font-sans">
          正在解密调查档案...
        </div>
        <div className="mt-8 flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full bg-[#8C3636]"
              style={{
                animation: `loadingDot 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes loadingDot {
            0%, 80%, 100% { opacity: 0.2; transform: scale(1); }
            40% { opacity: 1; transform: scale(1.5); }
          }
        `}</style>
      </div>
    );
  }

  // Determine which chart to show
  const renderChart = () => {
    switch (currentStepIndex) {
      case 0: return <ErrorBoundary fallbackLabel="Cover"><Slide1Cover /></ErrorBoundary>;
      case 1: return <ErrorBoundary fallbackLabel="Overview"><Slide2Overview /></ErrorBoundary>;
      case 2: return <ErrorBoundary fallbackLabel="InkDrop"><Slide3InkDrop /></ErrorBoundary>;
      case 3: return <ErrorBoundary fallbackLabel="Timeline"><Slide4Timeline data={appData?.timelineMaster} anchorEvents={appData?.anchorEvents} /></ErrorBoundary>;
      case 4: return <ErrorBoundary fallbackLabel="Network"><Slide5Network nodesData={appData?.networkNodes} edgesData={appData?.networkEdges} /></ErrorBoundary>;
      case 5: return <ErrorBoundary fallbackLabel="Collapse"><Slide6Collapse nodesData={appData?.networkNodes} edgesData={appData?.networkEdges} /></ErrorBoundary>;
      case 6: return <ErrorBoundary fallbackLabel="Heatmap"><Slide6Heatmap data={appData?.emails} /></ErrorBoundary>;
      case 7: return <ErrorBoundary fallbackLabel="Conclusion"><Slide7Conclusion /></ErrorBoundary>;
      default: return <ErrorBoundary fallbackLabel="Cover"><Slide1Cover /></ErrorBoundary>;
    }
  };

  return (
    <div className="flex w-full bg-nyt-paper min-h-screen text-nyt-text selection:bg-nyt-sand">
      {/* Left Narrative Panel (35%) */}
      <div className="w-[35%] z-10 relative px-12 py-24 shadow-[10px_0_20px_-10px_rgba(0,0,0,0.05)]">
        {narrativeSteps.map((step, index) => {
          const isActive = currentStepIndex === index;
          return (
            <StepContent
              key={step.id}
              step={step}
              index={index}
              isActive={isActive}
              onVisible={handleStepVisible}
            />
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
