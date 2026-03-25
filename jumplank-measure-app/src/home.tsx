import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// 型定義
type DataRow = {
  name: string;
  uv: number;
  pv: number;
};

const LineChartFromCSV: React.FC = () => {
  const [data, setData] = useState<DataRow[]>([]);

  useEffect(() => {
    fetch("/data.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const parsed = Papa.parse<DataRow>(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true, // 数値自動変換
        });
        setData(parsed.data);
      });
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="uv" stroke="#8884d8" />
        <Line type="monotone" dataKey="pv" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default LineChartFromCSV;