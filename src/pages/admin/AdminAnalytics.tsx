import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminAnalytics, useAdminRiders, useAdminUsers } from '@/hooks/useAdminData';
import { 
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  ArrowUpRight,
  Clock,
  Star,
  Package,
  Repeat,
  Loader2,
  Bike
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
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--coral))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

const timeRanges = ['Today', '7 Days', '30 Days', '90 Days'];

const AdminAnalytics: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState('7 Days');
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics();
  const { data: riders, isLoading: ridersLoading } = useAdminRiders();
  const { data: users, isLoading: usersLoading } = useAdminUsers();

  const formatCurrency = (value: number) => `GH₵ ${value.toLocaleString()}`;

  const chartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--primary))" },
    orders: { label: "Orders", color: "hsl(var(--coral))" },
  };

  const isLoading = analyticsLoading || ridersLoading || usersLoading;

  if (isLoading) {
    return (
      <AdminLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  // Calculate real metrics
  const totalCustomers = users?.filter(u => u.role === 'customer').length || 0;
  const totalRiders = riders?.length || 0;
  const onlineRiders = riders?.filter(r => r.isOnline).length || 0;

  // Get top riders by deliveries
  const topRiders = riders
    ?.sort((a, b) => (b.completedDeliveries || 0) - (a.completedDeliveries || 0))
    .slice(0, 4) || [];

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
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(analytics?.totalRevenue || 0)}</p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-coral" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">{analytics?.totalOrders || 0}</p>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-success" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">{totalCustomers}</p>
            <p className="text-xs text-muted-foreground">Total Customers</p>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Bike className="w-5 h-5 text-warning" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">{onlineRiders}/{totalRiders}</p>
            <p className="text-xs text-muted-foreground">Riders Online</p>
          </div>
        </div>

        {/* Revenue Trend */}
        {analytics?.revenueByDay && analytics.revenueByDay.length > 0 && (
          <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">Revenue Trend</h3>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </div>
              <div className="flex items-center gap-1 text-success text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <ChartContainer config={chartConfig} className="h-[180px] w-full">
              <BarChart data={analytics.revenueByDay}>
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
        )}

        {/* Top Stores */}
        {analytics?.topServices && analytics.topServices.length > 0 && (
          <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Top Stores</h3>
            <div className="space-y-3">
              {analytics.topServices.map((store, index) => (
                <div key={store.name} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{store.name}</span>
                      <span className="text-sm font-bold text-foreground">
                        {formatCurrency(store.revenue)}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${(store.orders / (analytics.topServices[0]?.orders || 1)) * 100}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{store.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Riders */}
        {topRiders.length > 0 && (
          <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Top Riders</h3>
            </div>
            <div className="space-y-3">
              {topRiders.map((rider, index) => (
                <div key={rider.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-coral flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{rider.full_name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" /> {rider.completedDeliveries || 0}
                      </span>
                      <span className="flex items-center gap-1 text-warning">
                        <Star className="w-3 h-3 fill-current" /> 5.0
                      </span>
                      <span className={`flex items-center gap-1 ${rider.isOnline ? 'text-success' : 'text-muted-foreground'}`}>
                        {rider.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Insights */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Platform Stats</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-primary/10 rounded-xl">
              <p className="text-lg font-bold text-primary">{totalCustomers}</p>
              <p className="text-[10px] text-muted-foreground">Customers</p>
            </div>
            <div className="text-center p-3 bg-success/10 rounded-xl">
              <p className="text-lg font-bold text-success">{totalRiders}</p>
              <p className="text-[10px] text-muted-foreground">Riders</p>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-xl">
              <p className="text-lg font-bold text-warning">{analytics?.activeRiders || 0}</p>
              <p className="text-[10px] text-muted-foreground">Active Now</p>
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        {analytics?.ordersByStatus && analytics.ordersByStatus.length > 0 && (
          <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Order Status</h3>
            <div className="flex items-center gap-4">
              <div className="w-[120px] h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.ordersByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {analytics.ordersByStatus.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {analytics.ordersByStatus.map((item, index) => (
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
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;