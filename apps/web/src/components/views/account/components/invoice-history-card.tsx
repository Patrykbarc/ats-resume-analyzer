import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useInvoices } from '@/hooks/checkout/useInvoices'
import { format } from 'date-fns'
import { Download, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function InvoiceHistoryCard() {
  const { t } = useTranslation('account')
  const { data: invoices, isLoading } = useInvoices()

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-primary" />
          <CardTitle>{t('invoices.title')}</CardTitle>
        </div>
        <CardDescription>{t('invoices.description')}</CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading && (
          <p className="text-sm text-muted-foreground">
            {t('invoices.loading')}
          </p>
        )}

        {!isLoading && (!invoices || invoices.length === 0) && (
          <p className="text-sm text-muted-foreground">
            {t('invoices.noInvoices')}
          </p>
        )}

        {!isLoading && invoices && invoices.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('invoices.number')}</TableHead>
                <TableHead>{t('invoices.date')}</TableHead>
                <TableHead>{t('invoices.amount')}</TableHead>
                <TableHead>{t('invoices.status')}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-xs">
                    {invoice.number ?? '—'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(invoice.date * 1000), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {formatAmount(invoice.amount, invoice.currency)}
                  </TableCell>
                  <TableCell className="capitalize">
                    {invoice.status ?? '—'}
                  </TableCell>
                  <TableCell>
                    {invoice.pdfUrl && (
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Download className="size-3" />
                        {t('invoices.download')}
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
