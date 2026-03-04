import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  Bitcoin,
  CheckCircle2,
  ChevronDown,
  Crown,
  DollarSign,
  ExternalLink,
  Gem,
  Leaf,
  Loader2,
  Menu,
  Search,
  Shield,
  Sparkles,
  Star,
  Sword,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AdminPage from "./AdminPage";
import {
  type Order,
  OrderStatus,
  PaymentType,
  type Service,
  ServiceCategory,
  useAvailableServices,
  useGetOrder,
  useGetService,
  useSubmitOrder,
} from "./hooks/useQueries";

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

function generateDisplayOrderId(id: bigint): string {
  const num = Number(id);
  const part1 = String(1000 + ((num * 7919) % 9000)).padStart(4, "0");
  const part2 = String.fromCharCode(65 + (num % 26)) + String(num % 10);
  return `LGN-${part1}-${part2}`;
}

const PremiumCategory = "premiumServices" as unknown as ServiceCategory;

// ─────────────────────────────────────────────
// FALLBACK SERVICES (shown while loading or if backend is empty)
// ─────────────────────────────────────────────

const fallbackServices: Service[] = [
  {
    id: BigInt(1),
    name: "Discord Nitro (1 Month)",
    description:
      "Full Discord Nitro subscription for 1 month. Boosted uploads, animated avatars, custom emoji access.",
    priceUSD: 9.99,
    available: true,
    category: ServiceCategory.discordServices,
    acceptedPayments: [PaymentType.money, PaymentType.crypto],
  },
  {
    id: BigInt(2),
    name: "Discord Nitro (3 Months)",
    description:
      "3-month Nitro bundle — best value. Unlock all premium Discord features including Nitro Boost.",
    priceUSD: 24.99,
    available: true,
    category: ServiceCategory.discordServices,
    acceptedPayments: [PaymentType.money, PaymentType.crypto],
  },
  {
    id: BigInt(3),
    name: "Server Boost (x1)",
    description:
      "Single server boost to unlock perks: better audio quality, more emoji slots, custom server banner.",
    priceUSD: 4.99,
    available: true,
    category: ServiceCategory.discordServices,
    acceptedPayments: [
      PaymentType.money,
      PaymentType.crypto,
      PaymentType.inGameFruits,
    ],
  },
  {
    id: BigInt(4),
    name: "Server Boost Bundle (x14)",
    description:
      "Reach Level 3 instantly! Full bundle of 14 boosts for maximum server perks.",
    priceUSD: 59.99,
    available: true,
    category: ServiceCategory.discordServices,
    acceptedPayments: [PaymentType.money, PaymentType.crypto],
  },
  {
    id: BigInt(5),
    name: "Profile Decoration Pack",
    description:
      "Exclusive animated profile decorations. Stand out in every server with rare frames.",
    priceUSD: 14.99,
    available: true,
    category: ServiceCategory.discordServices,
    acceptedPayments: [
      PaymentType.money,
      PaymentType.inGameFruits,
      PaymentType.crypto,
    ],
  },
  {
    id: BigInt(6),
    name: "Blox Fruits Raid Service",
    description:
      "Full raid carry across all 3 seas. Specify which raid (e.g. Flame, Ice, Quake, Buddha, String, Magma, Light, Rumble). We handle all kills — you just join and collect fruits.",
    priceUSD: 7.99,
    available: true,
    category: ServiceCategory.bloxFruits,
    acceptedPayments: [PaymentType.inGameFruits, PaymentType.money],
  },
  {
    id: BigInt(7),
    name: "Sea Event Carry",
    description:
      "Carry through Sea Beasts, Ship Raids, Rumble events, and Castle on Sea. Guaranteed drops — choose your target event and sea (First, Second, or Third).",
    priceUSD: 12.99,
    available: true,
    category: ServiceCategory.bloxFruits,
    acceptedPayments: [
      PaymentType.inGameFruits,
      PaymentType.money,
      PaymentType.crypto,
    ],
  },
  {
    id: BigInt(8),
    name: "V4 Race Awakening",
    description:
      "Complete V4 awakening for any race. Includes Arowe/Uzoth/Hallow quests. Specify your race (Mink, Shark, Angel, Cyborg, or Ghoul). God Human prerequisite available as add-on.",
    priceUSD: 29.99,
    available: true,
    category: ServiceCategory.bloxFruits,
    acceptedPayments: [
      PaymentType.inGameFruits,
      PaymentType.money,
      PaymentType.crypto,
    ],
  },
  {
    id: BigInt(9),
    name: "Rare Fruit Trade",
    description:
      "Source and trade any fruit from our stockpile — Dragon, Leopard, Kitsune, T-Rex, Dough, and more. Specify the fruit in notes. Payment in-game fruits or crypto only.",
    priceUSD: 19.99,
    available: true,
    category: ServiceCategory.bloxFruits,
    acceptedPayments: [PaymentType.inGameFruits, PaymentType.crypto],
  },
  {
    id: BigInt(10),
    name: "Custom Discord Bot Setup",
    description:
      "We build and configure a custom Discord bot for your server — welcome messages, auto-roles, moderation commands, and custom slash commands tailored to your needs.",
    priceUSD: 34.99,
    available: true,
    category: ServiceCategory.discordServices,
    acceptedPayments: [PaymentType.money, PaymentType.crypto],
  },
  {
    id: BigInt(11),
    name: "Fruit Awakening",
    description:
      "Full awakening service for any devil fruit — Dragon, Dough, Leopard, Buddha and more. We farm the required materials and complete all awakening quests for you.",
    priceUSD: 15.99,
    available: true,
    category: ServiceCategory.bloxFruits,
    acceptedPayments: [
      PaymentType.inGameFruits,
      PaymentType.money,
      PaymentType.crypto,
    ],
  },
  {
    id: BigInt(12),
    name: "Power Leveling (Max Level)",
    description:
      "We grind your account from any level to max level (2450). Fast XP routes, sea events, and boss farms included. ETA varies by starting level.",
    priceUSD: 24.99,
    available: true,
    category: ServiceCategory.bloxFruits,
    acceptedPayments: [PaymentType.inGameFruits, PaymentType.money],
  },
  {
    id: BigInt(13),
    name: "Fighting Style Unlock (Dragon Talon / Superhuman)",
    description:
      "Full unlock service for Dragon Talon, Superhuman, Death Step, or Sanguine Art. We complete all ingredient quests and trials — no effort needed from you.",
    priceUSD: 18.99,
    available: true,
    category: ServiceCategory.bloxFruits,
    acceptedPayments: [
      PaymentType.inGameFruits,
      PaymentType.money,
      PaymentType.crypto,
    ],
  },
  {
    id: BigInt(14),
    name: "Boss Bounty Hunting",
    description:
      "Expert boss runs for Bounty gain — we target specific bosses like Cake Prince, Mihawk, God of Destruction and more. Choose your target and desired Bounty range.",
    priceUSD: 9.99,
    available: true,
    category: ServiceCategory.bloxFruits,
    acceptedPayments: [PaymentType.inGameFruits, PaymentType.money],
  },
  {
    id: BigInt(15),
    name: "Legendary Weapon Acquisition (Dark Blade / Yama)",
    description:
      "We obtain legendary weapons for your account — Dark Blade, Yama, Pole V2, and other rare swords. Includes all required quest steps and material farming.",
    priceUSD: 22.99,
    available: true,
    category: ServiceCategory.bloxFruits,
    acceptedPayments: [
      PaymentType.inGameFruits,
      PaymentType.money,
      PaymentType.crypto,
    ],
  },
  {
    id: BigInt(16),
    name: "Race Reroll Service",
    description:
      "We reroll your race using Race Reroll items until you get the race you want — Cyborg, Ghoul, Mink, Shark, Angel, or Human. Specify your desired race in notes.",
    priceUSD: 11.99,
    available: true,
    category: ServiceCategory.bloxFruits,
    acceptedPayments: [PaymentType.inGameFruits, PaymentType.money],
  },
  {
    id: BigInt(17),
    name: "Sword Enchant Service",
    description:
      "Enchant your sword with Fire, Ice, or Electric elements. We complete all material farming and the enchanting process — specify the sword and element in notes.",
    priceUSD: 8.99,
    available: true,
    category: ServiceCategory.bloxFruits,
    acceptedPayments: [PaymentType.inGameFruits, PaymentType.money],
  },
  // ── Premium Services ──
  {
    id: BigInt(18),
    name: "Website Creation",
    description:
      "Custom-built, fully responsive website tailored to your brand. Specify your style, pages, and features in the notes.",
    priceUSD: 149.99,
    available: true,
    category: PremiumCategory,
    acceptedPayments: [PaymentType.money, PaymentType.crypto],
  },
  {
    id: BigInt(19),
    name: "Custom Discord Bot",
    description:
      "Fully custom bot with commands, auto-roles, moderation, and integrations built to your exact specs.",
    priceUSD: 49.99,
    available: true,
    category: PremiumCategory,
    acceptedPayments: [PaymentType.money, PaymentType.crypto],
  },
  {
    id: BigInt(20),
    name: "Premium Role Icons",
    description:
      "Hand-crafted animated or static role icons for every rank in your server. Delivered as a full pack.",
    priceUSD: 19.99,
    available: true,
    category: PremiumCategory,
    acceptedPayments: [PaymentType.money, PaymentType.crypto],
  },
  {
    id: BigInt(21),
    name: "Server Setup & Configuration",
    description:
      "Complete Discord server setup: channels, roles, permissions, bots, and welcome flows.",
    priceUSD: 29.99,
    available: true,
    category: PremiumCategory,
    acceptedPayments: [PaymentType.money, PaymentType.crypto],
  },
  {
    id: BigInt(22),
    name: "Discord Server Template",
    description:
      "Professional server template with structured channels, categories, and role hierarchy.",
    priceUSD: 14.99,
    available: true,
    category: PremiumCategory,
    acceptedPayments: [PaymentType.money, PaymentType.crypto],
  },
  {
    id: BigInt(23),
    name: "Custom Emotes & Stickers Pack",
    description:
      "High-quality emotes and stickers designed to match your server's vibe. Up to 10 items.",
    priceUSD: 24.99,
    available: true,
    category: PremiumCategory,
    acceptedPayments: [PaymentType.money, PaymentType.crypto],
  },
  {
    id: BigInt(24),
    name: "Bot Hosting & Maintenance",
    description:
      "24/7 hosting for your existing bot with uptime monitoring and monthly updates.",
    priceUSD: 9.99,
    available: true,
    category: PremiumCategory,
    acceptedPayments: [PaymentType.money, PaymentType.crypto],
  },
  {
    id: BigInt(25),
    name: "Server Audit & Security Review",
    description:
      "Full review of your server's security, permissions, and bot access with a detailed report.",
    priceUSD: 19.99,
    available: true,
    category: PremiumCategory,
    acceptedPayments: [PaymentType.money, PaymentType.crypto],
  },
  {
    id: BigInt(26),
    name: "Branding Package (Logo + Banner)",
    description:
      "Custom server logo and banner art professionally designed for your community.",
    priceUSD: 39.99,
    available: true,
    category: PremiumCategory,
    acceptedPayments: [PaymentType.money, PaymentType.crypto],
  },
  {
    id: BigInt(27),
    name: "SEO Landing Page",
    description:
      "Clean, fast SEO-optimized landing page for your server or brand. Includes copy and basic meta tags.",
    priceUSD: 79.99,
    available: true,
    category: PremiumCategory,
    acceptedPayments: [PaymentType.money, PaymentType.crypto],
  },
];

