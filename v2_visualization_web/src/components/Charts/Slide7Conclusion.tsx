import React from 'react';

const Slide7Conclusion = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-nyt-paper text-nyt-title relative overflow-hidden">
      
      {/* Abstract background elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-nyt-red/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-nyt-blue/5 rounded-full blur-3xl"></div>

      <div className="max-w-2xl px-8 z-10">
        <h2 className="text-4xl font-serif font-bold mb-8 border-b-2 border-nyt-title pb-4">
          结案陈词
        </h2>
        
        <div className="space-y-6 font-serif text-xl leading-relaxed text-nyt-text">
          <p>
            数据向我们揭示了一个残酷的真相：GAStech 绑架案绝不是一次孤立的极端袭击。
          </p>
          <p className="pl-6 border-l-4 border-nyt-red/30 italic">
            它是长期无视环境污染、深度的政商利益勾结，以及对民众诉求不断暴力镇压后，必然引爆的一场反噬。
          </p>
          <p>
            通过拨开媒体偏见的迷雾，重构权力与利益的暗网，Kronos 悲剧的完整拼图终于从海量的数据碎片中浮出水面。
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-nyt-sand flex justify-between items-center text-sm font-sans text-nyt-text/60">
          <div>DATA VISUALIZATION PROJECT</div>
          <div>VAST CHALLENGE 2014</div>
        </div>
      </div>
    </div>
  );
};

export default Slide7Conclusion;