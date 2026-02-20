# Guide des Animations et Icônes

Ce fichier documente toutes les animations et icônes disponibles dans le projet.

## 🎬 Framer Motion - Animations

### Animations Prédéfinies

Toutes les animations sont disponibles dans `lib/animations.ts`.

#### 1. Fade Animations

```tsx
import { motion } from 'framer-motion';
import { fadeIn, fadeInUp, fadeInDown, fadeInLeft, fadeInRight } from '@/lib/animations';

// Fade In simple
<motion.div variants={fadeIn} initial="hidden" animate="visible">
  Apparition en fondu
</motion.div>

// Fade In depuis le bas
<motion.div variants={fadeInUp} initial="hidden" animate="visible">
  Apparition depuis le bas
</motion.div>

// Fade In depuis le haut
<motion.div variants={fadeInDown} initial="hidden" animate="visible">
  Apparition depuis le haut
</motion.div>

// Fade In depuis la gauche
<motion.div variants={fadeInLeft} initial="hidden" animate="visible">
  Apparition depuis la gauche
</motion.div>

// Fade In depuis la droite
<motion.div variants={fadeInRight} initial="hidden" animate="visible">
  Apparition depuis la droite
</motion.div>
```

#### 2. Scale & Slide Animations

```tsx
import { scaleIn, slideInBottom, slideInTop } from '@/lib/animations';

// Scale In (zoom)
<motion.div variants={scaleIn} initial="hidden" animate="visible">
  Zoom In
</motion.div>

// Slide depuis le bas
<motion.div variants={slideInBottom} initial="hidden" animate="visible">
  Glisse depuis le bas
</motion.div>

// Slide depuis le haut
<motion.div variants={slideInTop} initial="hidden" animate="visible">
  Glisse depuis le haut
</motion.div>
```

#### 3. Stagger (Animation de Liste)

```tsx
import { staggerContainer, staggerItem } from '@/lib/animations';

<motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
>
  {items.map(item => (
    <motion.div key={item.id} variants={staggerItem}>
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

#### 4. Scroll Reveal

```tsx
import { scrollReveal } from '@/lib/animations';

<motion.div variants={fadeInUp} {...scrollReveal}>
  S'anime quand visible dans le viewport
</motion.div>
```

#### 5. Hover Interactions

```tsx
// Scale au hover
<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
  Hover et Tap
</motion.div>

// Lift au hover
<motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }}>
  Se soulève au hover
</motion.div>

// Rotation au hover
<motion.div whileHover={{ rotate: 180, transition: { duration: 0.3 } }}>
  Rotation
</motion.div>
```

#### 6. Animations Infinies

```tsx
import { bounce, pulse, shake } from '@/lib/animations';

// Rebond continu
<motion.div animate={bounce}>
  Rebondit
</motion.div>

// Pulse continu
<motion.div animate={pulse}>
  Pulse
</motion.div>

// Secoue (une fois)
<motion.div animate={shake}>
  Secoue
</motion.div>
```

### Exemples Complets

#### Hero Section Animé

```tsx
'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';

export const Hero = () => (
  <motion.section
    variants={staggerContainer}
    initial="hidden"
    animate="visible"
  >
    <motion.h1 variants={fadeInUp}>
      Titre Principal
    </motion.h1>
    
    <motion.p variants={fadeInUp}>
      Sous-titre ou description
    </motion.p>
    
    <motion.div variants={fadeInUp}>
      <Button>Call to Action</Button>
    </motion.div>
  </motion.section>
);
```

#### Cards avec Hover

```tsx
<motion.div
  variants={staggerItem}
  whileHover={{ y: -5, transition: { duration: 0.2 } }}
  className="p-6 border rounded-lg"
>
  <h3>Titre de la Card</h3>
  <p>Description</p>
</motion.div>
```

#### Modal Animé

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.9 }}
  transition={{ duration: 0.2 }}
>
  {/* Contenu du modal */}
</motion.div>
```

## 🎭 Lucide React - Icônes

### Icônes Courantes

#### Navigation
```tsx
import { 
  Home, Menu, X, ChevronRight, ChevronDown, ChevronLeft, ChevronUp,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown
} from 'lucide-react';

<Home size={24} />
<Menu size={24} />
<ChevronRight size={20} />
<ArrowRight size={20} />
```

#### Actions
```tsx
import { 
  Plus, Minus, Edit, Trash2, Save, Download, Upload, Copy,
  Share2, ExternalLink, MoreVertical, MoreHorizontal
} from 'lucide-react';

<Plus size={20} />
<Edit size={20} />
<Trash2 size={20} />
<Download size={20} />
```

#### UI Elements
```tsx
import { 
  Search, Filter, Settings, User, Mail, Phone, Bell,
  Calendar, Clock, MapPin, File, Folder
} from 'lucide-react';

<Search size={20} />
<Settings size={20} />
<User size={20} />
<Mail size={20} />
```

