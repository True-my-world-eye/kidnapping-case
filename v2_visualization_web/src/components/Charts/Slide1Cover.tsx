import React from 'react';

const Slide1Cover = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#111111] text-nyt-paper">
      <div className="text-center space-y-6 max-w-2xl px-8 relative">
        {/* Typewriter / Archive effect border */}
        <div className="absolute inset-0 border border-nyt-paper/20 rounded -m-8 pointer-events-none">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-nyt-paper/50"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-nyt-paper/50"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-nyt-paper/50"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-nyt-paper/50"></div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-widest text-nyt-paper">
          THE GASTECH
          <span className="block text-nyt-red mt-2">ABDUCTION</span>
        </h1>
        
        <div className="h-px w-24 bg-nyt-paper/30 mx-auto my-8"></div>
        
        <p className="text-lg md:text-xl font-sans text-nyt-paper/80 leading-relaxed font-light tracking-wide">
          2014年1月，一场震惊世界的失踪案数据调查档案。
        </p>
        
        <div className="pt-12 text-sm font-sans text-nyt-paper/50 uppercase tracking-widest">
          数据调查团队 <span className="text-nyt-paper/80 font-medium">第三小组</span>
        </div>
      </div>
    </div>
  );
};

export default Slide1Cover;