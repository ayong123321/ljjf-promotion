'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Pause, ChevronRight, ChevronLeft, CheckCircle, 
  QrCode, Smartphone, Users, Gift, MapPin, Clock, Phone,
  Volume2, VolumeX, Download, Share2
} from 'lucide-react';

interface Chapter {
  id: number;
  title: string;
  duration: string;
  content: string;
  audioUrl?: string;
  icon: React.ReactNode;
}

const chapters: Chapter[] = [
  {
    id: 1,
    title: '什么是推广系统',
    duration: '1分钟',
    icon: <QrCode className="h-8 w-8" />,
    content: `
## 什么是推广系统？

玲姐假发推广系统是一个**简单好用的赚钱工具**！

### 您的工作很简单：

1. **领取专属二维码** - 每个人都有自己独一无二的二维码
2. **分享给朋友** - 发到微信朋友圈、微信群、或者直接发给朋友
3. **朋友扫码留资** - 朋友扫码后填写联系方式
4. **到店领取礼品** - 朋友到店里出示二维码，领取小礼品
5. **您拿返现** - 每成交一位，您都有现金奖励！

### 核心优势：

- **不用推销** - 朋友自己扫码，不尴尬
- **不用记账** - 系统自动统计，清清楚楚
- **随时查看** - 手机上就能看到推广成果
- **即时返现** - 成交后立马拿到钱

就这么简单！发发二维码，等着拿钱就行了！
    `
  },
  {
    id: 2,
    title: '如何获取您的专属二维码',
    duration: '1分钟',
    icon: <Smartphone className="h-8 w-8" />,
    content: `
## 如何获取您的专属二维码？

### 方法一：向店主索取

直接找玲姐，告诉她：
- **您的姓名**
- **您的手机号**

玲姐会在系统里添加您，然后给您一张**专属二维码图片**。

### 方法二：自己注册

1. 打开系统首页：**www.ljjf.fun**
2. 进入管理后台（需要玲姐授权）
3. 在"推广员管理"里添加新推广员

### 拿到二维码后：

**保存到手机相册**，随时随地都能发！

- 发朋友圈
- 发微信群
- 发给个人好友
- 打印出来贴在店里

**记住**：这个二维码是您专属的，别人扫码就算您的推广成绩！
    `
  },
  {
    id: 3,
    title: '如何分享推广',
    duration: '1分钟',
    icon: <Share2 className="h-8 w-8" />,
    content: `
## 如何分享推广？

### 发朋友圈（推荐）

**第一步**：打开微信 → 发现 → 朋友圈

**第二步**：点击右上角相机图标

**第三步**：选择您的二维码图片

**第四步**：配上推荐文案，例如：

> 💇‍♀️ 长清14年假发老店，专业遮白发、增发、时尚发型！
> 
> 扫码看看，有需求的朋友到店还能领礼品哦～
> 
> 📍 地址：永安玲姐假发

**第五步**：点击发表！

### 发微信群

选择合适的群（比如小区群、同学群、亲友群），发送二维码图片。

### 发给个人好友

私信发给可能有需要的朋友，不用硬推，就说"帮朋友转一下"。

### 小技巧：

- **黄金时段**：早上7-9点、晚上8-10点，大家都在刷手机
- **周末效果好**：大家有更多时间浏览
- **配图加文字**：比只发二维码效果好
- **偶尔发一次**：不要刷屏，一周1-2次就够了
    `
  },
  {
    id: 4,
    title: '朋友扫码后会发生什么',
    duration: '1分钟',
    icon: <Users className="h-8 w-8" />,
    content: `
## 朋友扫码后会发生什么？

### 第一步：看到精美的推广页面

您的朋友会看到一个漂亮的页面，包含：
- 假发店的介绍
- 产品图片和视频
- 门店地址和电话

### 第二步：填写联系方式

页面底部有一个表单，让朋友填写：
- **微信号** 或 **手机号**

填完点击"提交"，就会出现一个**专属核销二维码**。

### 第三步：保存核销码

系统会自动生成一个核销二维码，让朋友**保存到手机**。

### 第四步：到店核销

朋友到店后，出示二维码，玲姐扫码核销，朋友就能领礼品了！

### 重要提示：

- 朋友填了联系方式就算**有效访客**
- 朋友到店核销才算**成交**
- 成交后您才有**返现奖励**

所以要提醒朋友：**记得去店里看看，有礼品拿！**
    `
  },
  {
    id: 5,
    title: '返现规则说明',
    duration: '1分钟',
    icon: <Gift className="h-8 w-8" />,
    content: `
## 返现规则说明

### 返现周期：每3人一个轮回

根据您的推广方案，返现规则如下：

| 人数 | 300方案 | 100方案 |
|------|---------|---------|
| 第1人 | **100元** | **100元** |
| 第2人 | **200元** | **200元** |
| 第3人 | **300元** | **100元** |
| 第4人 | **100元** | **100元** |
| 第5人 | **200元** | **200元** |
| 第6人 | **300元** | **100元** |
| ... | 循环计算 | 循环计算 |

### 举个例子（300方案）：

小明推广了6个人到店成交：
- 第1人：100元
- 第2人：200元
- 第3人：300元
- 第4人：100元
- 第5人：200元
- 第6人：300元

**总共拿到：1200元！**

### 成交标准：

**必须到店核销才算成交！**

只扫码留资不算，必须朋友到店出示二维码，玲姐扫码核销后，才算成交。

### 返现时间：

- 成交后**即时到账**
- 可以随时找玲姐结算

### 查看进度：

打开您的推广员页面，可以随时查看：
- 有多少人扫码
- 有多少人成交
- 累计拿到多少返现
    `
  },
  {
    id: 6,
    title: '如何查看您的推广数据',
    duration: '1分钟',
    icon: <Clock className="h-8 w-8" />,
    content: `
## 如何查看您的推广数据？

### 访问您的专属页面

打开您的推广员页面，地址格式是：
**www.ljjf.fun/promoter/您的推广码**

例如，如果您的推广码是 ABC123，页面就是：
**www.ljjf.fun/promoter/ABC123**

### 页面显示的内容：

**访客数据**
- 总访问人数
- 提交联系方式的人数
- 每位访客的来源时间

**成交数据**
- 已核销人数
- 待核销人数
- 成交转化率

**返现数据**
- 累计返现金额
- 待结算金额
- 返现记录明细

### 手机随时查看

这个页面在手机上也能完美显示，随时掏出来看看自己的推广成果！

### 小贴士：

如果不确定自己的推广码，直接问玲姐就行！
    `
  },
  {
    id: 7,
    title: '常见问题解答',
    duration: '2分钟',
    icon: <Phone className="h-8 w-8" />,
    content: `
## 常见问题解答

### Q1：二维码会过期吗？

**不会！** 您的专属二维码永久有效，放心使用。

---

### Q2：一个人可以扫多次吗？

**可以**，但系统只记录一次。同一人多次扫码不影响数据准确性。

---

### Q3：朋友没填联系方式怎么办？

**没办法统计**。要提醒朋友填写联系方式，否则系统无法记录。

---

### Q4：朋友填了联系方式但没来店里怎么办？

**算访客但不算成交**。可以适当提醒朋友：到店有礼品，不看白不看！

---

### Q5：如何知道谁是我推广来的？

**联系玲姐**，她可以在后台看到详细的访客来源数据。

---

### Q6：返现什么时候结算？

**随时结算**。成交后找玲姐，当场就能拿到现金！

---

### Q7：可以发展下级推广员吗？

**不行**。为了合规，我们只做一级分销。但您可以介绍朋友来当推广员！

---

### Q8：还有其他问题怎么办？

**联系玲姐**：
- 电话：**13573755584**
- 微信：同电话号码

玲姐会耐心解答您的任何问题！
    `
  }
];

