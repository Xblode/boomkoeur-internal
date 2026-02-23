'use client'

import { useState, useRef } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Modal, ModalFooter } from '@/components/ui/organisms'
import { Button, FileInput, Label, Select, FormLabel } from '@/components/ui/atoms'
import { FileUp, Upload, AlertCircle } from 'lucide-react'
import Papa from 'papaparse'

interface ImportCSVModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface CSVRow {
  date?: string
  label?: string
  amount?: string
  type?: string
  category?: string
  payment_method?: string
  [key: string]: string | undefined
}

export default function ImportCSVModal({ isOpen, onClose, onSuccess }: ImportCSVModalProps) {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<CSVRow[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setErrors([])
    setPreview([])

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setErrors(results.errors.map((e) => `Ligne ${e.row}: ${e.message}`))
          return
        }

        const data = results.data as CSVRow[]
        setPreview(data.slice(0, 5)) // Afficher les 5 premieres lignes

        // Detection automatique des colonnes
        if (data.length > 0) {
          const headers = Object.keys(data[0])
          const autoMapping: Record<string, string> = {}

          headers.forEach((header) => {
            const lowerHeader = header.toLowerCase()
            if (lowerHeader.includes('date')) autoMapping.date = header
            if (lowerHeader.includes('libelle') || lowerHeader.includes('label') || lowerHeader.includes('description'))
              autoMapping.label = header
            if (lowerHeader.includes('montant') || lowerHeader.includes('amount') || lowerHeader.includes('somme'))
              autoMapping.amount = header
            if (lowerHeader.includes('type') || lowerHeader.includes('sens'))
              autoMapping.type = header
            if (lowerHeader.includes('categorie') || lowerHeader.includes('category'))
              autoMapping.category = header
            if (lowerHeader.includes('moyen') || lowerHeader.includes('payment') || lowerHeader.includes('mode'))
              autoMapping.payment_method = header
          })

          setMapping(autoMapping)
        }
      },
      error: (error) => {
        setErrors([`Erreur de parsing: ${error.message}`])
      },
    })
  }

  const handleImport = async () => {
    if (!file) return

    try {
      setLoading(true)
      setErrors([])

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const data = results.data as CSVRow[]
          const imported: string[] = []
          const failed: string[] = []

          for (let i = 0; i < data.length; i++) {
            const row = data[i]

            try {
              const date = row[mapping.date || 'date']
              const label = row[mapping.label || 'label']
              const amount = parseFloat(row[mapping.amount || 'amount']?.replace(',', '.') || '0')
              const type = row[mapping.type || 'type']?.toLowerCase() || 'expense'
              const category = row[mapping.category || 'category'] || 'Autres charges'
              const paymentMethod = row[mapping.payment_method || 'payment_method'] || 'Virement'

              if (!date || !label || amount === 0) {
                failed.push(`Ligne ${i + 2}: Donnees manquantes`)
                continue
              }

              await financeDataService.createTransaction({
                date,
                label,
                amount,
                type: type.includes('entree') || type.includes('income') || type === 'credit' ? 'income' : 'expense',
                category,
                payment_method: paymentMethod,
                status: 'pending',
                bank_account_id: undefined,
                fiscal_year: new Date(date).getFullYear(),
                reconciled: false,
                vat_applicable: false,
              })

              imported.push(`Ligne ${i + 2}`)
            } catch (error) {
              failed.push(`Ligne ${i + 2}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
            }
          }

          if (failed.length > 0) {
            setErrors(failed)
          }

          if (imported.length > 0) {
            alert(`${imported.length} transaction(s) importee(s) avec succes${failed.length > 0 ? `\n${failed.length} erreur(s)` : ''}`)
            handleClose()
            onSuccess?.()
          } else {
            alert('Aucune transaction importee')
          }
        },
      })
    } catch (error) {
      console.error('Erreur lors de l\'import:', error)
      setErrors([`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`])
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreview([])
    setMapping({})
    setErrors([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  const availableFields = ['date', 'label', 'amount', 'type', 'category', 'payment_method']
  const csvHeaders = preview.length > 0 ? Object.keys(preview[0]) : []

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importer un releve CSV" size="lg" scrollable>
      <div className="space-y-6">
        {/* Upload */}
        <div>
          <FormLabel className="mb-2">
            Fichier CSV *
          </FormLabel>
          <div className="border-2 border-dashed border-border-custom rounded-lg p-8 text-center">
            <FileInput
              ref={fileInputRef}
              variant="hidden"
              accept=".csv"
              onChange={handleFileSelect}
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <Upload className="w-12 h-12 text-zinc-500" />
              <div>
                <p className="font-heading text-sm mb-1">Cliquez pour selectionner un fichier CSV</p>
                <p className="text-xs text-zinc-500">ou glissez-deposez le fichier ici</p>
              </div>
              {file && (
                <p className="text-sm text-zinc-900 dark:text-zinc-50 font-medium">{file.name}</p>
              )}
            </label>
          </div>
        </div>

        {/* Mapping des colonnes */}
        {preview.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-heading text-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Mapping des colonnes
            </h3>
            <div className="space-y-3">
              {availableFields.map((field) => (
                <div key={field}>
                  <FormLabel className="mb-2">
                    {field === 'date' ? 'Date' : field === 'label' ? 'Libelle' : field === 'amount' ? 'Montant' : field === 'type' ? 'Type' : field === 'category' ? 'Categorie' : 'Moyen de paiement'}
                  </FormLabel>
                  <Select
                    value={mapping[field] || ''}
                    onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                    options={[
                      { value: '', label: 'Non mappe' },
                      ...csvHeaders.map((header) => ({ value: header, label: header })),
                    ]}
                  />
                </div>
              ))}
            </div>

            {/* Apercu */}
            <div>
              <h3 className="font-heading text-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                Apercu (5 premieres lignes)
              </h3>
              <div className="border-2 border-border-custom rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-background-tertiary">
                    <tr>
                      {csvHeaders.map((header) => (
                        <th key={header} className="px-3 py-2 text-left font-heading text-xs uppercase text-zinc-500">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t border-border-custom">
                        {csvHeaders.map((header) => (
                          <td key={header} className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                            {row[header] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Erreurs */}
        {errors.length > 0 && (
          <div className="p-4 bg-red-500/10 border-2 border-red-500/50 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-heading text-sm uppercase text-red-400 mb-1">Erreurs</h4>
                <ul className="text-sm text-zinc-500 space-y-1">
                  {errors.slice(0, 10).map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                  {errors.length > 10 && <li>... et {errors.length - 10} autre(s) erreur(s)</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleImport}
          disabled={loading || !file || preview.length === 0}
        >
          <FileUp className="w-4 h-4 mr-2" />
          {loading ? 'Import en cours...' : 'Importer'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

