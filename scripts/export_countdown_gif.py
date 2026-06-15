"""
导出「案发前 72 小时：多方异动汇流」动画为 GIF / WebP。

数据溯源说明（VAST Challenge 2021 MC1）：
- 本脚本中的 flows 数据（POK抗议线、GAStech高层、安保执行层、政府接待链）
  及其 checkpoints（T-72h/T-48h/T-24h 关键事件）是研究者基于以下来源的**叙事综合**：
  (a) timeline_master.csv — 来自 build_analysis.py 对 articles_lite.csv 的事件提取
  (b) emails.csv 的日期/主题聚类 — 来自 parse_mc1.py 对 email headers.csv 的解析
  (c) anchor_events.csv — 8 个研究者标注的关键锚点事件
- 各 checkpoint 的事件标题（如"CEO 发送 Files""Route suggestion"）
  来自 emails.csv 的具体邮件标题，数据真实可查。
- 但四条线的"汇流→绑架之夜"因果框架是**叙事构造**，
  原始数据仅提供时序关联，不能独立证明因果关系。
- VAST Challenge 2021 MC1 官方数据来源：
  https://vast-challenge.github.io/2021/MC1.html

依赖: pip install playwright pillow
首次运行: playwright install chromium

用法:
  python scripts/export_countdown_gif.py
  python scripts/export_countdown_gif.py --format webp --fps 24
"""

from __future__ import annotations

import argparse
import asyncio
import io
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / ".tmp" / "countdown_animation.html"
OUTPUT_DIR = ROOT / "output"


def build_standalone_html() -> str:
    """生成可独立运行的动画 HTML（与 Slide6Countdown 逻辑一致）。"""
    return r"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"/>
