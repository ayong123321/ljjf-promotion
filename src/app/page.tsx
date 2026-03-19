import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Settings, Users, Eye, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">假发店推广管理系统</h1>
          <p className="text-gray-600 text-lg">
            专业的推广分销溯源系统，让每一笔推广都有迹可循
          </p>
        </div>

        {/* 重要提示：微信拦截 */}
        <Alert className="mb-8 border-red-200 bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800 text-lg">微信用户必看</AlertTitle>
          <AlertDescription className="text-red-700">
            <p className="mb-3">
              当前域名被微信安全机制拦截，链接无法在微信直接打开。
              <strong>您需要购买并备案自己的域名才能在微信正常使用！</strong>
            </p>
            <Link href="/tutorial">
              <Button className="gap-2" variant="destructive">
                <BookOpen className="h-4 w-4" />
                查看域名购买备案教程
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </AlertDescription>
        </Alert>

        {/* 教程入口卡片 */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <BookOpen className="h-6 w-6" />
              域名购买备案教程
            </CardTitle>
            <CardDescription className="text-blue-600">
              跟着教程操作，让您的链接可以在微信正常打开
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">30-70元</div>
                <div className="text-sm text-blue-500">首年费用</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">免费</div>
                <div className="text-sm text-blue-500">备案费用</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">7-25天</div>
                <div className="text-sm text-blue-500">完成时间</div>
              </div>
            </div>
            <Link href="/tutorial">
              <Button className="w-full" size="lg">
                查看详细教程
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 功能入口 */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Settings className="h-10 w-10 text-purple-500 mb-2" />
              <CardTitle>管理员后台</CardTitle>
              <CardDescription>
                管理推广者、上传推广内容、查看数据统计
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="w-full">
                  进入管理后台
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-10 w-10 text-blue-500 mb-2" />
              <CardTitle>推广者后台</CardTitle>
              <CardDescription>
                查看专属推广链接、统计数据、访客记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                推广者通过专属链接访问
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Eye className="h-10 w-10 text-green-500 mb-2" />
              <CardTitle>推广落地页</CardTitle>
              <CardDescription>
                展示推广内容、记录访客信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                访客通过推广链接访问
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 使用流程 */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold mb-6 text-center">完整使用流程</h2>
          
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="font-bold text-orange-800 mb-3">第一步：准备域名（必需）</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-orange-700">
                <li>在阿里云购买域名（30-70元/年）</li>
                <li>完成实名认证（1-3天）</li>
                <li>进行ICP备案（5-20天，免费）</li>
                <li>获得备案号后联系我配置</li>
              </ol>
              <Link href="/tutorial">
                <Button variant="outline" className="mt-3 w-full" size="sm">
                  查看详细教程
                </Button>
              </Link>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-bold text-green-800 mb-3">第二步：开始使用</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-green-700">
                <li>进入管理后台创建推广者</li>
                <li>上传推广内容和图片</li>
                <li>将链接发给推广者</li>
                <li>推广者发朋友圈推广</li>
                <li>查看访客数据和联系方式</li>
              </ol>
              <Link href="/admin">
                <Button variant="outline" className="mt-3 w-full" size="sm">
                  进入管理后台
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
