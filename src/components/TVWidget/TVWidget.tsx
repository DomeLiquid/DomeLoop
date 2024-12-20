'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
} from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DomeBank } from '@/app/stores/tradeStore';
import { getTokenPriceHistory } from '@/lib/actions';
import { PriceData } from '@/types/account';
import { useIsMobile } from '@/hooks';

const timeframeToType = {
  '1D': 0,
  '1W': 1,
  '1M': 2,
  '1Y': 3,
  ALL: 4,
};

export default function TVWidget({ token }: { token: DomeBank }) {
  const [timeframe, setTimeframe] = useState('1D');
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate price change percentage
  const priceChange = useMemo(() => {
    if (!Array.isArray(priceData) || priceData.length < 2) return 0;

    return (
      ((Number(priceData[priceData.length - 1].price) -
        Number(priceData[0].price)) /
        Number(priceData[0].price)) *
      100
    );
  }, [priceData]);

  useEffect(() => {
    const fetchPriceData = async () => {
      setIsLoading(true);
      try {
        const data = await getTokenPriceHistory(
          token.token.assetId,
          timeframeToType[timeframe as keyof typeof timeframeToType],
        );
        if (data && Array.isArray(data)) {
          setPriceData(data);
        } else {
          setPriceData([]);
          console.error('Price data is not an array:', data);
        }
      } catch (error) {
        console.error('Failed to fetch price data:', error);
        setPriceData([]);
      }
      setIsLoading(false);
    };

    fetchPriceData();
  }, [timeframe, token.token.assetId]);

  const chartData = useMemo(() => {
    if (!Array.isArray(priceData)) return [];

    return priceData.map((item) => ({
      unix: item.unix,
      price: Number(item.price),
    }));
  }, [priceData]);

  // Current price display
  const currentPrice = useMemo(() => {
    if (!Array.isArray(priceData) || priceData.length === 0) return '0.00';
    return priceData[priceData.length - 1]?.price;
  }, [priceData]);

  const getXAxisTickFormatter = (timeframe: string) => (value: number) => {
    const date = new Date(value);

    switch (timeframe) {
      case '1D':
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      case '1W':
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          hour: '2-digit',
        });
      case '1M':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      case '1Y':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        });
      case 'ALL':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
        });
      default:
        return date.toLocaleDateString();
    }
  };

  // 计算合适的刻度间隔
  const getXAxisTicks = (data: any[], timeframe: string) => {
    if (!data.length) return [];

    const timestamps = data.map((item) => item.timestamp);
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);

    let interval;
    switch (timeframe) {
      case '1D':
        interval = 3600000 * 2; // 2小时
        break;
      case '1W':
        interval = 3600000 * 24; // 1天
        break;
      case '1M':
        interval = 3600000 * 24 * 7; // 1周
        break;
      case '1Y':
        interval = 3600000 * 24 * 30; // 1月
        break;
      case 'ALL':
        interval = 3600000 * 24 * 365; // 1年
        break;
      default:
        interval = 3600000 * 24;
    }

    const ticks = [];
    for (let time = minTime; time <= maxTime; time += interval) {
      ticks.push(time);
    }

    return ticks;
  };

  // 添加最高点和最低点的计算
  const priceExtremes = useMemo(() => {
    if (!Array.isArray(chartData) || chartData.length === 0) {
      return {
        max: { unix: 0, price: 0 },
        min: { unix: 0, price: 0 },
      };
    }

    let maxPrice = -Infinity;
    let minPrice = Infinity;
    let maxPoint: PriceData | null = null;
    let minPoint: PriceData | null = null;

    chartData.forEach((point) => {
      if (point.price > maxPrice) {
        maxPrice = point.price;
        maxPoint = point as unknown as PriceData;
      }
      if (point.price < minPrice) {
        minPrice = point.price;
        minPoint = point as unknown as PriceData;
      }
    });

    return { max: maxPoint, min: minPoint };
  }, [chartData]);

  // 计算 Y 轴的刻度值
  const getYAxisTicks = useMemo(() => {
    if (!priceExtremes.max || !priceExtremes.min) return [];
    return [priceExtremes.min.price, priceExtremes.max.price];
  }, [priceExtremes]);

  const isMobile = useIsMobile();
  // 修改 CustomLabel 组件
  const CustomLabel = ({ x, y, value, type }: any) => {
    const yOffset = type === 'max' ? -20 : 20; // 增加偏移量使标签更清晰

    return (
      <g transform={`translate(${x},${y})`}>
        {/* 添加背景矩形使文字更清晰 */}
        <rect
          x="-30"
          y={yOffset - 10}
          width="60"
          height="20"
          rx="4"
          fill="white"
          fillOpacity="0.9"
        />
        <text
          x="0"
          y={yOffset}
          textAnchor="middle"
          alignmentBaseline="middle"
          fill={type === 'max' ? 'hsl(var(--success))' : 'hsl(var(--error))'}
          fontSize="12"
          fontWeight="500"
        >
          ${Number(value).toFixed(2)}
        </text>
      </g>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader
        className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-start space-y-0 pb-2 sm:items-center`}
      >
        <div className="w-full space-y-1">
          <CardTitle className="text-2xl font-bold">
            {token.token.symbol}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="font-mono text-xl">
              ${Number(currentPrice).toFixed(6)}
            </div>
            <div
              className={`flex items-center rounded px-2 py-0.5 ${
                priceChange >= 0
                  ? 'bg-emerald-50 text-emerald-500'
                  : 'bg-red-50 text-red-500'
              }`}
            >
              {priceChange >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {Math.abs(priceChange).toFixed(2)}%
            </div>
          </div>
        </div>
        <Tabs
          defaultValue="1D"
          className="mt-0 w-full sm:w-auto"
          onValueChange={setTimeframe}
        >
          <TabsList className="mx-auto grid h-8 w-full max-w-[300px] grid-cols-5 sm:mx-0 sm:mb-1">
            <TabsTrigger value="1D" className="px-1 text-xs sm:px-3 sm:text-sm">
              1D
            </TabsTrigger>
            <TabsTrigger value="1W" className="px-1 text-xs sm:px-3 sm:text-sm">
              1W
            </TabsTrigger>
            <TabsTrigger value="1M" className="px-1 text-xs sm:px-3 sm:text-sm">
              1M
            </TabsTrigger>
            <TabsTrigger value="1Y" className="px-1 text-xs sm:px-3 sm:text-sm">
              1Y
            </TabsTrigger>
            <TabsTrigger
              value="ALL"
              className="px-1 text-xs sm:px-3 sm:text-sm"
            >
              ALL
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              Loading...
            </div>
          ) : !chartData.length ? (
            <div className="flex h-full items-center justify-center">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 20,
                  right: isMobile ? 8 : 80,
                  left: isMobile ? 8 : 20,
                  bottom: 20,
                }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(270, 70%, 70%)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(270, 70%, 70%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="unix"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={16}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={getXAxisTickFormatter(timeframe)}
                  ticks={getXAxisTicks(chartData, timeframe)}
                  minTickGap={50}
                  height={50}
                  fontSize={12}
                />
                {
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => `$${Number(value).toFixed(2)}`}
                    ticks={getYAxisTicks}
                    domain={[
                      priceExtremes.min?.price ?? 'dataMin',
                      priceExtremes.max?.price ?? 'dataMax',
                    ]}
                    interval="preserveEnd"
                    width={70}
                  />
                }
                <Tooltip content={<PriceChartTooltip />} />

                {priceExtremes.max && (
                  <ReferenceDot
                    x={priceExtremes.max?.unix ?? 0}
                    y={priceExtremes.max?.price ?? 0}
                    r={4}
                    fill="hsl(var(--success))"
                    stroke="white"
                    strokeWidth={2}
                  >
                    <CustomLabel value={priceExtremes.max.price} type="max" />
                  </ReferenceDot>
                )}

                {priceExtremes.min && (
                  <ReferenceDot
                    x={priceExtremes.min.unix}
                    y={priceExtremes.min.price}
                    r={4}
                    fill="hsl(var(--error))"
                    stroke="white"
                    strokeWidth={2}
                  >
                    <CustomLabel value={priceExtremes.min.price} type="min" />
                  </ReferenceDot>
                )}

                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(270, 70%, 60%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const PriceChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded border border-border bg-background p-2 shadow">
        <p className="font-semibold">
          {new Date(label).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })}
        </p>
        <p>${Number(payload[0].value).toFixed(6)}</p>
      </div>
    );
  }
  return null;
};