export default function TrainingPage() {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const [audioUrls, setAudioUrls] = useState<Record<number, string>>({});

  const chapter = chapters[currentChapter];
  const totalProgress = (completedChapters.length / chapters.length) * 100;

  // 标记章节完成
  const markComplete = () => {
    if (!completedChapters.includes(currentChapter)) {
      setCompletedChapters([...completedChapters, currentChapter]);
    }
  };

  // 下一章
  const nextChapter = () => {
    markComplete();
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  // 上一章
  const prevChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  // 播放/暂停音频
  const togglePlay = async () => {
    setIsPlaying(!isPlaying);
    
    // 模拟播放进度
    if (!isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            markComplete();
            return 100;
          }
          return prev + 2;
        });
      }, 100);
    }
  };

  // 获取音频
  const fetchAudio = async (chapterId: number) => {
    try {
      const response = await fetch('/api/training/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, text: chapter.content })
      });
      const data = await response.json();
      if (data.audioUrl) {
        setAudioUrls(prev => ({ ...prev, [chapterId]: data.audioUrl }));
      }
    } catch (error) {
      console.error('获取音频失败:', error);
    }
  };

  // 切换章节时获取音频
  useEffect(() => {
    if (!audioUrls[currentChapter]) {
      fetchAudio(currentChapter);
    }
  }, [currentChapter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-2">
            玲姐假发推广系统培训
          </h1>
          <p className="text-gray-600">轻松学会推广，赚钱更简单</p>
        </div>

        {/* 总进度 */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">学习进度</span>
              <span className="text-sm text-gray-500">{completedChapters.length}/{chapters.length} 章节</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </CardContent>
        </Card>

        {/* 章节导航 */}
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-6">
          {chapters.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => {
                setCurrentChapter(idx);
                setProgress(0);
                setIsPlaying(false);
              }}
              className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${
                idx === currentChapter 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg' 
                  : completedChapters.includes(idx)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {completedChapters.includes(idx) ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span className="text-xs font-bold">{ch.id}</span>
              )}
              <span className="text-xs truncate w-full text-center">{ch.title.slice(0, 4)}</span>
            </button>
          ))}
        </div>

        {/* 当前章节内容 */}
        <Card className="shadow-xl border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                {chapter.icon}
              </div>
              <div>
                <CardTitle className="text-xl">第{chapter.id}章：{chapter.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1 text-white/80">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">预计时长：{chapter.duration}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* 音频播放器 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-4">
                <Button
                  onClick={togglePlay}
                  size="lg"
                  className="rounded-full w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                </Button>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {isPlaying ? '正在播放...' : '点击播放语音讲解'}
                    </span>
                    <span className="text-xs text-gray-500">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                {audioUrls[currentChapter] && (
                  <a 
                    href={audioUrls[currentChapter]} 
                    download={`第${chapter.id}章-${chapter.title}.mp3`}
                    className="p-2 text-gray-500 hover:text-purple-500"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>

            {/* 章节内容 */}
            <div className="prose prose-sm max-w-none">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: chapter.content
                    .replace(/## (.*)/g, '<h2 class="text-xl font-bold text-purple-700 mt-4 mb-2">$1</h2>')
                    .replace(/### (.*)/g, '<h3 class="text-lg font-semibold text-gray-800 mt-3 mb-2">$1</h3>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-600">$1</strong>')
                    .replace(/---/g, '<hr class="my-4 border-gray-200" />')
                    .replace(/\n\n/g, '</p><p class="mb-3">')
                    .replace(/\n/g, '<br />')
                    .replace(/\|(.*)\|/g, (match) => {
                      const cells = match.split('|').filter(c => c.trim());
                      if (cells.length === 2) {
                        return `<div class="flex justify-between py-2 border-b border-gray-100"><span>${cells[0]}</span><span class="font-semibold text-purple-600">${cells[1]}</span></div>`;
                      }
                      return match;
                    })
                }}
              />
            </div>

            {/* 导航按钮 */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={prevChapter}
                disabled={currentChapter === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                上一章
              </Button>
              
              {completedChapters.includes(currentChapter) ? (
                <Badge variant="default" className="bg-green-500 gap-1 px-3 py-1">
                  <CheckCircle className="h-4 w-4" />
                  已完成
                </Badge>
              ) : (
                <Button
                  onClick={markComplete}
                  variant="outline"
                  className="gap-2 border-green-300 text-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  标记完成
                </Button>
              )}
              
              <Button
                onClick={nextChapter}
                disabled={currentChapter === chapters.length - 1}
                className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                下一章
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 底部提示 */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>如有疑问，请联系玲姐：13573755584</p>
          <p className="mt-1">培训完成后，您就可以开始推广赚钱啦！</p>
        </div>
      </div>
    </div>
  );
}
