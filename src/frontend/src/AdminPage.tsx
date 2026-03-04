import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  ArrowLeft,
  Bitcoin,
  Crown,
  DollarSign,
  Leaf,
  Loader2,
  LogOut,
  RefreshCw,
  Shield,
  Sword,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Order,
  OrderStatus,
  PaymentType,
  type Service,
  useAllOrders,
  useAllServices,
  useUpdateOrderStatus,
} from "./hooks/useQueries";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const ADMIN_PASSWORD = "legion2025";
const SESSION_KEY = "legion_admin_auth";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function paymentLabel(p: PaymentType): string {
  switch (p) {
    case PaymentType.money:
      return "Money";
    case PaymentType.inGameFruits:
      return "In-Game Fruits";
    case PaymentType.crypto:
      return "Crypto";
  }
}

function paymentIcon(p: PaymentType) {
  switch (p) {
    case PaymentType.money:
      return <DollarSign className="h-3 w-3" />;
    case PaymentType.inGameFruits:
      return <Leaf className="h-3 w-3" />;
    case PaymentType.crypto:
      return <Bitcoin className="h-3 w-3" />;
  }
}

function paymentBadgeClass(p: PaymentType): string {
  switch (p) {
    case PaymentType.money:
      return "bg-emerald-950/80 text-emerald-400 border border-emerald-700/40";
    case PaymentType.inGameFruits:
      return "bg-purple-950/80 text-purple-300 border border-purple-700/40";
    case PaymentType.crypto:
      return "bg-amber-950/80 text-amber-400 border border-amber-700/40";
  }
}

function statusLabel(s: OrderStatus): string {
  switch (s) {
    case OrderStatus.pending:
      return "Pending";
    case OrderStatus.inProgress:
      return "In Progress";
    case OrderStatus.completed:
      return "Completed";
    case OrderStatus.cancelled:
      return "Cancelled";
  }
}

function statusBadgeClass(s: OrderStatus): string {
  switch (s) {
    case OrderStatus.pending:
      return "bg-amber-950/80 text-amber-400 border border-amber-700/40";
    case OrderStatus.inProgress:
      return "bg-blue-950/80 text-blue-400 border border-blue-700/40";
    case OrderStatus.completed:
      return "bg-emerald-950/80 text-emerald-400 border border-emerald-700/40";
    case OrderStatus.cancelled:
      return "bg-red-950/80 text-red-400 border border-red-700/40";
  }
}

function resolveServiceName(serviceId: bigint, services: Service[]): string {
  const service = services.find((s) => s.id === serviceId);
  return service ? service.name : `Service #${serviceId.toString()}`;
}

type FilterTab = "all" | OrderStatus;

// ─────────────────────────────────────────────
// LOGIN PANEL
// ─────────────────────────────────────────────

interface LoginPanelProps {
  onLogin: () => void;
}

