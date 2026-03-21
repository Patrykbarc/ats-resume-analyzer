import { getEnvs } from '@/lib/getEnv'
import { Check, Copy, Share } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'

export function ShareButton({ id }: { id: string }) {
  const { t } = useTranslation('analysis')
  const [copied, setCopied] = useState(false)

  const url = `${getEnvs().VITE_FRONTEND_URL}/analyse/${id}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success(t('share.copiedToast'))
    } catch (err) {
      console.error(err)
      toast.error(t('share.failedToast'))
    }
  }

  const shareOptions = [
    {
      name: 'Twitter',
      icon: '𝕏',
      action: () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(t('share.shareText'))}&url=${encodeURIComponent(url)}`
        window.open(twitterUrl, '_blank')
      }
    },
    {
      name: 'Email',
      icon: '✉',
      action: () => {
        const mailtoUrl = `mailto:?subject=${encodeURIComponent(t('share.shareTitle'))}&body=${encodeURIComponent(`${t('share.shareText')}\n\n${url}`)}`
        window.location.href = mailtoUrl
      }
    }
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" size="lg">
          <Share className="size-4" />
          {t('share.button')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            {t('share.shareOn')}
          </p>
        </div>

        {shareOptions.map((option) => (
          <DropdownMenuItem
            key={option.name}
            onClick={option.action}
            className="cursor-pointer"
          >
            <span className="text-base flex justify-center size-6 aspect-square">
              {option.icon}
            </span>
            <span>{option.name}</span>
          </DropdownMenuItem>
        ))}

        <div className="my-1 border-t border-border" />

        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              <span>{t('share.copied')}</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              <span>{t('share.copyLink')}</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
