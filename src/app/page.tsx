import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Users, Eye } from 'lucide-react';
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

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>使用说明：</p>
          <ol className="mt-2 space-y-1 list-decimal list-inside text-left max-w-md mx-auto">
            <li>管理员创建推广者账号，获取专属推广码</li>
            <li>推广者使用专属链接发朋友圈推广</li>
            <li>访客点击链接，自动记录访客信息</li>
            <li>访客可自愿留下微信号，方便后续联系</li>
            <li>管理员和推广者均可查看推广数据</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