function LoginPanel({ onLogin }: LoginPanelProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    // Simulate a tiny delay for UX feedback
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, "true");
        onLogin();
      } else {
        setError(true);
        setPassword("");
      }
      setIsLoading(false);
    }, 300);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
        data-ocid="admin.login_panel"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-foreground">
            Admin <span className="text-primary">Access</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enter your admin password to continue
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-lg p-6 space-y-4"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            <Input
              id="admin-password"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className="bg-input border-border focus:border-primary"
              autoComplete="current-password"
              data-ocid="admin.input"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2"
              data-ocid="admin.error_state"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>Incorrect password. Please try again.</span>
            </motion.div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90"
            disabled={isLoading || !password}
            data-ocid="admin.submit_button"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        {/* Back link */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              window.location.hash = "";
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            data-ocid="admin.back_button"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to site
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ORDER ROW
// ─────────────────────────────────────────────

interface OrderRowProps {
  order: Order;
  index: number;
  services: Service[];
}

function OrderRow({ order, index, services }: OrderRowProps) {
  const { mutateAsync: updateStatus, isPending } = useUpdateOrderStatus();

  async function handleStatusChange(newStatus: string) {
    try {
      await updateStatus({
        orderId: order.id,
        newStatus: newStatus as OrderStatus,
      });
      toast.success(`Order #${order.id.toString()} status updated.`);
    } catch {
      toast.error("Failed to update status. Please try again.");
    }
  }

  const ocidIndex = index + 1;
  const serviceName = resolveServiceName(order.serviceId, services);
  const truncatedNotes =
    order.notes.length > 60
      ? `${order.notes.substring(0, 60)}...`
      : order.notes;

  return (
    <TableRow
      className="border-border hover:bg-muted/30 transition-colors"
      data-ocid={`admin.row.${ocidIndex}`}
    >
      <TableCell className="font-mono font-bold text-primary text-sm w-16">
        #{order.id.toString()}
      </TableCell>
      <TableCell className="font-medium text-foreground max-w-[180px]">
        <div className="flex items-center gap-1.5 truncate">
          {serviceName.toLowerCase().includes("discord") ||
          serviceName.toLowerCase().includes("nitro") ||
          serviceName.toLowerCase().includes("boost") ||
          serviceName.toLowerCase().includes("decoration") ? (
            <Crown className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          ) : (
            <Sword className="h-3.5 w-3.5 text-violet flex-shrink-0" />
          )}
          <span className="truncate text-sm">{serviceName}</span>
        </div>
      </TableCell>
      <TableCell className="text-center text-foreground text-sm font-semibold w-20">
        {order.quantity.toString()}
      </TableCell>
      <TableCell className="w-36">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${paymentBadgeClass(order.paymentMethod)}`}
        >
          {paymentIcon(order.paymentMethod)}
          {paymentLabel(order.paymentMethod)}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm max-w-[140px]">
        <span className="truncate block">{order.contactInfo}</span>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm max-w-[160px]">
        <span className="truncate block" title={order.notes}>
          {truncatedNotes || (
            <span className="text-muted-foreground/40 italic">—</span>
          )}
        </span>
      </TableCell>
      <TableCell className="w-32">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(order.status)}`}
        >
          {statusLabel(order.status)}
        </span>
      </TableCell>
      <TableCell className="w-40">
        <Select
          value={order.status}
          onValueChange={handleStatusChange}
          disabled={isPending}
        >
          <SelectTrigger
            className="h-8 text-xs bg-input border-border w-full"
            data-ocid={`admin.row.${ocidIndex}`}
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <SelectValue />
            )}
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value={OrderStatus.pending} className="text-xs">
              Pending
            </SelectItem>
            <SelectItem value={OrderStatus.inProgress} className="text-xs">
              In Progress
            </SelectItem>
            <SelectItem value={OrderStatus.completed} className="text-xs">
              Completed
            </SelectItem>
            <SelectItem value={OrderStatus.cancelled} className="text-xs">
              Cancelled
            </SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
    </TableRow>
  );
}

// ─────────────────────────────────────────────
// ORDERS DASHBOARD
// ─────────────────────────────────────────────

interface OrdersDashboardProps {
  onLogout: () => void;
}

