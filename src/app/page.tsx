import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle, 
  ArrowRight, 
  Play, 
  QrCode,
  Zap,
  Settings,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">假发店推广管理系统</h1>
          <p className="text-gray-600 text-lg">
            用二维码图片发朋友圈，立即可用，不会被拦截
          </p>
        </div>

        {/* 核心提示 */}
        <Alert className="mb-8 border-green-200 bg-green-50">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 text-lg">好消息：现在就可以用了！</AlertTitle>
          <AlertDescription className="text-green-700">
            <p className="mb-3">
              用二维码图片发朋友圈，用户扫码就能访问！不需要购买域名！
            </p>
            <Link href="/quickstart">
              <Button className="gap-2" size="lg">
                <Play className="h-4 w-4" />
                查看快速开始指南
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </AlertDescription>
        </Alert>

        {/* 功能亮点 */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="text-center p-4">
            <QrCode className="h-10 w-10 text-purple-500 mx-auto mb-2" />
            <p className="font-medium">二维码推广</p>
            <p className="text-sm text-gray-500">图片发朋友圈不拦截</p>
          </Card>
          <Card className="text-center p-4">
            <Zap className="h-10 w-10 text-orange-500 mx-auto mb-2" />
            <p className="font-medium">立即可用</p>
            <p className="text-sm text-gray-500">无需购买域名</p>
          </Card>
          <Card className="text-center p-4">
            <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
            <p className="font-medium">完整溯源</p>
            <p className="text-sm text-gray-500">访客IP、时间、微信号</p>
          </Card>
        </div>

        {/* 快速入口 */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-2 border-green-200 bg-green-50 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Play className="h-5 w-5" />
                快速开始
              </CardTitle>
              <CardDescription className="text-green-600">
                5步上手，用二维码图片开始推广
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/quickstart">
                <Button className="w-full" variant="default">
                  查看使用指南
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                管理后台
              </CardTitle>
              <CardDescription>
                上传内容、管理推广者、查看数据
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="w-full" variant="outline">
                  进入管理后台
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* 底部提示 */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            想要直接发链接？{' '}
            <Link href="/tutorial" className="text-blue-600 hover:underline">
              查看域名购买教程
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
