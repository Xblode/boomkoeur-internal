# Système de Codes d'Identification Base64

## 📋 Vue d'ensemble

Le système de codes d'identification a été migré vers un format **base64 court et unique** pour faciliter la recherche et l'identification des éléments.

### Ancien format
```
FAC-2026-001      (Facture)
DEV-2026-001      (Devis)
CMD-2026-0001     (Commande)
2025-0001         (Transaction)
```

### Nouveau format
```
FAC-A3F2B1K2      (Facture - 12 caractères)
DEV-X9Z4M3L1      (Devis - 12 caractères)
CMD-K7P2Q8R5      (Commande - 12 caractères)
TRA-B6N1C4D9      (Transaction - 12 caractères)
```

## 🎯 Avantages

- ✅ **Plus court** : 12 caractères au lieu de 13-14
- ✅ **Unique** : Basé sur l'ID unique de l'entité
- ✅ **Pas de collision** : Impossible d'avoir deux codes identiques
- ✅ **Sans année** : Fonctionne indépendamment de l'année
- ✅ **Facile à copier** : Format lisible et mémorisable
- ✅ **Recherche optimisée** : Compatible avec la recherche partielle

## 🚀 Migration

### Option 1 : Interface graphique (Recommandé)

1. Accédez à la page de migration : `/dashboard/admin/migration`
2. Cliquez sur "Lancer la migration"
3. Vérifiez les résultats affichés

### Option 2 : Console navigateur

Ouvrez la console du navigateur (F12) et tapez :

```javascript
window.__migrateToBase64Codes()
```

### Résultat attendu

```
🚀 Début de la migration vers les codes base64...

📄 Migration: FAC-2026-001 → FAC-A3F2B1K2
✅ 5 facture(s) migrée(s)

📦 Migration: CMD-2026-0001 → CMD-K7P2Q8R5
✅ 3 commande(s) migrée(s)

💰 Migration: 2025-0001 → TRA-B6N1C4D9
✅ 12 transaction(s) migrée(s)

✅ Migration terminée avec succès !
```

## 🧪 Tests

### 1. Créer une nouvelle facture

1. Accédez à `/dashboard/finance`
2. Créez une nouvelle facture
3. Vérifiez que le code généré est au format `FAC-XXXXXXXX`

**Attendu** : Code de type `FAC-A3F2B1K2` (12 caractères)

### 2. Créer une nouvelle commande

1. Accédez à `/dashboard/products` (section commandes)
2. Créez une nouvelle commande
3. Vérifiez que le code généré est au format `CMD-XXXXXXXX`

**Attendu** : Code de type `CMD-K7P2Q8R5` (12 caractères)

### 3. Créer une nouvelle transaction

1. Accédez à `/dashboard/finance` (onglet Transactions)
2. Créez une nouvelle transaction
3. Vérifiez que le code généré est au format `TRA-XXXXXXXX`

**Attendu** : Code de type `TRA-B6N1C4D9` (12 caractères)

### 4. Vérifier l'affichage

Les codes doivent s'afficher automatiquement dans :

- ✅ Cartes de factures (`InvoiceCard`)
- ✅ Cartes de commandes (`OrderCard`)
- ✅ Listes de transactions
- ✅ Pages de détail
- ✅ Modals d'édition

### 5. Test de recherche (si applicable)

Testez la recherche avec :
- Code complet : `FAC-A3F2B1K2`
- Code partiel : `FAC-A3F`
- Sans préfixe : `A3F2B1K2`

## 📁 Fichiers modifiés

### Nouveaux fichiers

```
src/lib/utils/generateCode.ts                          ← Utilitaire principal
src/lib/utils/migrations/migrateToBase64Codes.ts      ← Script de migration
src/components/feature/Backend/Admin/MigrationPanel.tsx  ← Interface migration
src/app/dashboard/admin/migration/page.tsx             ← Page migration
```

### Fichiers modifiés

```
src/lib/localStorage/finance/storage.ts                ← generateInvoiceNumber(), generateEntryNumber()
src/lib/localStorage/orders/storage.ts                 ← generateOrderNumber()
src/lib/localStorage/finance/invoices.ts               ← Appel avec ID
src/lib/localStorage/finance/transactions.ts           ← Appel avec ID
src/lib/localStorage/orders/orders.ts                  ← Appel avec ID
```

## 🔧 Utilisation dans le code

### Générer un code

```typescript
import { generateUniqueCode, CODE_PREFIXES } from '@/lib/utils/generateCode';

const id = generateId(); // Votre fonction de génération d'ID
const code = generateUniqueCode(CODE_PREFIXES.INVOICE, id);
// Résultat: "FAC-A3F2B1K2"
```

### Valider un code

```typescript
import { isValidCode, getCodePrefix } from '@/lib/utils/generateCode';

isValidCode('FAC-A3F2B1K2'); // true
isValidCode('FAC-A3F2B1K2', 'FAC'); // true (avec vérification du préfixe)
isValidCode('INVALID'); // false

getCodePrefix('FAC-A3F2B1K2'); // "FAC"
```

### Préfixes disponibles

```typescript
import { CODE_PREFIXES } from '@/lib/utils/generateCode';

CODE_PREFIXES.INVOICE      // "FAC" - Facture
CODE_PREFIXES.QUOTE        // "DEV" - Devis
CODE_PREFIXES.ORDER        // "CMD" - Commande
CODE_PREFIXES.TRANSACTION  // "TRA" - Transaction
```

## ⚠️ Notes importantes

1. **Pas de retour en arrière** : Une fois la migration effectuée, les anciens codes sont perdus (mais l'ID original est préservé)

2. **Sauvegarde** : Bien que les données soient dans localStorage, pensez à faire une sauvegarde avant la migration

3. **Unicité** : Les codes sont basés sur l'ID unique, il ne peut pas y avoir de collision

4. **Longueur** : La longueur par défaut est de 8 caractères base64 + 4 pour le préfixe et le tiret = 12 caractères total

5. **Format** : Le format est `[A-Z]{3}-[A-Z0-9]{8}` (3 lettres, tiret, 8 caractères alphanumériques majuscules)

## 🐛 Dépannage

### Les anciens codes s'affichent encore

→ Vérifiez que la migration a bien été exécutée  
→ Rafraîchissez la page (Ctrl+F5)  
→ Vérifiez la console pour des erreurs

### Erreur "Buffer is not defined"

→ Vérifiez que l'import de `Buffer` fonctionne côté client  
→ Si nécessaire, utilisez `btoa()` à la place de `Buffer.from().toString('base64')`

### Les nouveaux éléments ont toujours l'ancien format

→ Vérifiez que les fonctions de génération ont bien été modifiées  
→ Vérifiez que l'ID est bien passé en paramètre

## 📞 Support

Si vous rencontrez des problèmes, vérifiez :

1. La console du navigateur pour les erreurs
2. Le localStorage : `localStorage.getItem('finance_invoices')`
3. Les logs de migration dans la console

---

**Dernière mise à jour** : 2 février 2026  
**Version** : 1.0.0
