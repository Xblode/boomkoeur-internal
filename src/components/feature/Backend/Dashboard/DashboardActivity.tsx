'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  ArrowRight,
  Instagram,
  Facebook,
  MessageCircle,
  Inbox,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/molecules';
import { Badge } from '@/components/ui/atoms';
import { fadeInUp } from '@/lib/animations';
import type { Order } from '@/types/order';
import type { SocialPost } from '@/types/communication';

export interface DashboardActivityData {
  pendingOrders: Order[];
  scheduledPosts: SocialPost[];
}

interface DashboardActivityProps {
  data: DashboardActivityData;
}

function getPlatformIcon(platform: string) {
  switch (platform) {
    case 'instagram':
      return <Instagram className="w-3.5 h-3.5" />;
    case 'facebook':
      return <Facebook className="w-3.5 h-3.5" />;
    case 'tiktok':
      return <MessageCircle className="w-3.5 h-3.5" />;
    default:
      return <MessageCircle className="w-3.5 h-3.5" />;
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'brainstorming':
      return 'outline';
    case 'created':
      return 'secondary';
    case 'review':
      return 'warning';
    case 'validated':
      return 'success';
    case 'scheduled':
      return 'info';
    default:
      return 'default';
  }
}

export function DashboardActivity({ data }: DashboardActivityProps) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <Card className="rounded-lg shadow-sm border-border-custom">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold">Commandes récentes</CardTitle>
          <Link
            href="/dashboard/products"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {data.pendingOrders.length > 0 ? (
            <ul className="space-y-2">
              {data.pendingOrders.slice(0, 3).map((order) => (
                <li key={order.id}>
                  <Link href={`/dashboard/products?tab=orders&orderId=${order.id}`}>
                    <motion.div
                      className="flex items-center justify-between p-3 rounded-lg transition-colors group bg-surface-elevated border border-border-custom hover:bg-surface-subtle hover:border-border-custom/80 cursor-pointer"
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                      <Package className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
                      <span className="font-medium truncate text-sm group-hover:underline">
                        {order.customer_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-mono tabular-nums">
                        {order.total.toLocaleString('fr-FR')} €
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {order.status}
                      </Badge>
                    </div>
                    </motion.div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Inbox className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm font-medium text-foreground">Aucune commande en attente</p>
              <p className="text-xs text-muted-foreground mt-1">
                Les nouvelles commandes apparaîtront ici
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-sm border-border-custom">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold">Planning Social</CardTitle>
          <Link
            href="/dashboard/communication"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {data.scheduledPosts.length > 0 ? (
            <ul className="space-y-2">
              {data.scheduledPosts.slice(0, 3).map((post) => (
                <li key={post.id}>
                  <Link href={`/dashboard/communication/${post.id}`}>
                    <motion.div
                      className="flex items-center justify-between p-3 rounded-lg transition-colors group bg-surface-elevated border border-border-custom hover:bg-surface-subtle hover:border-border-custom/80 cursor-pointer"
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0">
                        {getPlatformIcon(post.platform)}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium capitalize group-hover:underline truncate">
                          {post.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {post.scheduledDate &&
                            new Date(post.scheduledDate).toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              day: 'numeric',
                            })}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={getStatusBadgeVariant(post.status)}
                      className="text-xs flex-shrink-0"
                    >
                      {post.status}
                    </Badge>
                    </motion.div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Inbox className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm font-medium text-foreground">Aucun post planifié cette semaine</p>
              <p className="text-xs text-muted-foreground mt-1">
                Planifiez vos publications dans Communication
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
