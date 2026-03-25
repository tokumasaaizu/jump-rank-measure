import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Chip,
  Divider,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';

import DetailHeaderNavi from './components/Nav/detailpageheader';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import Papa from 'papaparse';
import Footer from "./components/Footer/footer";

type RankingRow = {
  issue_label: string;
  title: string;
  rank_num: number;
};

interface NDLResponse {
  title: string;
  link: string;
  description: string;
  isbn: string;
  publisher: string;
  pubDate: string;
}

const parseNDLXML = (xmlText: string): NDLResponse[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  const items = xmlDoc.getElementsByTagName("item");
  
  const results: NDLResponse[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const result: NDLResponse = {
      title: item.getElementsByTagName("title")[0]?.textContent?.trim() || "",
      link: item.getElementsByTagName("link")[0]?.textContent?.trim() || "",
      description: item.getElementsByTagName("description")[0]?.textContent?.trim() || "",
      isbn: item.getElementsByTagName("dc:identifier")[0]?.textContent?.replace("ISBN:", "").trim() || "",
      publisher: item.getElementsByTagName("dc:publisher")[0]?.textContent?.trim() || "",
      pubDate: item.getElementsByTagName("dc:date")[0]?.textContent?.trim() || "",
    };
    results.push(result);
  }
  return results;
};

{/*const fetchNDLData = async (title: string, existingManga?: MangaDetail): Promise<Volume[]> => {
  try {
    const baseUrl = "https://ndlsearch.ndl.go.jp/rss/ndls/bib.xml";
    const params = new URLSearchParams();
  
    // 基本パラメータの設定
    params.append('cs', 'bib');
    params.append('display', 'panel');
    params.append('from', '0');
    params.append('size', '200');
    params.append('append', '20');
    params.append('sort', 'published:desc');
    params.append('keyword', `${title} ジャンプコミックス`);
    
    // 複数のf-htパラメータを追加
    params.append('f-ht', 'ndl');
    params.append('f-ht', 'library');

    const response = await fetch(`${baseUrl}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`NDL API request failed: ${response.status}`);
    }

    const xmlText = await response.text();
    console.log('API Response:', xmlText.substring(0, 200) + '...');
    
    const ndlData = parseNDLXML(xmlText);
    
    if (ndlData.length === 0) {
      console.warn('No data found from NDL API');
      return [];
    }

    // NDLのデータをVolumeインターフェースの形式に変換
    const volumes = ndlData
      .map((item, index) => {
        const volumeMatch = item.title.match(/(?:\s|^)(\d+)(?:巻|\s*\/)/);        
        // 巻数が見つかった場合はその数値を、見つからない場合はindexを使用
        const volumeNumber = volumeMatch ? parseInt(volumeMatch[1], 10) : index + 1;
        
        // 既存のボリュームデータから同じ巻数のものを探す
        const existingVolume = existingManga?.volumes?.find((v: Volume) => v.volume === volumeNumber);
        return {
          volume: volumeNumber,
          releaseDate: new Date(item.pubDate).toISOString(),
          coverImage: existingVolume?.coverImage || "/default-cover.jpg",
          price: existingVolume?.price || 0,
          isbn: item.isbn,
          description: item.description,
          pages: existingVolume?.pages || 0,
        };
      })
      .sort((a, b) => a.volume - b.volume);

    return volumes;
  } catch (error) {
    console.error('Error in fetchNDLData:', error);
    return [];
  }
};*/}

interface MangaDetail {
  title: string;
  //volumes: Volume[];
  author: string;
  publisher: string;
  magazine: string;
  demographic: string;
  genres: string[];
  startDate: string;
}

interface Work {
  id: number;
  work_id: number;
  title: string;
  title_kana: string;
  title_eng: string;
  author: string;
  serialization_start_date: string;
  end_flg: boolean;
  story: string;
  genre: string;
  created_at: string;
  updated_at: string;
  peak_rank: number;
  status: string;
  image_url: string;
  official_url: string;
};

interface Volume {
  volume: number;
  releaseDate: string;
  coverimage: string;
  price: number;
  isbn: string;
  description: string;
  pages: number;
}

interface RankingData {
  title: string;
  [key: string]: string | number;
}



const DetailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [mangaDetail, setMangaDetail] = useState<Work | null>(null);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [rankingData, setRankingData] = useState<RankingData[]>([]);
  const [data, setData] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const title = searchParams.get('title');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 漫画詳細の取得
        if (!title) return;
        const detailResponse = await fetch(`http://localhost:8080/work/${encodeURIComponent(title)}`);
        const detailData = await detailResponse.json();
        //let manga = detailData.manga.find((m: MangaDetail) => m.title === title);

        if (!mangaDetail?.title) {
            // タイトルが存在することを確認
            if (!title) {
              console.error('Title is empty or null');
              return;
            }
        }

       //console.log(detailData);
        
        setMangaDetail(detailData || null);

        // ランキングデータの取得
        fetch("http://localhost:8080/ranking")
        .then((response) => response.json())
        .then((rows: RankingRow[]) => {
          // =========================================
          // ① issueごとにまとめて「横持ち」形式へ変換
          // =========================================
          const grouped: { [issue: string]: any } = {};
          
          rows.forEach((row) => {
          if (!grouped[row.issue_label]) {
            grouped[row.issue_label] = {
              title: row.issue_label,
            };
          }

          grouped[row.issue_label][row.title] = row.rank_num;
          });

          const parsedData = Object.values(grouped);
          //setData(parsedData);
          setRankingData(parsedData);
        })

       

        //const rankingResponse = await fetch('/jumprank/past-ranking-data.csv');
        //const rankingText = await rankingResponse.text();

        //grouped[row.issue_label][row.title] = row.rank_num;
        //});

        //const parsedData = Object.values(grouped);

        //const parsed = Papa.parse(rankingText, {
          //header: true,
          //skipEmptyLines: true,
          //dynamicTyping: true,
        //});
        //setRankingData(parsed.data as RankingData[]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }

    }; // fetchData

    fetchData();
  }, [title]);

