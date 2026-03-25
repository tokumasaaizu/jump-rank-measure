import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Box, Container, Grid, Typography, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import HomeHeaderNavi from './components/Nav/homepageheader';
import { useNavigate, Link } from 'react-router-dom';
import Footer from "./components/Footer/footer";
import { json } from "stream/consumers";

type DataRow = {
  [key: string]: any;
  title?: string;
  date?: string;
  week?: string;
};

type RankingRow = {
  issue_label: string;
  title: string;
  rank_num: number;
};

type SeriesRanking = {
  series: string;
  average: number;
};

const LineChartFromCSV: React.FC = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [datathisweek, setDataThisWeek] = useState<DataRow[]>([]);
  //const [rankThisWeek, setRankThisWeek] = useState<RankingRow>([]);
  const [displayPeriod, setDisplayPeriod] = useState<number>(4); // 表示期間（週数）
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [topSeries, setTopSeries] = useState<string[]>([]);
  const [displayCount, setDisplayCount] = useState<number>(5); // 表示する作品数
  const [averageRankings, setAverageRankings] = useState<SeriesRanking[]>([]);
  
  // 各作品の表示状態を管理
  const [visibleSeries, setVisibleSeries] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    //fetch("/past-ranking-data.csv")
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
        
        // =========================================
        // ② 作品カラム取得
        // =========================================
        const seriesColumns = Array.from(
          new Set(rows.map((r) => r.title))
        );

        // =========================================
        // ③ 平均順位計算（今までと同じロジック）
        // =========================================
        const seriesRankings: {
          [key: string]: { sum: number; count: number };
        } = {};
          
          // 各作品の順位の合計とデータ数を集計
        parsedData.forEach((row: any) => {
          seriesColumns.forEach((series) => {
            if (!seriesRankings[series]) {
              seriesRankings[series] = { sum: 0, count: 0 };
            }

            const rank = row[series];
            if (typeof rank === "number") {
              seriesRankings[series].sum += rank;
              seriesRankings[series].count += 1;
            }
          });
        });

        // 平均順位を計算してソート
        const rankings = Object.entries(seriesRankings)
          .map(([series, stats]) => ({
            series,
            average: stats.sum / stats.count,
          }))
          .sort((a, b) => a.average - b.average);// 平均順位が低い（上位の）順にソート

        setAverageRankings(rankings);

          
        // 上位作品の選出
        const topSeriesNames = rankings
        .slice(0, displayCount)
        .map((item) => item.series);

        setTopSeries(topSeriesNames);

        const initialVisibility = seriesColumns.reduce(
          (acc, series) => ({
            ...acc,
            [series]: topSeriesNames.includes(series),
          }),
          {}
        );

        setVisibleSeries(initialVisibility);

        setData(parsedData);
        setFilteredData(parsedData.slice(0, displayPeriod));
      }); // then


    //fetch("/new-ranking-data.csv")
    // 今週の連載順位
    /**fetch("/jumprank/new-ranking-data.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        });
        setDataThisWeek(parsed.data as DataRow[]);
      });*/

    fetch("http://localhost:8080/ranking?latest=true")
      .then((response)=>response.json())
      .then((jsonData)=>{
        setDataThisWeek(jsonData);
      });


  }, [displayCount]);

  // 表示期間が変更されたときのフィルタリング
  useEffect(() => {
    if (data.length > 0) {
      setFilteredData(data.slice(0, displayPeriod));
    }
  }, [displayPeriod, data]);

  // テーブルのカラム名を取得（データが空の場合は空配列）
  const label = datathisweek.length > 0 ? datathisweek[0].issue_label : [];
  const columns = datathisweek.length > 0 ? Object.keys(datathisweek[0]) : [];

  return (
    <>
      <HomeHeaderNavi/>
      <Typography variant="h5" component="div" gutterBottom
        sx={{marginTop:3, textAlign: 'center',fontWeight:"bold"}}
      >
        週刊少年ジャンプ{label}の順位
      </Typography>
      <Typography variant="h6" sx={{ 
        textAlign: 'center', 
      }}>
        連載作品
      </Typography>
      {/* テーブル表示 */}
      <table border={1} cellPadding={4} cellSpacing={0} style={{margin: '0 auto', marginBottom: 32, width: '20%', fontSize: '12px', }} className="styled-table">
        <thead>
          <tr>
            {/**{columns.map((col) => (
              <th key={col}>{col}</th>
            ))}*/}
            <th key="title">作品タイトル</th>
            <th key="rank">{label}の順位</th>
          </tr>
        </thead>
        <tbody>
        {datathisweek.map((row, idx) => (
          <tr key={idx}>
            <td> 
              <Link 
                to={`/jumprank/detail?title=${encodeURIComponent(String(row.title))}`}
                style={{ 
                  color: '#0066cc', 
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                {row.title}
              </Link>
            </td>
            <td>{row.rank_num}</td>
          </tr>
        ))}

{/** 
          {datathisweek.map((row, idx) => (
            <tr key={idx}>
              {columns.map((col, colIndex) => (
                <td key={col}>
                  {colIndex === 0 ? (
                    <Link 
                      //to={`/detail?title=${encodeURIComponent(String(row[col as keyof DataRow]))}`}
                      to={`/jumprank/detail?title=${encodeURIComponent(String(row[col as keyof DataRow]))}`}
                      style={{ 
                        color: '#0066cc', 
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {row[col as keyof DataRow]}
                    </Link>
                  ) : (
                    row[col as keyof DataRow]
                  )}
                </td>
              ))}
            </tr>
          ))}
*/}
        </tbody>
      </table>

      {/* グラフ表示 */}
      <Typography variant="h5" component="div" gutterBottom
        sx={{marginTop: 10, marginBottom:3, textAlign: 'center', fontWeight:"bold"}}
      >
        掲載順位の推移
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginBottom: 3 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>表示期間</InputLabel>
          <Select
            value={displayPeriod}
            label="表示期間"
            onChange={(e) => setDisplayPeriod(Number(e.target.value))}
          >
            <MenuItem value={4}>1ヶ月</MenuItem>
            <MenuItem value={12}>3ヶ月</MenuItem>
            {/*<MenuItem value={24}>6ヶ月</MenuItem>
            <MenuItem value={48}>1年</MenuItem>
            <MenuItem value={1000}>全期間</MenuItem>*/}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>表示作品数</InputLabel>
          <Select
            value={displayCount}
            label="表示作品数"
            onChange={(e) => setDisplayCount(Number(e.target.value))}
          >
            <MenuItem value={3}>TOP3</MenuItem>
            <MenuItem value={5}>TOP5</MenuItem>
            <MenuItem value={10}>TOP10</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="title" 
            reversed={true}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            reversed={true}
            domain={[1, 'dataMax']}
            tickCount={10}
          />
          <Tooltip />
          <Legend 
            onClick={(e: any) => {
              if (e.dataKey && topSeries.includes(e.dataKey)) {
                setVisibleSeries(prev => ({
                  ...prev,
                  [e.dataKey as string]: !prev[e.dataKey as string]
                }));
              }
            }}
            formatter={(value, entry) => {
              if (!topSeries.includes(value)) return null;
              const isActive = visibleSeries[value];
              return (
                <span 
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    opacity: isActive ? 1 : 0.5,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      marginRight: '8px',
                      backgroundColor: isActive ? entry.color : 'transparent',
                      border: `2px solid ${entry.color}`,
                      opacity: isActive ? 1 : 0.3,
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <span style={{ 
                    color: isActive ? '#000000' : '#999999',
                    fontWeight: isActive ? 500 : 400
                  }}>
                    {value}
                  </span>
                </span>
              );
            }}
            wrapperStyle={{
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
          />
          {topSeries.map((series, index) => {
            const colors = [
              '#8884d8', '#d8681d', '#82ca9d', '#0fc7f0', '#6206e3',
              '#d213bf', '#55ff00', '#ff6b6b', '#4ecdc4', '#45b7d1'
            ];
            return (
              <Line
                key={series}
                type="monotone"
                dataKey={series}
                stroke={colors[index % colors.length]}
                strokeWidth={visibleSeries[series] ? 2 : 1}
                strokeOpacity={visibleSeries[series] ? 1 : 0.3}
                strokeDasharray={visibleSeries[series] ? "0" : "3 3"}
                dot={{ 
                  r: visibleSeries[series] ? 3 : 2,
                  strokeWidth: visibleSeries[series] ? 2 : 1,
                  strokeOpacity: visibleSeries[series] ? 1 : 0.3,
                  fill: visibleSeries[series] ? colors[index % colors.length] : "#fff"
                }}
                activeDot={visibleSeries[series] ? { r: 5 } : false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      
      
      {/* 平均順位テーブル */}
      <Typography variant="h5" component="div" gutterBottom
        sx={{marginTop: 5, marginBottom:3, textAlign: 'center', fontWeight:"bold"}}
      >
        作品別平均順位
      </Typography>
      <table className="styled-table" style={{ marginBottom: '2rem' }}>
        <thead>
          <tr>
            <th>順位</th>
            <th>作品名</th>
            <th>平均順位</th>
          </tr>
        </thead>
        <tbody>
          {averageRankings.slice(0, displayCount).map((ranking, index) => (
            <tr key={ranking.series}>
              <td>{index + 1}</td>
              <td>{ranking.series}</td>
              <td>{ranking.average.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

       {/* スタイル定義 */}
      <style>{`
        .styled-table {
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 16px;
          min-width: 400px;
          box-shadow: 0 0 10px rgba(0,0,0,0.08);
          width: 100%;
        }
        .styled-table thead tr {
          background-color: #009879;
          color: #ffffff;
          text-align: left;
        }
        .styled-table th, .styled-table td {
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
        }
      `}</style>
      <Footer />
    </>
  );
};

export default LineChartFromCSV;