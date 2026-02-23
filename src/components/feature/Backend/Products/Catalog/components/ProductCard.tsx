'use client';

import { Product } from '@/types/product';
import { Package, AlertCircle, Edit, Trash2, MessageSquare, Tag, Euro } from 'lucide-react';
import { Card, CardContent, CardMedia, CardFooter } from '@/components/ui/molecules';
import { Badge, IconButton } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'info' | 'success' | 'destructive' | 'secondary' }> = {
  idea:          { label: 'Idée',          variant: 'default' },
  in_production: { label: 'En production', variant: 'info' },
  available:     { label: 'Disponible',    variant: 'success' },
  out_of_stock:  { label: 'Rupture',       variant: 'destructive' },
  archived:      { label: 'Archivé',       variant: 'secondary' },
};

const TYPE_LABELS: Record<string, string> = {
  tshirt: 'T-shirt',
  poster: 'Affiche',
  keychain: 'Porte-clés',
  fan: 'Éventail',
  other: 'Autre',
};

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
}

export default function ProductCard({ product, onClick, onEdit, onDelete }: ProductCardProps) {
  const isLowStock = product.total_stock < product.stock_threshold;
  const statusCfg = STATUS_CONFIG[product.status] ?? STATUS_CONFIG.idea;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(product);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Supprimer "${product.name}" ?`)) {
      onDelete?.(product.id);
    }
  };

  return (
    <Card
      variant="list"
      className="group relative overflow-hidden transition-all duration-300 cursor-pointer flex flex-col h-full hover:shadow-xl"
      onClick={() => onClick?.(product)}
    >
      <CardContent className="p-0 flex flex-col h-full">

        {/* Image carrée avec padding + coins arrondis */}
        <div className="p-2">
          <CardMedia aspectRatio="square" placeholder={!product.main_image}>
            {product.main_image ? (
              <img
                src={product.main_image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={48} className="text-zinc-600" />
              </div>
            )}
          </CardMedia>
        </div>

        {/* Titre + Statut + SKU */}
        <div className="p-4 pb-3">
          <div className="flex items-start gap-2 mb-1">
            <h3 className="flex-1 font-bold text-base text-white leading-tight line-clamp-2 group-hover:text-white/90 transition-colors min-w-0">
              {product.name}
            </h3>
            <Badge variant={statusCfg.variant} className="flex-shrink-0 shadow-none">
              {statusCfg.label}
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 font-mono">{product.sku} · {TYPE_LABELS[product.type] || product.type}</p>
        </div>

        {/* Tags + infos */}
        <div className="px-4 pb-4 space-y-3">
          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-surface-elevated text-text-tertiary"
                >
                  {tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-surface-elevated text-text-tertiary">
                  +{product.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Catégorie / Collection */}
          {(product.category || product.collection) && (
            <p className="text-xs text-zinc-500 truncate">
              {[product.category, product.collection].filter(Boolean).join(' · ')}
            </p>
          )}

          {/* Prix + Stock */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <Euro size={12} className="text-zinc-400 mb-0.5" />
              <span className="text-lg font-bold text-white">
                {product.prices.public.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-500">
                / {product.prices.member.toFixed(2)}€ mbr
              </span>
            </div>

            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
              isLowStock ? 'text-orange-400' : 'text-zinc-400'
            )}>
              {isLowStock && <AlertCircle size={12} />}
              <span>{product.total_stock} unités</span>
            </div>
          </div>
        </div>

        {/* Footer avec actions */}
        <CardFooter variant="list" className="mt-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-white">
            <MessageSquare className="h-4 w-4 text-zinc-400" />
            <span className="font-medium text-zinc-400">{product.comments?.length ?? 0}</span>
          </div>

          <div className="flex items-center gap-1">
            <IconButton
              icon={<Edit className="h-4 w-4" />}
              ariaLabel="Éditer"
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
              title="Éditer"
            />
            <IconButton
              icon={<Trash2 className="h-4 w-4" />}
              ariaLabel="Supprimer"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="p-2 rounded-md text-zinc-400 hover:text-red-400 hover:bg-zinc-700 transition-colors"
              title="Supprimer"
            />
          </div>
        </CardFooter>

      </CardContent>
    </Card>
  );
}
