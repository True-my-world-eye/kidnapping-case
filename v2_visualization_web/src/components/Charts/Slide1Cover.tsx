import React from 'react';

const Slide1Cover = () => {
  return (
    <div className="h-full w-full bg-[#111111] text-nyt-paper relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(249,249,246,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(249,249,246,0.35) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      <div className="absolute left-8 top-8 right-8 flex items-center justify-between border-b border-nyt-paper/15 pb-4 font-sans text-[11px] tracking-[0.28em] text-nyt-paper/45">
        <span>THE KRONOS INVESTIGATION</span>
        <span>CASE FILE / 2014-01-20</span>
      </div>

      <div className="relative z-10 flex h-full flex-col justify-center px-12">
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex border border-[#8C3636] bg-[#8C3636] px-3 py-1 font-sans text-[11px] font-bold tracking-[0.24em] text-white">
            BREAKING CASE
          </div>

          <h1 className="max-w-3xl font-serif text-[56px] font-bold leading-[1.06] tracking-tight text-nyt-paper">
            谁带走了
            <span className="block text-[#D8C7AA]">GAStech 高管？</span>
          </h1>

          <div className="mt-5 max-w-3xl font-serif text-[24px] font-bold leading-relaxed text-nyt-paper/88">
            2014 年 1 月 20 日，多名 GAStech 高管在政府接待前集体失踪。
          </div>

          <div className="mt-7 grid max-w-3xl grid-cols-[160px_1fr] overflow-hidden border border-nyt-paper/18 bg-nyt-paper/[0.035] font-sans">
            <div className="border-b border-r border-nyt-paper/14 px-4 py-3 text-[11px] tracking-[0.2em] text-nyt-paper/45">
              DATE
            </div>
            <div className="border-b border-nyt-paper/14 px-4 py-3 text-[15px] font-bold text-nyt-paper">
              2014 年 1 月 20 日
            </div>
            <div className="border-r border-nyt-paper/14 px-4 py-3 text-[11px] tracking-[0.2em] text-nyt-paper/45">
              SCENE
            </div>
            <div className="px-4 py-3 text-[15px] leading-relaxed text-nyt-paper/85">
              Kronos 岛，GAStech 高管原定前往政府接待活动，庆祝公司与政府二十年合作关系。
            </div>
          </div>

          <p className="mt-7 max-w-3xl border-l-4 border-[#8C3636] pl-5 font-serif text-[22px] leading-relaxed text-nyt-paper/88">
            官方与媒体很快把嫌疑指向 POK。但当新闻、时间线、组织关系和内部邮件被放到一起，这个答案开始显得过于简单。
          </p>
        </div>

        <div className="absolute bottom-8 left-12 right-12 flex items-center justify-between border-t border-nyt-paper/15 pt-4 font-sans text-[11px] tracking-[0.24em] text-nyt-paper/45">
          <span>DATA INVESTIGATION TEAM</span>
          <span className="text-nyt-paper/70">新闻 · 时间线 · 组织关系 · 内部邮件</span>
        </div>
      </div>
    </div>
  );
};

export default Slide1Cover;
