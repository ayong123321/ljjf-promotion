import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Clock, DollarSign, HelpCircle, ExternalLink } from 'lucide-react';

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">域名购买与备案教程</h1>
          <p className="text-gray-600">跟着教程操作，大约 10-25 个工作日完成</p>
        </div>

        {/* 时间和费用预估 */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Clock className="h-5 w-5" />
                时间预估
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>注册阿里云</span>
                  <span className="font-medium">10分钟</span>
                </div>
                <div className="flex justify-between">
                  <span>购买域名</span>
                  <span className="font-medium">10分钟</span>
                </div>
                <div className="flex justify-between">
                  <span>实名认证</span>
                  <span className="font-medium">1-3天</span>
                </div>
                <div className="flex justify-between">
                  <span>ICP备案</span>
                  <span className="font-medium">5-20天</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-bold">总计</span>
                  <span className="font-bold text-blue-600">7-25天</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <DollarSign className="h-5 w-5" />
                费用预估
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>.cn 域名</span>
                  <span className="font-medium">29-40元/年</span>
                </div>
                <div className="flex justify-between">
                  <span>.com 域名</span>
                  <span className="font-medium">55-70元/年</span>
                </div>
                <div className="flex justify-between">
                  <span>ICP备案</span>
                  <span className="font-medium text-green-600">免费</span>
                </div>
                <div className="flex justify-between">
                  <span>域名解析</span>
                  <span className="font-medium text-green-600">免费</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-bold">首年总费用</span>
                  <span className="font-bold text-green-600">约30-70元</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 步骤一：购买域名 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">1</div>
              <div>
                <CardTitle>购买域名</CardTitle>
                <CardDescription>在阿里云购买一个属于您的域名</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <ExternalLink className="h-4 w-4" />
              <AlertTitle>阿里云域名注册</AlertTitle>
              <AlertDescription>
                <a href="https://wanwang.aliyun.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                  https://wanwang.aliyun.com/
                </a>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">注册阿里云账号</p>
                  <p className="text-sm text-gray-600">使用手机号注册，完成实名认证（需要身份证）</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">搜索域名</p>
                  <p className="text-sm text-gray-600">输入想要的域名，如 "mywigshop"、"wigshop" 等</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">选择后缀</p>
                  <p className="text-sm text-gray-600">
                    推荐 <Badge variant="secondary">.cn</Badge> 最便宜（29-40元/年）或 <Badge variant="secondary">.com</Badge> 最通用（55-70元/年）
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">购买并实名认证</p>
                  <p className="text-sm text-gray-600">支付后需要上传身份证进行实名认证，1-3个工作日通过</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 步骤二：ICP备案 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">2</div>
              <div>
                <CardTitle>ICP备案</CardTitle>
                <CardDescription>所有中国大陆网站必须备案，完全免费</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTitle className="text-orange-800">重要提示</AlertTitle>
              <AlertDescription className="text-orange-700">
                备案期间网站不能访问，但可以先开发测试
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">进入备案系统</p>
                  <p className="text-sm text-gray-600">
                    阿里云搜索"ICP备案"或访问 
                    <a href="https://beian.aliyun.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                      beian.aliyun.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">准备材料</p>
                  <div className="text-sm text-gray-600 mt-1 space-y-1">
                    <p>• 身份证正反面照片</p>
                    <p>• 手持身份证照片（阿里云APP可拍摄）</p>
                    <p>• 域名证书（域名控制台下载）</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">填写网站信息</p>
                  <div className="text-sm text-gray-600 mt-1 space-y-1">
                    <p>• 网站名称：<code className="bg-gray-100 px-1 rounded">假发推广平台</code> 或 <code className="bg-gray-100 px-1 rounded">个人推广网站</code></p>
                    <p>• 网站备注：<code className="bg-gray-100 px-1 rounded">个人推广分销系统</code></p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">提交审核</p>
                  <div className="text-sm text-gray-600 mt-1">
                    <p>阿里云初审（1天）→ 短信核验 → 管局审核（5-20天）→ 收到备案号</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 步骤三：域名解析 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">3</div>
              <div>
                <CardTitle>域名解析配置</CardTitle>
                <CardDescription>备案成功后，配置域名指向服务器</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="border-green-200 bg-green-50">
              <AlertTitle className="text-green-800">这一步我来帮您！</AlertTitle>
              <AlertDescription className="text-green-700">
                备案成功后，把备案号发给我，我会告诉您如何配置解析
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* 常见问题 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              常见问题
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Q: 个人能备案吗？</p>
                <p className="text-sm text-gray-600 mt-1">A: 可以！个人备案完全合法，只是网站名称不能用企业相关词汇。</p>
              </div>
              <div>
                <p className="font-medium">Q: 备案收费吗？</p>
                <p className="text-sm text-gray-600 mt-1">A: 阿里云备案完全免费！</p>
              </div>
              <div>
                <p className="font-medium">Q: 备案后能改网站内容吗？</p>
                <p className="text-sm text-gray-600 mt-1">A: 只要不涉及违法内容，正常修改没问题。</p>
              </div>
              <div>
                <p className="font-medium">Q: 没有电脑怎么办？</p>
                <p className="text-sm text-gray-600 mt-1">A: 可以用手机操作，阿里云APP可以完成大部分流程。</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 完成后 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">完成后告诉我</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-blue-700">当您收到备案号后（格式如：<code className="bg-blue-100 px-2 py-0.5 rounded">京ICP备12345678号</code>），请告诉我：</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-600">
                <li>您的域名是什么</li>
                <li>备案号是什么</li>
              </ol>
              <p className="text-blue-700 mt-4">我会帮您配置域名解析，绑定到您的推广系统，确保微信可以正常访问！</p>
            </div>
          </CardContent>
        </Card>

        {/* 返回按钮 */}
        <div className="text-center mt-8">
          <a href="/admin">
            <Button variant="outline">返回管理后台</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