// ─────────────────────────────────────────────
// ORDER MODAL
// ─────────────────────────────────────────────

interface OrderModalProps {
  service: Service | null;
  open: boolean;
  onClose: () => void;
}

function OrderModal({ service, open, onClose }: OrderModalProps) {
  const [quantity, setQuantity] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState<PaymentType | "">("");
  const [contactInfo, setContactInfo] = useState("");
  const [notes, setNotes] = useState("");
  const [orderId, setOrderId] = useState<bigint | null>(null);

  const { mutateAsync: submitOrder, isPending } = useSubmitOrder();

  function resetForm() {
    setQuantity("1");
    setPaymentMethod("");
    setContactInfo("");
    setNotes("");
    setOrderId(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!service || !paymentMethod || !contactInfo.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const qty = Number.parseInt(quantity, 10);
    if (Number.isNaN(qty) || qty < 1) {
      toast.error("Quantity must be at least 1.");
      return;
    }
    try {
      const id = await submitOrder({
        serviceId: service.id,
        quantity: BigInt(qty),
        paymentMethod: paymentMethod as PaymentType,
        contactInfo: contactInfo.trim(),
        notes: notes.trim(),
      });
      setOrderId(id);
      toast.success("Order placed successfully!");
    } catch {
      toast.error("Failed to submit order. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="max-w-md border-border bg-popover"
        data-ocid="order.dialog"
      >
        <AnimatePresence mode="wait">
          {orderId !== null ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center py-6 text-center gap-4"
              data-ocid="order.success_state"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-gold">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Order Placed!
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Your order has been received successfully.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg px-6 py-3 border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Order ID
                </p>
                <p className="font-mono text-lg font-bold text-primary">
                  {generateDisplayOrderId(orderId)}
                </p>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                We'll contact you via the info you provided. Keep your Order
                Reference for tracking.
              </p>
              <Button
                onClick={handleClose}
                className="w-full mt-2"
                data-ocid="order.close_button"
              >
                Done
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader className="mb-4">
                <DialogTitle className="font-display text-xl font-bold text-foreground">
                  Place Order
                </DialogTitle>
                {service && (
                  <DialogDescription className="text-muted-foreground">
                    {service.name} —{" "}
                    <span className="text-primary font-semibold">
                      ${service.priceUSD.toFixed(2)}
                    </span>
                  </DialogDescription>
                )}
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Quantity */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="order-quantity"
                    className="text-foreground font-medium"
                  >
                    Quantity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="order-quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-input border-border focus:border-primary"
                    data-ocid="order.input"
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Payment Method <span className="text-destructive">*</span>
                  </Label>
                  {service && (
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(v) => setPaymentMethod(v as PaymentType)}
                      className="space-y-2"
                      data-ocid="order.radio"
                    >
                      {service.acceptedPayments.map((p) => (
                        <div
                          key={p}
                          className={`flex items-center gap-3 rounded-md border px-3 py-2.5 cursor-pointer transition-colors ${
                            paymentMethod === p
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem
                            value={p}
                            id={`payment-${p}`}
                            className="border-muted-foreground text-primary"
                          />
                          <Label
                            htmlFor={`payment-${p}`}
                            className="flex items-center gap-2 cursor-pointer flex-1"
                          >
                            <span
                              className={`${paymentBadgeClass(p)} flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium`}
                            >
                              {paymentIcon(p)}
                              {paymentLabel(p)}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="order-contact"
                    className="text-foreground font-medium"
                  >
                    Discord Tag / Contact{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="order-contact"
                    placeholder="YourName#0001 or @username"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="bg-input border-border focus:border-primary"
                    data-ocid="order.input"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="order-notes"
                    className="text-foreground font-medium"
                  >
                    Notes{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    id="order-notes"
                    placeholder="Any special instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-input border-border focus:border-primary resize-none"
                    rows={3}
                    data-ocid="order.textarea"
                  />
                </div>

                <DialogFooter className="gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1 border-border hover:bg-secondary"
                    disabled={isPending}
                    data-ocid="order.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                    disabled={isPending}
                    data-ocid="order.submit_button"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting…
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// SERVICE CARD
// ─────────────────────────────────────────────

interface ServiceCardProps {
  service: Service;
  index: number;
  onOrder: (service: Service) => void;
}

function ServiceCard({ service, index, onOrder }: ServiceCardProps) {
  const ocidIndex = index + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -4 }}
      data-ocid={`services.item.${ocidIndex}`}
    >
      <Card className="slash-border gradient-border h-full flex flex-col bg-card border-0 overflow-hidden group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="w-8 h-8 rounded bg-primary/15 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/25 transition-colors">
              {(service.category as unknown as string) === "premiumServices" ? (
                <Gem className="h-4 w-4 text-primary" />
              ) : service.category === ServiceCategory.discordServices ? (
                <Crown className="h-4 w-4 text-primary" />
              ) : (
                <Sword className="h-4 w-4 text-primary" />
              )}
            </div>
            <span className="text-primary font-display font-bold text-lg leading-none">
              ${service.priceUSD.toFixed(2)}
            </span>
          </div>
          <CardTitle className="font-display text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
            {service.name}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {service.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-3 flex-1">
          <div className="flex flex-wrap gap-1.5">
            {service.acceptedPayments.map((p) => (
              <span
                key={p}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${paymentBadgeClass(p)}`}
              >
                {paymentIcon(p)}
                {paymentLabel(p)}
              </span>
            ))}
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <Button
            className="w-full bg-primary/10 border border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground font-bold transition-all duration-200 group-hover:shadow-gold-sm"
            onClick={() => onOrder(service)}
            data-ocid={`services.primary_button.${ocidIndex}`}
          >
            Order Now
            <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// SERVICE SKELETONS
// ─────────────────────────────────────────────

function ServiceSkeleton() {
  return (
    <Card className="bg-card border-border h-64">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <Skeleton className="h-8 w-8 rounded bg-muted" />
          <Skeleton className="h-5 w-16 bg-muted" />
        </div>
        <Skeleton className="h-5 w-3/4 bg-muted" />
        <Skeleton className="h-4 w-full bg-muted mt-1" />
        <Skeleton className="h-4 w-2/3 bg-muted" />
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full bg-muted" />
          <Skeleton className="h-5 w-24 rounded-full bg-muted" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-full bg-muted rounded" />
      </CardFooter>
    </Card>
  );
}

// ─────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────

function Navbar({ onOrderClick }: { onOrderClick: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  }

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/legion-shield-transparent.dim_120x120.png"
              alt="Legion Services"
              className="h-8 w-8 object-contain animate-float"
            />
            <span className="font-display font-extrabold text-lg tracking-tight text-foreground">
              <span className="text-primary">LEGION</span>{" "}
              <span className="text-muted-foreground font-light text-sm">
                SERVICES
              </span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollTo("hero")}
              className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded"
              data-ocid="nav.link"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollTo("discord-services")}
              className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded flex items-center gap-1.5"
              data-ocid="nav.link"
            >
              <Crown className="h-3.5 w-3.5 text-primary" />
              Discord
            </button>
            <button
              type="button"
              onClick={() => scrollTo("blox-services")}
              className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded flex items-center gap-1.5"
              data-ocid="nav.link"
            >
              <Sword className="h-3.5 w-3.5 text-violet" />
              Blox Fruits
            </button>
            <button
              type="button"
              onClick={() => scrollTo("premium-services")}
              className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded flex items-center gap-1.5"
              data-ocid="nav.link"
            >
              <Gem className="h-3.5 w-3.5 text-primary" />
              Premium
            </button>
            <button
              type="button"
              onClick={() => scrollTo("track-order")}
              className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded flex items-center gap-1.5"
              data-ocid="nav.link"
            >
              <Search className="h-3.5 w-3.5 text-primary" />
              Track Order
            </button>
            <Button
              size="sm"
              className="ml-3 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
              onClick={onOrderClick}
              data-ocid="nav.primary_button"
            >
              Order Now
            </Button>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            data-ocid="nav.toggle"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background/95 overflow-hidden"
          >
            <div className="flex flex-col px-4 py-3 gap-1">
              <button
                type="button"
                onClick={() => scrollTo("hero")}
                className="text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded"
                data-ocid="nav.link"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => scrollTo("discord-services")}
                className="text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded flex items-center gap-2"
                data-ocid="nav.link"
              >
                <Crown className="h-3.5 w-3.5 text-primary" /> Discord Services
              </button>
              <button
                type="button"
                onClick={() => scrollTo("blox-services")}
                className="text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded flex items-center gap-2"
                data-ocid="nav.link"
              >
                <Sword className="h-3.5 w-3.5 text-violet" /> Blox Fruits
              </button>
              <button
                type="button"
                onClick={() => scrollTo("premium-services")}
                className="text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded flex items-center gap-2"
                data-ocid="nav.link"
              >
                <Gem className="h-3.5 w-3.5 text-primary" /> Premium
              </button>
              <button
                type="button"
                onClick={() => scrollTo("track-order")}
                className="text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded flex items-center gap-2"
                data-ocid="nav.link"
              >
                <Search className="h-3.5 w-3.5 text-primary" /> Track Order
              </button>
              <Button
                className="mt-2 bg-primary text-primary-foreground font-bold"
                onClick={() => {
                  onOrderClick();
                  setMobileOpen(false);
                }}
                data-ocid="nav.primary_button"
              >
                Order Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// ─────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────

function HeroSection({ onBrowse }: { onBrowse: () => void }) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      data-ocid="hero.section"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/assets/generated/hero-bg.dim_1920x1080.jpg')",
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-background/70" />
      {/* Radial gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />

      {/* Decorative diagonal slash lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-1/2 h-full opacity-10"
          style={{
            background:
              "repeating-linear-gradient(-55deg, oklch(0.78 0.16 75) 0px, oklch(0.78 0.16 75) 1px, transparent 1px, transparent 40px)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-primary text-sm font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Premium Gaming & Discord Services
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display font-extrabold text-5xl sm:text-7xl md:text-8xl leading-[0.9] tracking-tight mb-6 text-glow-gold"
        >
          <span className="text-foreground">THE</span>
          <br />
          <span className="text-primary">LEGION</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto mb-8 leading-relaxed"
        >
          Your elite marketplace for Discord Nitro, Server Boosts, Profile
          Decorations, and Blox Fruits services — pay with money, crypto, or
          in-game fruits.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button
            size="lg"
            className="bg-primary text-primary-foreground font-bold text-base px-8 py-6 hover:bg-primary/90 shadow-gold-md"
            onClick={onBrowse}
            data-ocid="hero.primary_button"
          >
            <Zap className="h-4 w-4 mr-2" />
            Browse Services
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-border text-foreground hover:bg-secondary font-semibold text-base px-8 py-6"
            onClick={() =>
              document
                .getElementById("how-it-works")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            data-ocid="hero.secondary_button"
          >
            How It Works
          </Button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-16"
        >
          {[
            { value: "500+", label: "Orders Completed" },
            { value: "3", label: "Payment Methods" },
            { value: "24/7", label: "Support" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display font-extrabold text-2xl sm:text-3xl text-primary">
                {stat.value}
              </p>
              <p className="text-muted-foreground text-sm mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────
// HOW IT WORKS SECTION
// ─────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    {
      icon: <Star className="h-5 w-5 text-primary" />,
      title: "Choose a Service",
      desc: "Browse our Discord and Blox Fruits catalog and pick what you need.",
    },
    {
      icon: <DollarSign className="h-5 w-5 text-emerald-400" />,
      title: "Select Payment",
      desc: "Pay with USD, cryptocurrency, or in-game Blox Fruits.",
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-violet" />,
      title: "Submit & Relax",
      desc: "We'll contact you and deliver your service fast.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 bg-obsidian/50"
      data-ocid="howto.section"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mb-3">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Simple, fast, and trusted. Get your services in three steps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-7 left-[calc(50%+28px)] w-[calc(100%-56px)] h-px bg-gradient-to-r from-border to-transparent" />
              )}
              <div className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center mb-4 z-10">
                {step.icon}
              </div>
              <p className="font-display font-bold text-base text-foreground mb-1">
                {step.title}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// SERVICES SECTION
// ─────────────────────────────────────────────

interface ServicesSectionProps {
  onOrder: (service: Service) => void;
  initialTab?: "discord" | "bloxfruits" | "premium";
}

function ServicesSection({
  onOrder,
  initialTab = "discord",
}: ServicesSectionProps) {
  const { data: backendServices, isLoading, isError } = useAvailableServices();
  // Use backend services if available, otherwise always fall back to hardcoded list
  const services =
    !isError && backendServices && backendServices.length > 0
      ? backendServices
      : fallbackServices;

  const discordServices = services.filter(
    (s) => s.category === ServiceCategory.discordServices,
  );
  const bloxServices = services.filter(
    (s) => s.category === ServiceCategory.bloxFruits,
  );
  const premiumServices = services.filter(
    (s) => (s.category as unknown as string) === "premiumServices",
  );

  return (
    <section
      id="services"
      className="py-24 bg-background"
      data-ocid="services.section"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground mb-4">
            Our <span className="text-primary">Services</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Premium Discord enhancements and elite Blox Fruits gameplay
            services.
          </p>
        </motion.div>

        <Tabs
          defaultValue={initialTab}
          className="w-full"
          data-ocid="services.tab"
        >
          <TabsList className="mb-8 mx-auto flex w-fit bg-card border border-border p-1 rounded-lg gap-1">
            <TabsTrigger
              value="discord"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold flex items-center gap-2 px-5 py-2"
              data-ocid="services.tab"
              id="discord-services"
            >
              <Crown className="h-4 w-4" />
              Discord Services
            </TabsTrigger>
            <TabsTrigger
              value="bloxfruits"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold flex items-center gap-2 px-5 py-2"
              data-ocid="services.tab"
              id="blox-services"
            >
              <Sword className="h-4 w-4" />
              Blox Fruits
            </TabsTrigger>
            <TabsTrigger
              value="premium"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold flex items-center gap-2 px-5 py-2"
              data-ocid="services.tab"
              id="premium-services"
            >
              <Gem className="h-4 w-4" />
              Premium
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discord">
            {isLoading ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                data-ocid="services.loading_state"
              >
                {["sk-d1", "sk-d2", "sk-d3"].map((k) => (
                  <ServiceSkeleton key={k} />
                ))}
              </div>
            ) : discordServices.length === 0 ? (
              <div
                className="text-center py-16 text-muted-foreground"
                data-ocid="services.empty_state"
              >
                <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No Discord services available right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {discordServices.map((s, i) => (
                  <ServiceCard
                    key={s.id.toString()}
                    service={s}
                    index={i}
                    onOrder={onOrder}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bloxfruits">
            {isLoading ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                data-ocid="services.loading_state"
              >
                {["sk-b1", "sk-b2", "sk-b3"].map((k) => (
                  <ServiceSkeleton key={k} />
                ))}
              </div>
            ) : bloxServices.length === 0 ? (
              <div
                className="text-center py-16 text-muted-foreground"
                data-ocid="services.empty_state"
              >
                <Sword className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No Blox Fruits services available right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {bloxServices.map((s, i) => (
                  <ServiceCard
                    key={s.id.toString()}
                    service={s}
                    index={i}
                    onOrder={onOrder}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="premium">
            {isLoading ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                data-ocid="services.loading_state"
              >
                {["sk-p1", "sk-p2", "sk-p3"].map((k) => (
                  <ServiceSkeleton key={k} />
                ))}
              </div>
            ) : premiumServices.length === 0 ? (
              <div
                className="text-center py-16 text-muted-foreground"
                data-ocid="services.empty_state"
              >
                <Gem className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No Premium services available right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {premiumServices.map((s, i) => (
                  <ServiceCard
                    key={s.id.toString()}
                    service={s}
                    index={i}
                    onOrder={onOrder}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// PAYMENT BADGES SHOWCASE
// ─────────────────────────────────────────────

function PaymentSection() {
  return (
    <section
      className="py-16 border-y border-border/50 bg-card/30"
      data-ocid="payment.section"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6 font-semibold">
            Accepted Payment Methods
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              {
                icon: <DollarSign className="h-5 w-5" />,
                label: "USD / Fiat Money",
                cls: "text-emerald-400 bg-emerald-950/60 border-emerald-700/40",
              },
              {
                icon: <Bitcoin className="h-5 w-5" />,
                label: "Cryptocurrency",
                cls: "text-amber-400 bg-amber-950/60 border-amber-700/40",
              },
              {
                icon: <Leaf className="h-5 w-5" />,
                label: "In-Game Fruits",
                cls: "text-purple-300 bg-purple-950/60 border-purple-700/40",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-full border font-semibold text-sm ${item.cls}`}
              >
                {item.icon}
                {item.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// TRACK ORDER SECTION
// ─────────────────────────────────────────────

function statusBadgeClass(status: OrderStatus): string {
  switch (status) {
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

function statusLabel(status: OrderStatus): string {
  switch (status) {
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

interface OrderResultCardProps {
  order: Order;
}

function OrderResultCard({ order }: OrderResultCardProps) {
  const { data: service } = useGetService(order.serviceId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      data-ocid="track.success_state"
    >
      <Card className="bg-card border-border mt-6 overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1 font-semibold">
                Order
              </p>
              <CardTitle className="font-mono text-2xl font-bold text-primary">
                #{order.id.toString()}
              </CardTitle>
            </div>
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusBadgeClass(order.status)}`}
            >
              {statusLabel(order.status)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Service
              </p>
              <p className="text-foreground font-medium text-sm">
                {service ? (
                  service.name
                ) : (
                  <span className="text-muted-foreground italic">Loading…</span>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Quantity
              </p>
              <p className="text-foreground font-medium text-sm">
                {order.quantity.toString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Payment Method
              </p>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${paymentBadgeClass(order.paymentMethod)}`}
              >
                {paymentLabel(order.paymentMethod)}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Contact Info
              </p>
              <p className="text-foreground font-medium text-sm font-mono">
                {order.contactInfo}
              </p>
            </div>
          </div>
          {order.notes && order.notes.trim() !== "" && (
            <div className="space-y-1 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Notes
              </p>
              <p className="text-foreground text-sm leading-relaxed">
                {order.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TrackOrderSection() {
  const [inputValue, setInputValue] = useState("");
  const [searchedId, setSearchedId] = useState<bigint | null>(null);

  const {
    data: order,
    isLoading,
    isError,
    isFetched,
  } = useGetOrder(searchedId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number.parseInt(inputValue.trim(), 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      toast.error("Please enter a valid Order ID.");
      return;
    }
    setSearchedId(BigInt(parsed));
  }

  return (
    <section
      id="track-order"
      className="py-24 bg-obsidian/50 border-t border-border/50"
      data-ocid="track.section"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-primary text-sm font-semibold mb-4">
            <Search className="h-3.5 w-3.5" />
            Order Tracking
          </span>
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground mb-4">
            Track Your <span className="text-primary">Order</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Enter your Order ID to check the current status and details of your
            order.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-lg mx-auto"
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="font-display text-lg font-bold text-foreground">
                Look Up Order
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Enter your Order ID from your confirmation to check status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 1042"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="bg-input border-border focus:border-primary flex-1"
                  data-ocid="track.input"
                />
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 shrink-0"
                  disabled={isLoading}
                  data-ocid="track.submit_button"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-1.5" />
                      Track
                    </>
                  )}
                </Button>
              </form>

              {/* Loading state */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 space-y-3"
                    data-ocid="track.loading_state"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20 bg-muted" />
                        <Skeleton className="h-6 w-28 bg-muted" />
                      </div>
                      <Skeleton className="h-7 w-24 rounded-full bg-muted" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <Skeleton className="h-3 w-16 bg-muted" />
                        <Skeleton className="h-5 w-32 bg-muted" />
                      </div>
                      <div className="space-y-1.5">
                        <Skeleton className="h-3 w-16 bg-muted" />
                        <Skeleton className="h-5 w-12 bg-muted" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error state */}
              <AnimatePresence>
                {isError && isFetched && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3"
                    data-ocid="track.error_state"
                  >
                    <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-destructive">
                        Order not found
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        No order with ID #{searchedId?.toString()} exists.
                        Double-check your Order ID.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success state */}
              <AnimatePresence>
                {order && !isLoading && !isError && (
                  <OrderResultCard order={order} />
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer className="bg-obsidian/80 border-t border-border/50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/legion-shield-transparent.dim_120x120.png"
              alt="Legion Services"
              className="h-8 w-8 object-contain"
            />
            <div>
              <p className="font-display font-extrabold text-foreground text-sm">
                <span className="text-primary">LEGION</span> SERVICES
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Your elite gaming services marketplace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Money
            </span>
            <span className="flex items-center gap-1.5">
              <Bitcoin className="h-3.5 w-3.5 text-amber-400" /> Crypto
            </span>
            <span className="flex items-center gap-1.5">
              <Leaf className="h-3.5 w-3.5 text-purple-300" /> Fruits
            </span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {year} Legion Services. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p>
              Built with <span className="text-primary">♥</span> using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                caffeine.ai
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </p>
            <button
              type="button"
              onClick={() => {
                window.location.hash = "admin";
              }}
              className="text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors text-[10px] tracking-wider"
              data-ocid="admin.link"
            >
              admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    function handleHashChange() {
      setHash(window.location.hash);
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Admin route
  if (hash === "#admin") {
    return (
      <>
        <Toaster
          theme="dark"
          toastOptions={{
            classNames: {
              toast: "bg-card border border-border text-foreground",
              title: "text-foreground font-semibold",
              description: "text-muted-foreground",
            },
          }}
        />
        <AdminPage />
      </>
    );
  }

  return <LandingPage />;
}

function LandingPage() {
  const [orderModal, setOrderModal] = useState<{
    open: boolean;
    service: Service | null;
  }>({
    open: false,
    service: null,
  });

  function openOrder(service: Service) {
    setOrderModal({ open: true, service });
  }

  function openOrderDefault() {
    // Open order modal with first fallback service, or just scroll to services
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  }

  function closeOrder() {
    setOrderModal({ open: false, service: null });
  }

  function scrollToServices() {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <Toaster
        theme="dark"
        toastOptions={{
          classNames: {
            toast: "bg-card border border-border text-foreground",
            title: "text-foreground font-semibold",
            description: "text-muted-foreground",
          },
        }}
      />

      <Navbar onOrderClick={openOrderDefault} />

      <main>
        <HeroSection onBrowse={scrollToServices} />
        <HowItWorksSection />
        <PaymentSection />
        <ServicesSection onOrder={openOrder} />
        <TrackOrderSection />
      </main>

      <Footer />

      <OrderModal
        service={orderModal.service}
        open={orderModal.open}
        onClose={closeOrder}
      />
    </div>
  );
}
