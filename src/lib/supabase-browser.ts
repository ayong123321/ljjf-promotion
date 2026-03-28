import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;
let configPromise: Promise<{ url: string; anonKey: string }> | null = null;

// 获取 Supabase 配置
async function getSupabaseConfig(): Promise<{ url: string; anonKey: string }> {
  if (configPromise) {
    return configPromise;
  }

  configPromise = fetch('/api/config/supabase')
    .then(res => res.json())
    .then(data => {
      if (!data.url || !data.anonKey) {
        throw new Error('无法获取 Supabase 配置');
      }
      return { url: data.url, anonKey: data.anonKey };
    });

  return configPromise;
}

// 获取 Supabase 浏览器端客户端
export async function getSupabaseBrowserClient(): Promise<SupabaseClient> {
  if (client) {
    return client;
  }

  const { url, anonKey } = await getSupabaseConfig();

  client = createClient(url, anonKey, {
    auth: {
      persistSession: false,
    },
  });

  return client;
}

// 直接上传文件到 Supabase Storage
export async function uploadToSupabaseStorage(
  file: File,
  type: 'image' | 'video'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = await getSupabaseBrowserClient();
    const bucketName = 'promotions';
    
    // 生成文件名
    const ext = file.name.split('.').pop() || (type === 'image' ? 'jpg' : 'mp4');
    const fileName = `${type}s/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    console.log(`开始上传文件: ${fileName}, 大小: ${file.size} bytes`);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('上传失败:', error);
      return { success: false, error: error.message };
    }

    console.log(`上传成功: ${data.path}`);

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error('上传异常:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '上传失败，请重试' 
    };
  }
}
