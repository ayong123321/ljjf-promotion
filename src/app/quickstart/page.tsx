import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Download, 
  QrCode, 
  ArrowRight, 
  Users, 
  Image as ImageIcon, 
  BarChart2,
  MessageCircle,
  Share2
} from 'lucide-react';
import Link from 'next/link';

export default function QuickStartPage() {
  const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://439a0333-2b4f-48ab-a2a5-c6e2506a2e5f.dev.coze.site';
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <Badge className="mb-4" variant="secondary">无需购买域名，立即可用</Badge>
          <h1 className="text-3xl font-bold mb-2">快速开始使用</h1>
          <p className="text-gray-600">用二维码图片发朋友圈，不会被微信拦截</p>
        </div>

        {/* 核心提示 */}
        <Alert className="mb-8 border-green-200 bg-green-50">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 text-lg">二维码图片可以正常发朋友圈！</AlertTitle>
          <AlertDescription className="text-green-700">
            微信拦截的是"链接"，不是"图片"。推广者用二维码图片发朋友圈，用户扫码就能访问！
          </AlertDescription>
        </Alert>

        {/* 使用步骤 */}
        <div className="space-y-6">
          {/* 步骤1 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>第一步：上传推广内容</CardTitle>
                  <CardDescription>添加要展示的图片和文字</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                在管理后台上传您的假发产品图片，填写宣传文案。访客点击二维码后会看到这些内容。
              </p>
              <Link href="/admin">
                <Button>
                  进入管理后台
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 步骤2 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>第二步：创建推广者</CardTitle>
                  <CardDescription>添加兼职推广人员</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                创建推广者账号，系统会自动生成专属推广码。每个推广者的数据独立统计。
              </p>
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-2">已有推广者：</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">田勇</span>
                    <Badge variant="outline">6OAQBQ92</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">测试推广员</span>
                    <Badge variant="outline">PBHOSFU4</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 步骤3 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Download className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle>第三步：下载二维码图片</CardTitle>
                  <CardDescription>发给推广者发朋友圈</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="text-gray-600">
                    在管理后台点击 <QrCode className="h-4 w-4 inline" /> 图标下载二维码图片，发给推广者。
                  </p>
                  <p className="text-gray-600">
                    或者推广者自己登录后台下载：
                  </p>
                  <div className="bg-gray-100 rounded p-2 text-sm">
                    <p className="text-gray-500">推广者后台链接：</p>
                    <p className="text-blue-600 break-all">{baseUrl}/promoter/6OAQBQ92</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="border rounded-lg p-4 bg-white">
                    <img 
                      src={`${baseUrl}/api/qrcode?url=${encodeURIComponent(`${baseUrl}/p/6OAQBQ92`)}`}
                      alt="示例二维码"
                      className="w-40 h-40"
                    />
                    <p className="text-center text-sm text-gray-500 mt-2">田勇的推广二维码</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 步骤4 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Share2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>第四步：推广者发朋友圈</CardTitle>
                  <CardDescription>配上吸引人的文案</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                <p className="font-medium mb-3">朋友圈文案示例：</p>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>🔥 假发新品上市！品质超好！</p>
                  <p>✨ 自然逼真，戴着超舒服</p>
                  <p>💬 有兴趣扫码了解详情~</p>
                  <p className="text-gray-400">[配上二维码图片]</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 步骤5 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <BarChart2 className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle>第五步：查看数据</CardTitle>
                  <CardDescription>追踪访客和联系方式</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                访客扫码后会自动记录IP和时间，如果留下微信号，您可以在后台看到。
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-100 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-700">独立访客</p>
                  <p className="text-sm text-gray-500">不同IP数量</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-700">总访问量</p>
                  <p className="text-sm text-gray-500">点击次数</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-700">微信号</p>
                  <p className="text-sm text-gray-500">留联系方式</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 快速入口 */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <Link href="/admin">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">管理后台</p>
                    <p className="text-sm text-gray-500">上传内容、管理推广者、查看数据</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/tutorial">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">域名备案教程</p>
                    <p className="text-sm text-gray-500">想直接发链接？看这个</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
