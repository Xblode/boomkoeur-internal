import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Label, Input } from '@/components/ui/atoms';
import { DatePicker, TimePicker } from '@/components/ui/molecules';
import { Mail, Lock, Search } from 'lucide-react';

export const InputDemo = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [time, setTime] = React.useState("14:30");

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Input</h3>
      <Card>
        <CardContent className="space-y-8 max-w-xl">
          
          {/* Standard Inputs */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Standards</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="demo-email">Email</Label>
                <Input id="demo-email" type="email" placeholder="exemple@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-text">Texte</Label>
                <Input id="demo-text" type="text" placeholder="Entrez du texte..." />
              </div>
            </div>
          </div>

          {/* States */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">États</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="demo-disabled">Désactivé</Label>
                <Input id="demo-disabled" disabled placeholder="Non modifiable" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-error" className="text-red-500">Erreur</Label>
                <Input id="demo-error" error="Ce champ est requis" placeholder="Champ invalide" defaultValue="Valeur incorrecte" />
                <p className="text-xs text-red-500">Ce champ est requis.</p>
              </div>
            </div>
          </div>

          {/* Types de données */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Types de données</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Numérique</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Fichier</Label>
                <Input type="file" className="text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-300 dark:hover:file:bg-zinc-700" />
              </div>
            </div>
            
            {/* Custom Pickers */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date (Smart Picker)</Label>
                <DatePicker date={date} onSelect={setDate} />
              </div>
              <div className="space-y-2">
                <Label>Heure (Smart Picker)</Label>
                <TimePicker time={time} onChange={setTime} />
              </div>
            </div>
          </div>

          {/* With Icons */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Avec Icônes (Layout)</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input className="pl-9" placeholder="Rechercher..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mot de passe</Label>
                <div className="relative">
                  <Input className="pr-9" type="password" placeholder="••••••••" />
                  <Lock className="absolute right-3 top-2.5 h-4 w-4 text-zinc-500" />
                </div>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default InputDemo;
