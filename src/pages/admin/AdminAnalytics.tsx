import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { mockAnalytics } from '@/data/adminMockData';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Bike,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
  Package,
  Repeat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  Legend
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--coral))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

const timeRanges = ['Today', '7 Days', '30 Days', '90 Days'];

// Extended analytics data
const hourlyData = [
  { hour: '6AM', orders: 5, revenue: 180 },
  { hour: '8AM', orders: 12, revenue: 450 },
  { hour: '10AM', orders: 18, revenue: 720 },
  { hour: '12PM', orders: 35, revenue: 1400 },
  { hour: '2PM', orders: 28, revenue: 1120 },
  { hour: '4PM', orders: 22, revenue: 880 },
  { hour: '6PM', orders: 45, revenue: 1800 },
  { hour: '8PM', orders: 38, revenue: 1520 },
  { hour: '10PM', orders: 15, revenue: 600 },
];

const categoryData = [
  { name: 'Food', orders: 245, revenue: 12500, growth: 15 },
  { name: 'Groceries', orders: 189, revenue: 9800, growth: 8 },
  { name: 'Pharmacy', orders: 78, revenue: 4200, growth: 22 },
  { name: 'Packages', orders: 56, revenue: 2800, growth: -5 },
  { name: 'Electronics', orders: 34, revenue: 8500, growth: 12 },
];

const riderPerformance = [
  { name: 'Kwaku F.', deliveries: 45, rating: 4.9, avgTime: 22 },
  { name: 'Yaw A.', deliveries: 38, rating: 4.8, avgTime: 25 },
  { name: 'Kojo A.', deliveries: 32, rating: 4.7, avgTime: 28 },
  { name: 'Nana A.', deliveries: 28, rating: 4.6, avgTime: 30 },
];

const customerMetrics = {
  totalCustomers: 1234,
  newThisWeek: 89,
  activeToday: 234,
  repeatRate: 68,
  avgOrderValue: 85,
  avgOrdersPerCustomer: 3.2,
};

const AdminAnalytics: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState('7 Days');

  const formatCurrency = (value: number) => `GH₵ ${value.toLocaleString()}`;

  const chartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--primary))" },
    orders: { label: "Orders", color: "hsl(var(--coral))" },
  };

  return (
    <AdminLayout title="Analytics">
      <div className="p-4 space-y-6">
        {/* Time Range Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {timeRanges.map((range) => (
            <Button
              key={range}
              variant={selectedRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRange(range)}
              className={selectedRange === range ? 'gradient-hero text-primary-foreground' : ''}
            >
              {range}
            </Button>
          ))}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-success text-xs font-medium">
                <ArrowUpRight className="w-3 h-3" />
                +12.5%
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(mockAnalytics.totalRevenue)}</p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-coral" />
              </div>
              <div className="flex items-center gap-1 text-success text-xs font-medium">
                <ArrowUpRight className="w-3 h-3" />
                +8.2%
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">{mockAnalytics.totalOrders}</p>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-success" />
              </div>
              <div className="flex items-center gap-1 text-success text-xs font-medium">
                <ArrowUpRight className="w-3 h-3" />
                +15%
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">{customerMetrics.totalCustomers}</p>
            <p className="text-xs text-muted-foreground">Total Customers</p>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Repeat className="w-5 h-5 text-warning" />
              </div>
              <div className="flex items-center gap-1 text-success text-xs font-medium">
                <ArrowUpRight className="w-3 h-3" />
                +3%
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">{customerMetrics.repeatRate}%</p>
            <p className="text-xs text-muted-foreground">Repeat Rate</p>
          </div>
        </div>

        {/* Hourly Orders Chart */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Orders by Hour</h3>
              <p className="text-xs text-muted-foreground">Peak hours analysis</p>
            </div>
            <div className="flex items-center gap-1 text-primary text-sm font-medium">
              <Clock className="w-4 h-4" />
              Peak: 6PM
            </div>
          </div>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="hour" 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
              />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="orders" 
                stroke="hsl(var(--primary))" 
                fill="url(#orderGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* Category Performance */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Category Performance</h3>
          <div className="space-y-3">
            {categoryData.map((category, index) => (
              <div key={category.name} className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {formatCurrency(category.revenue)}
                      </span>
                      <span className={`text-xs flex items-center gap-0.5 ${category.growth >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {category.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(category.growth)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${(category.orders / 245) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{category.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Revenue Trend</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <div className="flex items-center gap-1 text-success text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              +15.3%
            </div>
          </div>
          <ChartContainer config={chartConfig} className="h-[180px] w-full">
            <BarChart data={mockAnalytics.revenueByDay}>
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en', { weekday: 'short' })}
              />
              <YAxis hide />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar 
                dataKey="revenue" 
                fill="hsl(var(--primary))" 
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Top Riders */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Top Riders</h3>
            <Button variant="ghost" size="sm" className="text-primary">View All</Button>
          </div>
          <div className="space-y-3">
            {riderPerformance.map((rider, index) => (
              <div key={rider.name} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-coral flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{rider.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" /> {rider.deliveries}
                    </span>
                    <span className="flex items-center gap-1 text-warning">
                      <Star className="w-3 h-3 fill-current" /> {rider.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {rider.avgTime}min
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Insights */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Customer Insights</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-primary/10 rounded-xl">
              <p className="text-lg font-bold text-primary">{customerMetrics.newThisWeek}</p>
              <p className="text-[10px] text-muted-foreground">New This Week</p>
            </div>
            <div className="text-center p-3 bg-success/10 rounded-xl">
              <p className="text-lg font-bold text-success">{customerMetrics.activeToday}</p>
              <p className="text-[10px] text-muted-foreground">Active Today</p>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-xl">
              <p className="text-lg font-bold text-warning">{formatCurrency(customerMetrics.avgOrderValue)}</p>
              <p className="text-[10px] text-muted-foreground">Avg. Order</p>
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Order Status</h3>
          <div className="flex items-center gap-4">
            <div className="w-[120px] h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockAnalytics.ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {mockAnalytics.ordersByStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {mockAnalytics.ordersByStatus.map((item, index) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-muted-foreground">{item.status}</span>
                  </div>
                  <span className="text-xs font-medium text-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
