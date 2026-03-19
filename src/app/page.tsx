import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Settings, Users, Eye, QrCode, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">假发店推广管理系统</h1>
          <p className="text-gray-600 text-lg">
            专业的推广分销溯源系统，让每一笔推广都有迹可循
          </p>
        </div>

        {/* 微信使用提示 */}
        <Alert className="mb-8 border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">微信推广重要说明</AlertTitle>
          <AlertDescription className="text-orange-700">
            <p className="mb-2">由于微信安全机制，直接发送链接可能被拦截。请按以下方式使用：</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>在管理后台创建推广者后，<strong>点击二维码图标下载二维码图片</strong></li>
              <li>将二维码图片发给推广者</li>
              <li>推广者在朋友圈发布二维码图片 + 吸引人的文案</li>
              <li>用户扫码后会自动跳转到推广页面</li>
            </ol>
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-3">
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

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">使用流程</h2>
          <div className="grid gap-4 md:grid-cols-5">
            <Card className="text-center p-4">
              <div className="text-3xl font-bold text-purple-500 mb-2">1</div>
              <p className="text-sm">管理员创建推广者账号</p>
            </Card>
            <Card className="text-center p-4">
              <div className="text-3xl font-bold text-purple-500 mb-2">2</div>
              <p className="text-sm">下载二维码图片发给推广者</p>
            </Card>
            <Card className="text-center p-4">
              <div className="text-3xl font-bold text-purple-500 mb-2">3</div>
              <p className="text-sm">推广者发朋友圈推广</p>
            </Card>
            <Card className="text-center p-4">
              <div className="text-3xl font-bold text-purple-500 mb-2">4</div>
              <p className="text-sm">访客扫码自动记录</p>
            </Card>
            <Card className="text-center p-4">
              <div className="text-3xl font-bold text-purple-500 mb-2">5</div>
              <p className="text-sm">查看数据和联系方式</p>
            </Card>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            微信推广技巧
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li>• <strong>使用二维码图片</strong>：比直接发链接更安全，不会被拦截</li>
            <li>• <strong>配上吸引人的文案</strong>：如"限时优惠"、"扫码领福利"等</li>
            <li>• <strong>多渠道推广</strong>：朋友圈、微信群、私聊都可以用同一个二维码</li>
            <li>• <strong>及时跟进</strong>：看到访客留下微信号后及时联系</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
