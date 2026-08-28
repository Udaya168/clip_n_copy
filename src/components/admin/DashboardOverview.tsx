import { useMemo, useState, useEffect } from "react";
import { SupabaseProduct } from "@/lib/supabase-products";
import { fetchAllOrders, OrderRecord } from "@/lib/orders-store";
import { inr } from "@/lib/shop-store";
import {
  Package,
  Boxes,
  AlertTriangle,
  XCircle,
  IndianRupee,
  RefreshCw,
  Store,
  TrendingUp,
  ShoppingBag,
  ShoppingCart,
  Plus,
  ArrowRight,
  Truck,
  CheckCircle2,
  Clock,
  Eye,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminTab } from "./AdminSidebar";
import { StoreStatusCard } from "./StoreStatusCard";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface DashboardOverviewProps {
  products: SupabaseProduct[];
  loading: boolean;
  onRefresh: () => void;
  setActiveTab: (tab: AdminTab) => void;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ef4444"];

export function DashboardOverview({
  products,
  loading: productsLoading,
  onRefresh,
  setActiveTab,
}: DashboardOverviewProps) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [salesTimeFilter, setSalesTimeFilter] = useState("30D");

  const loadOrdersData = async () => {
    setOrdersLoading(true);
    const data = await fetchAllOrders();
    setOrders(data);
    setOrdersLoading(false);
  };

  useEffect(() => {
    loadOrdersData();
  }, []);

  const handleRefresh = () => {
    onRefresh();
    loadOrdersData();
  };

  const loading = productsLoading || ordersLoading;

  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const metrics = useMemo(() => {
    let totalProducts = products.length;
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalInventoryValue = 0;

    const lowStockItems: SupabaseProduct[] = [];
    const outOfStockItems: SupabaseProduct[] = [];

    products.forEach((p) => {
      const stock = typeof p.stock === "number" ? Math.max(0, Math.floor(p.stock)) : p.stock ? 50 : 0;
      const price = Number(p.price) || 0;

      totalStockUnits += stock;
      totalInventoryValue += price * stock;

      if (stock === 0) {
        outOfStockCount++;
        outOfStockItems.push(p);
      } else if (stock <= 5) {
        lowStockCount++;
        lowStockItems.push(p);
      }
    });

    return {
      totalProducts,
      totalStockUnits,
      lowStockCount,
      outOfStockCount,
      totalInventoryValue,
      lowStockItems,
      outOfStockItems,
    };
  }, [products]);

  // Order & Sales Analytics
  const salesData = useMemo(() => {
    // Generate simple last 7 days of sales for chart
    const data = [];
    const days = 7;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      
      const dayOrders = orders.filter(o => o.date === dateStr && o.status !== "Cancelled");
      const totalSales = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      
      data.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        sales: totalSales
      });
    }
    return data;
  }, [orders]);

  const orderStats = useMemo(() => {
    const stats = {
      Processing: 0,
      Confirmed: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0
    };
    
    orders.forEach(o => {
      if (stats[o.status] !== undefined) {
        stats[o.status]++;
      }
    });

    return Object.entries(stats)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl break-words">
            Good morning, Shop Owner 👋
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
            Here's what's happening with your store today. <span className="text-primary font-medium">{todayDateStr}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-secondary transition-colors"
          >
            <Store className="size-4 text-muted-foreground" /> View Storefront
          </Link>
          <Button
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-xl text-sm font-semibold gap-2 shadow-sm"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Store Status Card */}
      <StoreStatusCard />

      {/* Premium KPI Grid */}
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Products"
          value={metrics.totalProducts.toString()}
          icon={<Package className="size-5 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          subText="Catalog Items"
          loading={loading}
        />
        <MetricCard
          title="Total Stock"
          value={metrics.totalStockUnits.toLocaleString()}
          icon={<Boxes className="size-5 text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          subText="Units in Stock"
          loading={loading}
        />
        <MetricCard
          title="Low Stock"
          value={metrics.lowStockCount.toString()}
          icon={<AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          subText="Needs Reorder"
          highlight={metrics.lowStockCount > 0}
          loading={loading}
        />
        <MetricCard
          title="Out of Stock"
          value={metrics.outOfStockCount.toString()}
          icon={<XCircle className="size-5 text-red-600 dark:text-red-400" />}
          iconBg="bg-red-100 dark:bg-red-900/30"
          subText="Unavailable Products"
          highlight={metrics.outOfStockCount > 0}
          loading={loading}
        />
        <MetricCard
          title="Inventory Value"
          value={inr(metrics.totalInventoryValue)}
          icon={<IndianRupee className="size-5 text-indigo-600 dark:text-indigo-400" />}
          iconBg="bg-indigo-100 dark:bg-indigo-900/30"
          subText="Total Stock Value"
          loading={loading}
        />
      </div>

      {/* Analytics Section */}
      <div className="grid gap-6 lg:grid-cols-3 min-w-0">
        {/* Sales Overview Chart */}
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm lg:col-span-2 flex flex-col min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h3 className="font-display font-bold text-lg">Sales Overview</h3>
              <p className="text-xs text-muted-foreground mt-1">Revenue across all fulfillment channels</p>
            </div>
            <div className="flex flex-wrap items-center gap-1 bg-secondary/50 p-1 rounded-xl self-start sm:self-auto">
              {['Today', '7D', '30D', '3M', '1Y'].map(time => (
                <button
                  key={time}
                  onClick={() => setSalesTimeFilter(time)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    salesTimeFilter === time 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[300px] w-full mt-auto">
            {orders.length === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                <TrendingUp className="size-8 opacity-20 mb-2" />
                <p className="text-sm font-medium">No sales data available yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                    tickFormatter={(value) => `₹${value}`}
                    width={60}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    formatter={(value: number) => [`₹${value}`, 'Sales']}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Order Statistics Donut */}
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="font-display font-bold text-lg">Order Statistics</h3>
            <p className="text-xs text-muted-foreground mt-1">Status breakdown</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center relative min-h-[250px]">
            {orders.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <PieChart className="mx-auto size-12 opacity-20 mb-2" />
                <p className="text-sm font-medium">No order data available yet</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={orderStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {orderStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none pb-2">
                  <span className="text-3xl font-black font-display">{orders.length}</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total</span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full">
                  {orderStats.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 text-xs">
                      <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-muted-foreground flex-1 truncate">{entry.name}</span>
                      <span className="font-bold">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Orders & Alerts */}
      <div className="grid gap-6 lg:grid-cols-3 min-w-0">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-border bg-background shadow-sm lg:col-span-2 overflow-hidden flex flex-col min-w-0">
          <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-display font-bold text-lg flex items-center gap-2">
              <ShoppingBag className="size-5 text-primary" /> Recent Orders
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("orders")}
              className="text-xs font-bold text-primary hover:bg-primary/5"
            >
              View All <ArrowRight className="ml-1 size-3.5" />
            </Button>
          </div>
          
          <div className="overflow-x-auto w-full flex-1">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead className="bg-secondary/40 text-muted-foreground font-semibold text-xs border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-medium">Order ID</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-xs">{o.orderNumber}</td>
                      <td className="px-6 py-4 font-medium">{o.customerName}</td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{o.date}</td>
                      <td className="px-6 py-4 font-semibold">{inr(o.totalAmount)}</td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-2xl border border-border bg-background shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between bg-amber-50/50 dark:bg-amber-950/10">
            <h3 className="font-display font-bold text-lg flex items-center gap-2 text-amber-700 dark:text-amber-500">
              <AlertTriangle className="size-5" /> Stock Alerts
            </h3>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
            {metrics.outOfStockItems.length === 0 && metrics.lowStockItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-10 text-emerald-600 dark:text-emerald-500 text-center">
                <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                  <CheckCircle2 className="size-5" />
                </div>
                <p className="font-medium text-sm">All products are sufficiently stocked</p>
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.outOfStockItems.map((item) => (
                  <div key={`oos-${item.id}`} className="flex items-center justify-between p-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-semibold truncate text-foreground">{item.name}</p>
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-0.5">Out of stock</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setActiveTab("inventory")} className="h-7 text-xs bg-white dark:bg-background border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/50 shrink-0">
                      Restock
                    </Button>
                  </div>
                ))}
                
                {metrics.lowStockItems.map((item) => (
                  <div key={`low-${item.id}`} className="flex items-center justify-between p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10">
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-semibold truncate text-foreground">{item.name}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">Only {item.stock} left</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setActiveTab("inventory")} className="h-7 text-xs bg-white dark:bg-background border-amber-200 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-800 dark:hover:bg-amber-900/50 shrink-0">
                      Manage
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Overview & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3 min-w-0">
        {/* Inventory Table */}
        <div className="rounded-2xl border border-border bg-background shadow-sm lg:col-span-2 overflow-hidden flex flex-col min-w-0">
          <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-display font-bold text-lg flex items-center gap-2">
              <Boxes className="size-5 text-primary" /> Inventory Overview
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("inventory")}
              className="text-xs font-bold text-primary hover:bg-primary/5"
            >
              View All <ArrowRight className="ml-1 size-3.5" />
            </Button>
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm min-w-[400px]">
              <thead className="bg-secondary/40 text-muted-foreground font-semibold text-xs border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">Stock</th>
                  <th className="px-6 py-3 font-medium">Price</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.slice(0, 5).map((p) => {
                    const stockNum = Number(p.stock) || 0;
                    return (
                      <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-secondary border border-border overflow-hidden shrink-0 flex items-center justify-center">
                              {p.image_url ? (
                                <img src={p.image_url} alt={p.name} className="size-full object-cover" />
                              ) : (
                                <Package className="size-4 text-muted-foreground" />
                              )}
                            </div>
                            <span className="font-medium line-clamp-1">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 font-medium">{stockNum}</td>
                        <td className="px-6 py-3 text-muted-foreground">{inr(p.price)}</td>
                        <td className="px-6 py-3">
                          {stockNum === 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Out of Stock</span>
                          ) : stockNum <= 5 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Low Stock</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">In Stock</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <h3 className="font-display font-bold text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard 
              icon={<Plus className="size-5" />} 
              label="Add Product" 
              onClick={() => setActiveTab("products")} 
              colorClass="text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
            />
            <QuickActionCard 
              icon={<Boxes className="size-5" />} 
              label="Update Stock" 
              onClick={() => setActiveTab("inventory")} 
              colorClass="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40"
            />
            <QuickActionCard 
              icon={<ShoppingBag className="size-5" />} 
              label="View Orders" 
              onClick={() => setActiveTab("orders")} 
              colorClass="text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40"
            />
            <QuickActionCard 
              icon={<Settings className="size-5" />} 
              label="Settings" 
              onClick={() => setActiveTab("settings")} 
              colorClass="text-slate-600 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  iconBg,
  subText,
  highlight,
  loading
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  subText: string;
  highlight?: boolean;
  loading?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-200 hover:shadow-md ${
        highlight
          ? "border-amber-300 dark:border-amber-800/50 bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20"
          : "border-border bg-background"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className={`grid size-9 place-items-center rounded-xl ${iconBg}`}>{icon}</div>
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-secondary animate-pulse rounded-md mt-1 mb-2"></div>
      ) : (
        <p className="font-display text-3xl font-black tracking-tight text-foreground">{value}</p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">{subText}</p>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Processing":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          <Clock className="size-3" /> Processing
        </span>
      );
    case "Confirmed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
          <CheckCircle2 className="size-3" /> Confirmed
        </span>
      );
    case "Shipped":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <Truck className="size-3" /> Shipped
        </span>
      );
    case "Delivered":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          <CheckCircle2 className="size-3" /> Delivered
        </span>
      );
    case "Cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <XCircle className="size-3" /> Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold">
          {status}
        </span>
      );
  }
}

function QuickActionCard({ icon, label, onClick, colorClass }: { icon: React.ReactNode, label: string, onClick: () => void, colorClass: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-border/50 transition-all ${colorClass}`}
    >
      {icon}
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}