#### État et Feedback
```tsx
import { 
  Check, X, AlertCircle, AlertTriangle, Info, HelpCircle,
  CheckCircle, XCircle, Loader2
} from 'lucide-react';

<Check size={20} className="text-green-500" />
<X size={20} className="text-red-500" />
<AlertCircle size={20} className="text-yellow-500" />
<Info size={20} className="text-blue-500" />
```

#### Social
```tsx
import { 
  Facebook, Twitter, Instagram, Linkedin, Github, Youtube
} from 'lucide-react';

<Facebook size={20} />
<Twitter size={20} />
<Instagram size={20} />
<Linkedin size={20} />
```

#### Business
```tsx
import { 
  Briefcase, TrendingUp, TrendingDown, DollarSign, CreditCard,
  ShoppingCart, Package, Truck, BarChart, PieChart
} from 'lucide-react';

<Briefcase size={20} />
<TrendingUp size={20} />
<ShoppingCart size={20} />
<BarChart size={20} />
```

#### Média
```tsx
import { 
  Image, Video, Music, Play, Pause, SkipForward, SkipBack,
  Volume2, VolumeX, Camera, Mic
} from 'lucide-react';

<Image size={20} />
<Play size={20} />
<Camera size={20} />
```

#### Tech
```tsx
import { 
  Code, Terminal, Database, Server, Cpu, HardDrive,
  Wifi, WifiOff, Bluetooth, Battery
} from 'lucide-react';

<Code size={20} />
<Terminal size={20} />
<Database size={20} />
```

### Exemples d'Utilisation

#### Boutons avec Icônes

```tsx
import { Button } from '@/components/ui/atoms';
import { Download, ArrowRight, Trash2 } from 'lucide-react';

// Icône à gauche
<Button variant="primary">
  <Download size={20} className="mr-2" />
  Télécharger
</Button>

// Icône à droite
<Button variant="outline">
  Continuer
  <ArrowRight size={20} className="ml-2" />
</Button>

// Icône seule
<Button variant="ghost" size="sm">
  <Trash2 size={16} />
</Button>
```

#### Navigation avec Icônes

```tsx
import { Home, Users, Settings, LayoutDashboard } from 'lucide-react';

const navigation = [
  { icon: Home, label: 'Accueil', href: '/' },
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Utilisateurs', href: '/users' },
  { icon: Settings, label: 'Paramètres', href: '/settings' },
];

{navigation.map(item => (
  <Link href={item.href} className="flex items-center gap-3">
    <item.icon size={20} />
    <span>{item.label}</span>
  </Link>
))}
```

#### Cards avec Icônes

```tsx
import { Zap, Shield, Rocket } from 'lucide-react';

const features = [
  { 
    icon: Zap, 
    title: 'Rapide', 
    description: 'Performance optimale'
  },
  { 
    icon: Shield, 
    title: 'Sécurisé', 
    description: 'Protection maximale'
  },
  { 
    icon: Rocket, 
    title: 'Moderne', 
    description: 'Technologies récentes'
  },
];

{features.map(feature => (
  <div className="p-6 border rounded-lg">
    <feature.icon size={32} className="mb-4 text-blue-500" />
    <h3 className="font-semibold mb-2">{feature.title}</h3>
    <p className="text-sm text-gray-600">{feature.description}</p>
  </div>
))}
```

#### Alertes avec Icônes

```tsx
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

// Success
<div className="flex items-center gap-2 text-green-600">
  <CheckCircle size={20} />
  <span>Opération réussie</span>
</div>

// Warning
<div className="flex items-center gap-2 text-yellow-600">
  <AlertCircle size={20} />
  <span>Attention requise</span>
</div>

// Info
<div className="flex items-center gap-2 text-blue-600">
  <Info size={20} />
  <span>Information importante</span>
</div>

// Error
<div className="flex items-center gap-2 text-red-600">
  <XCircle size={20} />
  <span>Une erreur est survenue</span>
</div>
```

## 🎨 Combiner Animations et Icônes

```tsx
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';

// Icône avec animation hover
<motion.div
  whileHover={{ scale: 1.2 }}
  whileTap={{ scale: 0.9 }}
  className="cursor-pointer"
>
  <Heart size={24} className="text-red-500" />
</motion.div>

// Icône avec rotation
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
>
  <Star size={24} />
</motion.div>

// Icône avec pulse
<motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
  <Bell size={24} />
</motion.div>
```

## 📚 Ressources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Lucide Icons Gallery](https://lucide.dev/icons/)
- Animations prédéfinies : `src/lib/animations.ts`
- Composant Icon : `src/components/ui/atoms/Icon.tsx`