console.log(rankingData);

  useEffect(() => {
    const fetchVolumeData = async () => {
      if (!mangaDetail) return;

      try {
        const res = await fetch(
          `http://localhost:8080/volumes?work_id=${mangaDetail.work_id}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch volumes");
        }

        const data: Volume[] = await res.json();
        setVolumes(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchVolumeData();
  }, [mangaDetail]);


  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!mangaDetail) {
    return (
      <Container>
        <Typography color="error">漫画が見つかりませんでした。</Typography>
      </Container>
    );
  }

  return (
    <>
      <DetailHeaderNavi />
      <Container>
        <Box sx={{ py: 4 }}>
          {/* 基本情報 */}
          <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              {mangaDetail.title}
            </Typography>
            <Box sx={{ mb: 2 }}>
              {/**{mangaDetail.genres.map((genre) => (
                <Chip
                  key={genre}
                  label={genre}
                  sx={{ mr: 1, mb: 1, backgroundColor: '#009879', color: 'white' }}
                />
              ))}*/}
            </Box>
            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>作者：</strong> {mangaDetail.author}
                </Typography>
               {/**
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>ジャンル：</strong> {mangaDetail.demographic}
                </Typography>
                <Typography variant="body1">
                  <strong>連載開始：</strong>{new Date(mangaDetail.serialization_start_date).toLocaleDateString('ja-JP')}
                </Typography>*/}
            </Grid>
          </Paper>


          {/* ランキング推移グラフ */}
          <Paper elevation={0} sx={{ p: 3, mt: 4, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
              掲載順位の推移
            </Typography>
            <Box sx={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <LineChart
                  //data={rankingData}
                  data={[...rankingData].reverse()} //
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" />
                  <YAxis reversed />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={title || ""}
                    stroke="#009879"
                    dot={{ stroke: '#009879', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>


          {/* ランキング順位表 */}
          <Paper elevation={0} sx={{ p: 3, mt: 4, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
            <style>
              {`
                .styled-table {
                  border-collapse: collapse;
                  margin: 20px 0;
                  font-size: 16px;
                  min-width: 400px;
                  box-shadow: 0 0 10px rgba(0,0,0,0.08);
                }
                .styled-table thead tr {
                  background-color: #009879;
                  color: #ffffff;
                  text-align: left;
                }
                .styled-table th,
                .styled-table td {
                  padding: 12px 15px;
                  border: 1px solid #dddddd;
                }
                .styled-table tbody tr {
                  border-bottom: 1px solid #dddddd;
                  background-color: #f3f3f3;
                }
                .styled-table tbody tr:nth-of-type(even) {
                  background-color: #e9f7f6;
                }
                .styled-table tbody tr:hover {
                  background-color: #b7eadc;
                  cursor: pointer;
                }
              `}
            </style>

            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
              掲載順位一覧
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table className="styled-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ 
                      backgroundColor: '#009879',
                      color: 'white',
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dddddd'
                    }}>
                      号数
                    </th>
                    <th style={{ 
                      backgroundColor: '#009879',
                      color: 'white',
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dddddd'
                    }}>
                      順位
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rankingData
                    .map((data, index) => ({
                      title: data.title,
                      rank: data[title || ""] as number
                    }))
                    .filter(item => item.rank !== undefined)
                    .map((item, index) => (
                      <tr key={item.title} style={{
                        backgroundColor: index % 2 === 0 ? '#f3f3f3' : '#ffffff',
                        borderBottom: '1px solid #dddddd',
                        transition: 'background-color 0.3s'
                      }}>
                        <td style={{ padding: '12px' }}>{item.title}</td>
                        <td style={{ padding: '12px' }}>{item.rank}位</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </Box>
          </Paper>



            {/* 単行本リスト */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ mt:3 , mb: 3, fontWeight: 'bold' }}>
            最新単行本
          </Typography>
          
          <Grid container spacing={3}>
            {volumes.map((volume) => (
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)'
                  }
                }}>
                  <CardMedia
                    component="img"
                    sx={{ 
                      height: 300,
                      objectFit: 'contain',
                      bgcolor: '#f5f5f5'
                    }}
                    image={
                      volume.coverimage
                        ? `https://www.shonenjump.com${volume.coverimage}`
                        : "/default-cover.jpg"
                    }
                    alt={`第${volume.volume}巻カバー`}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      第{volume.volume}巻
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {volume.description}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      発売日: {new Date(volume.releaseDate).toLocaleDateString('ja-JP')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      価格: ¥{volume.price.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ページ数: {volume.pages}ページ
                    </Typography>
                  </CardContent>
                </Card>
            ))}
          </Grid>

        </Box>
      </Container>
      <Footer/>
    </>
  );
}


export default DetailPage;