function OrdersDashboard({ onLogout }: OrdersDashboardProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const {
    data: orders = [],
    isLoading: ordersLoading,
    isError: ordersError,
    refetch,
    isFetching,
  } = useAllOrders();

  const { data: services = [], isLoading: servicesLoading } = useAllServices();

  const isLoading = ordersLoading || servicesLoading;

  // Count by status
  const counts = {
    all: orders.length,
    [OrderStatus.pending]: orders.filter(
      (o) => o.status === OrderStatus.pending,
    ).length,
    [OrderStatus.inProgress]: orders.filter(
      (o) => o.status === OrderStatus.inProgress,
    ).length,
    [OrderStatus.completed]: orders.filter(
      (o) => o.status === OrderStatus.completed,
    ).length,
    [OrderStatus.cancelled]: orders.filter(
      (o) => o.status === OrderStatus.cancelled,
    ).length,
  };

  const filteredOrders =
    activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

  const tabs: { value: FilterTab; label: string }[] = [
    { value: "all", label: "All" },
    { value: OrderStatus.pending, label: "Pending" },
    { value: OrderStatus.inProgress, label: "In Progress" },
    { value: OrderStatus.completed, label: "Completed" },
    { value: OrderStatus.cancelled, label: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/15 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-base text-foreground leading-none">
                <span className="text-primary">Admin</span> Panel
              </h1>
              <p className="text-muted-foreground text-xs mt-0.5">
                Legion Services — Order Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="border-border text-muted-foreground hover:text-foreground h-8 gap-1.5"
              data-ocid="admin.refresh_button"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                window.location.hash = "";
              }}
              className="text-muted-foreground hover:text-foreground h-8 gap-1.5"
              data-ocid="admin.back_button"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to Site</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-muted-foreground hover:text-destructive h-8 gap-1.5"
              data-ocid="admin.logout_button"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            {
              label: "Total Orders",
              value: counts.all,
              color: "text-foreground",
            },
            {
              label: "Pending",
              value: counts[OrderStatus.pending],
              color: "text-amber-400",
            },
            {
              label: "In Progress",
              value: counts[OrderStatus.inProgress],
              color: "text-blue-400",
            },
            {
              label: "Completed",
              value: counts[OrderStatus.completed],
              color: "text-emerald-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-lg px-4 py-3"
            >
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 bg-muted" />
              ) : (
                <p
                  className={`font-display font-extrabold text-2xl ${stat.color}`}
                >
                  {stat.value}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Filter tabs + table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Tab bar */}
          <div className="border-b border-border px-4 pt-4">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as FilterTab)}
            >
              <TabsList className="bg-muted/40 border border-border/50 p-1 h-auto gap-1 flex-wrap">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold px-3 py-1.5 h-auto gap-1.5"
                    data-ocid="admin.tab"
                  >
                    {tab.label}
                    <span className="bg-background/40 text-current rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none min-w-[18px] text-center">
                      {isLoading
                        ? "…"
                        : ((counts as Record<string, number>)[tab.value] ?? 0)}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="p-6 space-y-3" data-ocid="admin.loading_state">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-muted/50 rounded" />
              ))}
            </div>
          )}

          {/* Error state */}
          {!isLoading && ordersError && (
            <div
              className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4"
              data-ocid="admin.error_state"
            >
              <AlertCircle className="h-10 w-10 text-destructive opacity-70" />
              <p className="font-semibold text-foreground">
                Failed to load orders
              </p>
              <p className="text-sm text-muted-foreground max-w-xs">
                There was an error fetching orders from the backend. Check your
                connection and try refreshing.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-2 border-border"
                data-ocid="admin.refresh_button"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Try Again
              </Button>
            </div>
          )}

          {/* Orders table */}
          {!isLoading &&
            !ordersError &&
            (filteredOrders.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4"
                data-ocid="admin.empty_state"
              >
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-muted-foreground opacity-50" />
                </div>
                <p className="font-semibold text-foreground">No orders found</p>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "all"
                    ? "No orders have been placed yet."
                    : `No orders with status "${statusLabel(activeTab as OrderStatus)}".`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="admin.table">
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider w-16">
                        ID
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                        Service
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider w-20 text-center">
                        Qty
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider w-36">
                        Payment
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                        Contact
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                        Notes
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider w-32">
                        Status
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider w-40">
                        Update Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order, index) => (
                      <OrderRow
                        key={order.id.toString()}
                        order={order}
                        index={index}
                        services={services}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Legion Services Admin Panel — {filteredOrders.length} order
          {filteredOrders.length !== 1 ? "s" : ""} shown
        </p>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN PAGE ROOT
// ─────────────────────────────────────────────

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(SESSION_KEY) === "true";
  });

  function handleLogin() {
    setIsAuthenticated(true);
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    window.location.hash = "";
  }

  if (!isAuthenticated) {
    return <LoginPanel onLogin={handleLogin} />;
  }

  return <OrdersDashboard onLogout={handleLogout} />;
}
