import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import StatsCard from '@/components/admin/StatsCard';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import { mockAnalytics, mockOrders } from '@/data/adminMockData';
import { 
  DollarSign, 
  ShoppingBag, 
  Bike, 
  Clock,
  TrendingUp
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(var(--warning))', 'hsl(var(--primary))', 'hsl(var(--coral))', 'hsl(var(--success))', 'hsl(var(--destructive))'];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
};

const AdminDashboard: React.FC = () => {
  const formatCurrency = (value: number) => {
    return `GH₵ ${value.toLocaleString()}`;
  };

  const recentOrders = mockOrders.slice(0, 4);

  return (
    <AdminLayout title="Dashboard">
      <div className="p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(mockAnalytics.totalRevenue)}
            icon={DollarSign}
            variant="primary"
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatsCard
            title="Total Orders"
            value={mockAnalytics.totalOrders}
            icon={ShoppingBag}
            variant="coral"
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatsCard
            title="Active Riders"
            value={mockAnalytics.activeRiders}
            icon={Bike}
            variant="success"
          />
          <StatsCard
            title="Avg. Delivery"
            value={`${mockAnalytics.avgDeliveryTime}hrs`}
            icon={Clock}
            variant="warning"
          />
        </div>

        {/* Revenue Chart */}
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
              <YAxis 
                hide
              />
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

        {/* Order Status Distribution */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Orders by Status</h3>
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

        {/* Top Services */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Top Services</h3>
          <div className="space-y-3">
            {mockAnalytics.topServices.slice(0, 4).map((service, index) => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.orders} orders</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(service.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div 
                key={order.id} 
                className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {order.customerName}
                    </p>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.id} • {order.items.length} item{order.items.length > 1 ? 's' : ''}
                  </p>
                </div>
                <span className="text-sm font-bold text-foreground ml-2">
                  {formatCurrency(order.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
