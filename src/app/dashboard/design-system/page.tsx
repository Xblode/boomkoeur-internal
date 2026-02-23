'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Component, Layers, LayoutTemplate, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionHeader } from '@/components/ui/molecules';
import dynamic from 'next/dynamic';

// Dynamic Imports with Loading State
const ButtonDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/ButtonDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const InputDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/InputDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const LabelDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/LabelDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const TextareaDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/TextareaDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const SelectDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/SelectDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const CheckboxDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/CheckboxDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const RadioDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/RadioDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const SwitchDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/SwitchDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const SliderDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/SliderDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const BadgeDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/BadgeDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const AvatarDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/AvatarDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const ChipDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/ChipDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const SpinnerDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/SpinnerDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const SkeletonDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/SkeletonDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const ProgressDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/ProgressDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const DividerDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/DividerDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const IconDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/IconDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const LinkDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/LinkDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const TypographyDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/TypographyDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const IconButtonDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/IconButtonDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const RatingDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/RatingDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const StatusDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/StatusDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});

const ColorsDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/ColorsDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});

const CardDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/CardDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const EmptyStateDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/EmptyStateDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const DetailHeaderDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/DetailHeaderDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const SearchInputDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/SearchInputDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});
const OrganismsDemo = dynamic(() => import('@/components/feature/DesignSystem/demos/OrganismsDemo'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
});

// Placeholder for missing demos
const ComingSoon = ({ name }: { name: string }) => (
  <div className="p-12 text-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
    {name} documentation coming soon...
  </div>
);

// Types pour la navigation
type Category = 'atoms' | 'molecules' | 'organisms';

interface NavItem {
  id: string;
  label: string;
}

interface NavSection {
  id: Category;
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'atoms',
    label: 'Atoms',
    icon: <Component size={18} />,
    items: [
      { id: 'colors', label: 'Couleurs' },
      { id: 'button', label: 'Button' },
      { id: 'icon-button', label: 'IconButton' },
      { id: 'input', label: 'Input' },
      { id: 'textarea', label: 'Textarea' },
      { id: 'select', label: 'Select' },
      { id: 'checkbox', label: 'Checkbox' },
      { id: 'radio', label: 'Radio' },
      { id: 'switch', label: 'Switch' },
      { id: 'slider', label: 'Slider' },
      { id: 'rating', label: 'Rating' },
      { id: 'label', label: 'Label' },
      { id: 'badge', label: 'Badge' },
      { id: 'status', label: 'Tag / Dot' },
      { id: 'chip', label: 'Chip' },
      { id: 'avatar', label: 'Avatar' },
      { id: 'spinner', label: 'Spinner' },
      { id: 'skeleton', label: 'Skeleton' },
      { id: 'progress', label: 'Progress' },
      { id: 'divider', label: 'Divider' },
      { id: 'icon', label: 'Icon' },
      { id: 'link', label: 'Link' },
      { id: 'typography', label: 'Heading / Text' },
      { id: 'toaster', label: 'Toaster' },
    ]
  },
  {
    id: 'molecules',
    label: 'Molecules',
    icon: <Layers size={18} />,
    items: [
      { id: 'card', label: 'Card' },
      { id: 'section-header', label: 'SectionHeader' },
      { id: 'empty-state', label: 'EmptyState' },
      { id: 'breadcrumb', label: 'Breadcrumb' },
      { id: 'form-field', label: 'FormField' },
      { id: 'search-input', label: 'SearchInput' },
    ]
  },
  {
    id: 'organisms',
    label: 'Organisms',
    icon: <LayoutTemplate size={18} />,
    items: [
      { id: 'header', label: 'Header' },
      { id: 'sidebar', label: 'Sidebar' },
      { id: 'footer', label: 'Footer' },
    ]
  }
];

export default function DesignSystemPage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    atoms: true,
    molecules: true,
    organisms: true
  });
  
  const [activeItem, setActiveItem] = useState<string>('button');
  const [activeSection, setActiveSection] = useState<Category>('atoms');

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleItemClick = (itemId: string, sectionId: Category) => {
    setActiveItem(itemId);
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (activeItem) {
      // Atoms
      case 'colors': return <ColorsDemo />;
      case 'button': return <ButtonDemo />;
      case 'icon-button': return <IconButtonDemo />;
      case 'input': return <InputDemo />;
      case 'textarea': return <TextareaDemo />;
      case 'select': return <SelectDemo />;
      case 'checkbox': return <CheckboxDemo />;
      case 'radio': return <RadioDemo />;
      case 'switch': return <SwitchDemo />;
      case 'slider': return <SliderDemo />;
      case 'rating': return <RatingDemo />;
      case 'label': return <LabelDemo />;
      case 'badge': return <BadgeDemo />;
      case 'status': return <StatusDemo />;
      case 'chip': return <ChipDemo />;
      case 'avatar': return <AvatarDemo />;
      case 'spinner': return <SpinnerDemo />;
      case 'skeleton': return <SkeletonDemo />;
      case 'progress': return <ProgressDemo />;
      case 'divider': return <DividerDemo />;
      case 'icon': return <IconDemo />;
      case 'link': return <LinkDemo />;
      case 'typography': return <TypographyDemo />;
      
      // Molecules
      case 'card': return <CardDemo />;
      case 'section-header': return <DetailHeaderDemo />;
      case 'empty-state': return <EmptyStateDemo />;
      case 'search-input': return <SearchInputDemo />;
      
      // Organisms
      case 'header': 
      case 'sidebar': 
      case 'footer': return <OrganismsDemo />;
      
      default: return <ComingSoon name={activeItem} />;
    }
  };

  const renderSectionHeader = () => {
    switch (activeSection) {
      case 'atoms':
        return (
          <div className="pb-4 border-b border-border-custom mb-8">
            <SectionHeader
              icon={<Component size={28} className="text-zinc-500" />}
              title="Atoms"
              subtitle="Les briques élémentaires de l'interface."
            />
          </div>
        );
      case 'molecules':
        return (
          <div className="pb-4 border-b border-border-custom mb-8">
            <SectionHeader
              icon={<Layers size={28} className="text-zinc-500" />}
              title="Molecules"
              subtitle="Des composants plus complexes formés d'atomes."
            />
          </div>
        );
      case 'organisms':
        return (
          <div className="pb-4 border-b border-border-custom mb-8">
            <SectionHeader
              icon={<LayoutTemplate size={28} className="text-zinc-500" />}
              title="Organisms"
              subtitle="Les sections majeures de l'interface."
            />
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-60px)]">
      
      {/* Sidebar de navigation (Sticky) - Collée à gauche */}
      <aside className="w-64 shrink-0 bg-card border-r border-border-custom sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="px-2">
            <h2 className="font-bold text-lg mb-1">Design System</h2>
            <p className="text-xs text-zinc-500">Documentation des composants</p>
          </div>
          
          <div className="space-y-1">
            {NAV_SECTIONS.map((section) => (
              <div key={section.id} className="space-y-1">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-foreground hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {section.icon}
                    <span>{section.label}</span>
                  </div>
                  {openSections[section.id] ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
                
                {openSections[section.id] && (
                  <div className="ml-2 pl-2 border-l border-border-custom space-y-0.5">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id, section.id)}
                        className={cn(
                          "block w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors",
                          activeItem === item.id
                            ? "bg-zinc-100 dark:bg-zinc-800 text-foreground font-medium"
                            : "text-zinc-500 hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 min-w-0 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {renderSectionHeader()}
          <div className="min-h-[400px]">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
