/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        nyt: {
          paper: '#F9F9F6', // 米白/羊皮纸底色
          text: '#333333',  // 柔和的深灰色正文
          title: '#111111', // 极深的标题色
          blue: '#2C3E50',  // 深板岩蓝 (官方/GAStech)
          red: '#8C3636',   // 暗砖红 (冲突/危险)
          green: '#526E4F', // 鼠尾草绿 (POK/环境)
          sand: '#D4C4A8',  // 低饱和沙色 (辅助/网格)
          border: '#E2E2E2' // 边框色
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Helvetica Neue"', 'Inter', '"Noto Sans SC"', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
