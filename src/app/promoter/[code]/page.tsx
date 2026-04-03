'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function PromoterPage() {
  const params = useParams();
  const code = params.code as string;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (!code) return;

    fetch(`/api/promoter/${code}`)
      .then(res => res.json())
      .then(result => {
        if (result.data) {
          setData(result.data);
          setQrCodeUrl(`/api/promoter/${code}/qrcode`);
        } else {
          setError(result.error || '获取数据失败');
        }
        setLoading(false);
      })
      .catch(err => {
        setError('获取数据失败');
        setLoading(false);
      });
  }, [code]);

  const copyLink = () => {
    const url = `${window.location.origin}/p/${code}`;
    navigator.clipboard.writeText(url);
    alert('链接已复制');
  };

  const downloadQR = () => {
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `推广二维码_${code}.png`;
    a.click();
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <p>加载中...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>推广者不存在</h1>
        <p>{error}</p>
      </div>
    );
  }

  const visitors = data.visitorRecords || [];
  const visitorsWithWechat = visitors.filter((v: any) => v.wechat_id);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>推广者后台</h1>
      <p>欢迎, {data.promoter?.name}!</p>

      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '8px' }}>
        <p><strong>微信使用说明：</strong>由于微信限制，建议下载二维码图片发朋友圈</p>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>推广二维码</h2>
        {qrCodeUrl && (
          <div style={{ marginTop: '10px' }}>
            <img src={qrCodeUrl} alt="二维码" style={{ width: '200px', height: '200px' }} />
          </div>
        )}
        <button 
          onClick={downloadQR}
          style={{ 
            marginTop: '15px', 
            padding: '10px 20px', 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          下载二维码
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>推广链接</h2>
        <p style={{ wordBreak: 'break-all', marginTop: '10px' }}>
          {window.location.origin}/p/{code}
        </p>
        <button 
          onClick={copyLink}
          style={{ 
            marginTop: '10px', 
            padding: '10px 20px', 
            background: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          复制链接
        </button>
      </div>

      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.stats?.uniqueVisitors || 0}</p>
          <p>独立访客</p>
        </div>
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.stats?.totalVisits || 0}</p>
          <p>总访问量</p>
        </div>
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>{data.stats?.wechatSubmissions || 0}</p>
          <p>留微信号</p>
        </div>
      </div>

      {visitorsWithWechat.length > 0 && (
        <div style={{ marginTop: '20px', padding: '20px', background: '#d4edda', borderRadius: '8px' }}>
          <h3>有 {visitorsWithWechat.length} 位访客留下微信号</h3>
          {visitorsWithWechat.map((v: any, i: number) => (
            <div key={i} style={{ marginTop: '10px', padding: '10px', background: 'white', borderRadius: '5px' }}>
              <p>微信号: <strong>{v.wechat_id}</strong></p>
              <p>时间: {v.created_at}</p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(v.wechat_id);
                  alert('已复制');
                }}
                style={{ 
                  marginTop: '5px', 
                  padding: '5px 10px', 
                  background: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                复制
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>访客记录</h3>
        {visitors.length === 0 ? (
          <p>暂无记录</p>
        ) : (
          <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>微信号</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>时间</th>
              </tr>
            </thead>
            <tbody>
              {visitors.slice(0, 10).map((v: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{v.wechat_id || '-'}</td>
                  <td style={{ padding: '10px' }}>{v.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