<title>案发前 72 小时：多方异动汇流</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #F9F9F6;
    font-family: Georgia, "Noto Serif SC", serif;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  .card {
    width: 1140px;
    height: 780px;
    background: #F9F9F6;
    border: 1px solid #E2E2E2;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .header { padding: 20px 24px 12px; }
  .header h1 { font-size: 28px; color: #111; font-weight: bold; }
  .header p { margin-top: 4px; font-size: 14px; color: #4A5568; font-family: sans-serif; }
  .chart {
    flex: 1;
    margin: 0 16px 16px;
    border: 1px solid #DDD4C7;
    border-radius: 2px;
    background: radial-gradient(circle at 84% 48%, rgba(212,196,168,0.16), transparent 22%),
                linear-gradient(180deg, rgba(255,255,255,0.96), rgba(245,241,234,0.94));
    position: relative;
  }
  svg { width: 100%; height: 100%; display: block; }
</style>
</head>
<body>
<div class="card" id="root">
  <div class="header">
    <h1>案发前 72 小时：多方异动汇流</h1>
    <p>同一时间窗口里，四股力量同步异动，最终汇向同一个爆点。</p>
  </div>
  <div class="chart">
    <svg viewBox="0 0 1140 700" id="svg"></svg>
  </div>
</div>
<script>
const flows = [
  { id:'pok', label:'POK / 外部抗议线', color:'#8C3636', glow:'rgba(140,54,54,0.24)', width:30, startY:110, endY:310,
    summary:'污染旧怨', chain:'旧怨 → 反 IPO → 被预设指认',
    checkpoints:[
      {x:380,y:92,title:'T-72h',note:'旧怨未退',event:'抗议情绪延续',align:'top'},
      {x:620,y:140,title:'T-48h',note:'反 IPO',event:'反 IPO 叙事升温',align:'top'},
      {x:840,y:198,title:'T-24h',note:'被预设指认',event:'POK 成为首要嫌疑',align:'top'}
    ]},
  { id:'exec', label:'GAStech 高层', color:'#B7791F', glow:'rgba(183,121,31,0.24)', width:34, startY:270, endY:340,
    summary:'IPO / VIP 异动', chain:'IPO 活跃 → 越级通信 → Files / 离场',
    checkpoints:[
      {x:380,y:260,title:'T-72h',note:'IPO 活跃',event:'高层仍在推进 IPO / VIP',align:'top'},
      {x:620,y:290,title:'T-48h',note:'越级通信',event:'顶层直接联络底层',align:'bottom'},
      {x:840,y:316,title:'T-24h',note:'Files / 离场',event:'13:03 CEO 发送 Files',align:'bottom'}
    ]},
  { id:'ops', label:'安保 / 执行层', color:'#2C3E50', glow:'rgba(44,62,80,0.22)', width:28, startY:440, endY:388,
    summary:'巡逻与路线异动', chain:'Patrol → 安保加速 → 路线变化',
    checkpoints:[
      {x:380,y:460,title:'T-72h',note:'Patrol',event:'巡逻与检查启动',align:'bottom'},
      {x:620,y:440,title:'T-48h',note:'安保加速',event:'会场安保同步加速',align:'top'},
      {x:840,y:418,title:'T-24h',note:'路线变化',event:'13:37 Route suggestion',align:'bottom'}
    ]},
  { id:'gov', label:'政府 / 接待链', color:'#4A5568', glow:'rgba(74,85,104,0.2)', width:22, startY:600, endY:420,
    summary:'接待链打开场域', chain:'VIP 接待 → 会场微调 → 条件被利用',
    checkpoints:[
      {x:380,y:620,title:'T-72h',note:'VIP 接待',event:'接待准备进入最后阶段',align:'bottom'},
      {x:620,y:578,title:'T-48h',note:'会场微调',event:'宾客与会场安排微调',align:'bottom'},
      {x:840,y:528,title:'T-24h',note:'条件被利用',event:'现场条件具备可利用空间',align:'bottom'}
    ]}
];
const columnLabels = [
  {x:190,label:'可疑势力'},{x:380,label:'T-72h'},{x:620,label:'T-48h'},{x:840,label:'T-24h'},{x:1040,label:'绑架之夜'}
];
const TIMELINE_START=190, TIMELINE_END=955, FLOW_STAGGER=[0,0.05,0.1,0.15], ANIMATION_MS=9000;
const flowPath=(sy,ey)=>`M 190 ${sy} C 380 ${sy}, 700 ${ey}, 955 ${ey}`;
const xToProgress=x=>Math.max(0,Math.min(1,(x-TIMELINE_START)/(TIMELINE_END-TIMELINE_START)));
const easeOutCubic=t=>1-Math.pow(1-t,3);
const getFlowProgress=(p,i)=>{const s=FLOW_STAGGER[i];return p<=s?0:Math.min(1,(p-s)/(1-s));};

const svg=document.getElementById('svg');
const NS='http://www.w3.org/2000/svg';
function el(tag,attrs={},text){const n=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,String(v)));if(text)n.textContent=text;return n;}

const defs=el('defs');
flows.forEach(f=>{
  const g=el('linearGradient',{id:`gradient-${f.id}`,x1:'0%',y1:'0%',x2:'100%',y2:'0%'});
  [['0%','0.88'],['65%','0.65'],['100%','0.95']].forEach(([o,a])=>{
    const s=el('stop',{offset:o,'stop-color':f.color,'stop-opacity':a}); g.appendChild(s);
  });
  defs.appendChild(g);
});
svg.appendChild(defs);

const pathLengths={};
const pathEls={};
flows.forEach(f=>{
  const p=el('path',{d:flowPath(f.startY,f.endY),fill:'none',stroke:'none',visibility:'hidden'});
  svg.appendChild(p);
  pathLengths[f.id]=p.getTotalLength();
  pathEls[f.id]=p;
});

const layers={columns:[],flows:[],convergence:null};
columnLabels.forEach(c=>{
  const g=el('g');
  g.appendChild(el('line',{x1:c.x,y1:60,x2:c.x,y2:660,stroke:'#E2D6C2','stroke-dasharray':'5 7'}));
  g.appendChild(el('text',{x:c.x,y:32,'text-anchor':'middle','font-size':13,fill:'#8B7355','letter-spacing':'2.4','font-weight':500},c.label));
  svg.appendChild(g); layers.columns.push(g);
});

flows.forEach((f,fi)=>{
  const g=el('g');
  const glow=el('path',{d:flowPath(f.startY,f.endY),fill:'none',stroke:f.glow,'stroke-width':f.width+14,'stroke-linecap':'round',opacity:0.5});
  const main=el('path',{d:flowPath(f.startY,f.endY),fill:'none',stroke:`url(#gradient-${f.id})`,'stroke-width':f.width,'stroke-linecap':'round',opacity:0.95});
  g.appendChild(glow); g.appendChild(main);
  const labelG=el('g');
  labelG.appendChild(el('line',{x1:172,y1:f.startY,x2:190,y2:f.startY,stroke:f.color,'stroke-width':2.5,opacity:0.7}));
  labelG.appendChild(el('circle',{cx:170,cy:f.startY,r:10,fill:f.color}));
  labelG.appendChild(el('text',{x:22,y:f.startY-8,'font-size':20,fill:'#111111','font-weight':'bold'},f.label));
  labelG.appendChild(el('text',{x:22,y:f.startY+14,'font-size':12,fill:'#5A6572'},f.summary));
  labelG.appendChild(el('text',{x:22,y:f.startY+32,'font-size':11,fill:'#7B8794'},f.chain));
  g.appendChild(labelG);
  const cps=[];
  f.checkpoints.forEach(pt=>{
    const cg=el('g');
    cg.appendChild(el('circle',{cx:pt.x,cy:pt.y,r:8,fill:f.color,stroke:'#fff','stroke-width':2.5}));
    cg.appendChild(el('text',{x:pt.x,y:pt.align==='top'?pt.y-22:pt.y+22,'text-anchor':'middle','font-size':11,fill:'#8B7355','letter-spacing':1},pt.title));
    cg.appendChild(el('text',{x:pt.x,y:pt.align==='top'?pt.y+18:pt.y+38,'text-anchor':'middle','font-size':12,fill:'#2D3748','font-weight':500},pt.note));
    cg.appendChild(el('text',{x:pt.x,y:pt.align==='top'?pt.y+34:pt.y+54,'text-anchor':'middle','font-size':11,fill:'#6B7280'},pt.event));
    g.appendChild(cg); cps.push({el:cg,x:pt.x,y:pt.y});
  });
  svg.appendChild(g);
  layers.flows.push({g,glow,main,labelG,cps,fi});
});

const convG=el('g');
convG.appendChild(el('circle',{cx:1040,cy:365,r:80,fill:'#111111',opacity:0.96}));
convG.appendChild(el('circle',{cx:1040,cy:365,r:100,fill:'none',stroke:'#D4C4A8','stroke-dasharray':'8 8','stroke-width':2,opacity:0.85}));
convG.appendChild(el('circle',{cx:1040,cy:365,r:118,fill:'none',stroke:'rgba(212,196,168,0.22)','stroke-width':1.5}));
convG.appendChild(el('text',{x:1040,y:348,'text-anchor':'middle','font-size':22,fill:'#F9F9F6','font-weight':'bold'},'绑架之夜'));
convG.appendChild(el('text',{x:1040,y:376,'text-anchor':'middle','font-size':14,fill:'#EBD9BE','letter-spacing':1.4},'2014.01.20'));
convG.appendChild(el('text',{x:1040,y:400,'text-anchor':'middle','font-size':12,fill:'#F2E7D2'},'四股力量的汇点'));
svg.appendChild(convG);
layers.convergence=convG;

function render(progress){
  layers.columns.forEach((g,i)=>g.setAttribute('opacity',String(Math.min(1,progress*4-i*0.15))));
  layers.flows.forEach(({glow,main,labelG,cps,fi})=>{
    const fp=getFlowProgress(progress,fi);
    const len=pathLengths[flows[fi].id];
    const off=len*(1-fp);
    glow.setAttribute('stroke-dasharray',String(len));
    glow.setAttribute('stroke-dashoffset',String(off));
    main.setAttribute('stroke-dasharray',String(len));
    main.setAttribute('stroke-dashoffset',String(off));
    glow.setAttribute('opacity',String(0.5*Math.min(1,fp*2)));
    labelG.setAttribute('opacity',String(Math.min(1,fp*3)));
    cps.forEach(({el,x,y})=>{
      const threshold=xToProgress(x);
      let op=0;
      if(fp>=threshold) op=1;
      else if(fp>threshold-0.04) op=(fp-(threshold-0.04))/0.04;
      const sc=0.6+op*0.4;
      el.setAttribute('opacity',String(op));
      el.setAttribute('transform',`translate(${x},${y}) scale(${sc}) translate(${-x},${-y})`);
    });
  });
  const cv=progress>0.78;
  const op=cv?Math.min(1,(progress-0.78)/0.08):0;
  const sc=cv?1+0.05*Math.sin((progress-0.78)*28):0.3;
  convG.setAttribute('opacity',String(op));
  convG.setAttribute('transform',`translate(1040,365) scale(${sc}) translate(-1040,-365)`);
}

let start=null;
function loop(ts){
  if(!start) start=ts;
  const t=Math.min((ts-start)/ANIMATION_MS,1);
  render(easeOutCubic(t));
  if(t<1) requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

window.__getProgress = () => {
  return new Promise(resolve => {
    start = null;
    const s = performance.now();
    function tick(ts){
      if(!start) start=ts;
      const t=Math.min((ts-start)/ANIMATION_MS,1);
      render(easeOutCubic(t));
      if(t>=1) resolve(true);
      else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
};
window.__renderAt = (p) => render(p);
</script>
</body>
</html>"""


async def export_gif(fps: int, fmt: str, width: int, height: int) -> Path:
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("请先安装: pip install playwright pillow", file=sys.stderr)
        print("然后运行: playwright install chromium", file=sys.stderr)
        sys.exit(1)

    from PIL import Image

    HTML_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    HTML_PATH.write_text(build_standalone_html(), encoding="utf-8")

    total_frames = int(ANIMATION_MS / 1000 * fps) + int(fps * 0.8)
    frames: list[Image.Image] = []

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": width, "height": height})
        await page.goto(HTML_PATH.as_uri())

        for i in range(total_frames):
            t = min(i / (total_frames - int(fps * 0.8) - 1), 1.0) if total_frames > 1 else 1.0
            eased = 1 - (1 - t) ** 3
            await page.evaluate(f"window.__renderAt({eased})")
            png = await page.screenshot(type="png")
            frames.append(Image.open(io.BytesIO(png)).convert("RGB"))

        await browser.close()

    out_path = OUTPUT_DIR / f"countdown_confluence.{fmt}"
    if fmt == "gif":
        duration_ms = int(1000 / fps)
        frames[0].save(
            out_path,
            save_all=True,
            append_images=frames[1:],
            duration=duration_ms,
            loop=0,
            optimize=True,
        )
    else:
        duration_ms = int(1000 / fps)
        frames[0].save(
            out_path,
            save_all=True,
            append_images=frames[1:],
            duration=duration_ms,
            loop=0,
            lossless=True,
            quality=90,
            method=6,
        )

    return out_path


ANIMATION_MS = 9000


def main() -> None:
    parser = argparse.ArgumentParser(description="导出 72 小时汇流动画")
    parser.add_argument("--fps", type=int, default=20, help="帧率 (默认 20)")
    parser.add_argument("--format", choices=["gif", "webp"], default="gif")
    parser.add_argument("--width", type=int, default=1140)
    parser.add_argument("--height", type=int, default=780)
    parser.add_argument("--html-only", action="store_true", help="仅生成独立 HTML，不导出 GIF")
    args = parser.parse_args()

    HTML_PATH.parent.mkdir(parents=True, exist_ok=True)
    HTML_PATH.write_text(build_standalone_html(), encoding="utf-8")
    print(f"独立 HTML: {HTML_PATH}")

    if args.html_only:
        return

    out = asyncio.run(export_gif(args.fps, args.format, args.width, args.height))
    print(f"已导出: {out}")


if __name__ == "__main__":
    main()
