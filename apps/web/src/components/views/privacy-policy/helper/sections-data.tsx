import { getEnvs } from '@/lib/getEnv'
import { TFunction } from 'i18next'
import {
  AlertCircle,
  Cookie,
  Eye,
  FileText,
  Lock,
  LucideProps,
  Mail,
  Shield,
  Users
} from 'lucide-react'
import { ForwardRefExoticComponent, ReactNode, RefAttributes } from 'react'

type LucideIcon = ForwardRefExoticComponent<
  Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
>

type Section = {
  id: string
  icon: LucideIcon
  title: string
  content: ReactNode
}

export const getSectionsData = (t: TFunction<'privacy'>): Section[] => [
  {
    id: 'data-collection',
    icon: FileText,
    title: t('sections.dataCollection.title'),
    content: (
      <>
        <h3 className="text-lg font-semibold text-card-foreground">
          {t('sections.dataCollection.personalInfo.title')}
        </h3>
        <p>{t('sections.dataCollection.personalInfo.intro')}</p>
        <ul className="list-disc space-y-2 pl-6">
          {(
            t('sections.dataCollection.personalInfo.items', {
              returnObjects: true
            }) as unknown as string[]
          ).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h3 className="mt-6 text-lg font-semibold text-card-foreground">
          {t('sections.dataCollection.autoCollected.title')}
        </h3>
        <p>{t('sections.dataCollection.autoCollected.intro')}</p>
        <ul className="list-disc space-y-2 pl-6">
          {(
            t('sections.dataCollection.autoCollected.items', {
              returnObjects: true
            }) as unknown as string[]
          ).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </>
    )
  },
  {
    id: 'data-usage',
    icon: Eye,
    title: t('sections.dataUsage.title'),
    content: (
      <>
        <p>{t('sections.dataUsage.intro')}</p>
        <ul className="list-disc space-y-2 pl-6">
          {(
            t('sections.dataUsage.items', {
              returnObjects: true
            }) as unknown as string[]
          ).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </>
    )
  },
  {
    id: 'data-sharing',
    icon: Users,
    title: t('sections.dataSharing.title'),
    content: (
      <>
        <p>{t('sections.dataSharing.intro')}</p>
        <ul className="list-disc space-y-2 pl-6">
          {(
            t('sections.dataSharing.items', {
              returnObjects: true
            }) as unknown as { label: string; description: string }[]
          ).map((item, i) => (
            <li key={i}>
              <strong>{item.label}:</strong> {item.description}
            </li>
          ))}
        </ul>
        <p className="mt-4">{t('sections.dataSharing.footer')}</p>
      </>
    )
  },
  {
    id: 'data-security',
    icon: Lock,
    title: t('sections.dataSecurity.title'),
    content: (
      <>
        <p>{t('sections.dataSecurity.intro')}</p>
        <ul className="list-disc space-y-2 pl-6">
          {(
            t('sections.dataSecurity.items', {
              returnObjects: true
            }) as unknown as string[]
          ).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p className="mt-4">{t('sections.dataSecurity.footer')}</p>
      </>
    )
  },
  {
    id: 'cookies',
    icon: Cookie,
    title: t('sections.cookies.title'),
    content: (
      <>
        <p>{t('sections.cookies.intro')}</p>
        <ul className="list-disc space-y-2 pl-6">
          {(
            t('sections.cookies.items', {
              returnObjects: true
            }) as unknown as string[]
          ).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h3 className="mt-6 text-lg font-semibold text-card-foreground">
          {t('sections.cookies.types.title')}
        </h3>
        <ul className="list-disc space-y-2 pl-6">
          {(
            t('sections.cookies.types.items', {
              returnObjects: true
            }) as unknown as { label: string; description: string }[]
          ).map((item, i) => (
            <li key={i}>
              <strong>{item.label}:</strong> {item.description}
            </li>
          ))}
        </ul>

        <p className="mt-4">{t('sections.cookies.footer')}</p>
      </>
    )
  },
  {
    id: 'user-rights',
    icon: Shield,
    title: t('sections.userRights.title'),
    content: (
      <>
        <p>{t('sections.userRights.intro')}</p>
        <ul className="list-disc space-y-2 pl-6">
          {(
            t('sections.userRights.items', {
              returnObjects: true
            }) as unknown as { label: string; description: string }[]
          ).map((item, i) => (
            <li key={i}>
              <strong>{item.label}:</strong> {item.description}
            </li>
          ))}
        </ul>

        <p className="mt-4">
          {t('sections.userRights.footerPrefix')}{' '}
          <a
            href={`mailto:${getEnvs().VITE_CONTACT_EMAIL}`}
            className="text-primary hover:underline"
          >
            {getEnvs().VITE_CONTACT_EMAIL}
          </a>
          {t('sections.userRights.footerSuffix')}
        </p>
      </>
    )
  },
  {
    id: 'data-retention',
    icon: AlertCircle,
    title: t('sections.dataRetention.title'),
    content: (
      <>
        <p>{t('sections.dataRetention.intro')}</p>
        <ul className="list-disc space-y-2 pl-6">
          {(
            t('sections.dataRetention.items', {
              returnObjects: true
            }) as unknown as string[]
          ).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p className="mt-4">{t('sections.dataRetention.footer')}</p>
      </>
    )
  },
  {
    id: 'children',
    icon: Users,
    title: t('sections.children.title'),
    content: (
      <>
        <p>{t('sections.children.content')}</p>
      </>
    )
  },
  {
    id: 'changes',
    icon: FileText,
    title: t('sections.changes.title'),
    content: (
      <>
        <p>{t('sections.changes.intro')}</p>
        <ul className="list-disc space-y-2 pl-6">
          {(
            t('sections.changes.items', {
              returnObjects: true
            }) as unknown as string[]
          ).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p className="mt-4">{t('sections.changes.footer')}</p>
      </>
    )
  },
  {
    id: 'contact',
    icon: Mail,
    title: t('sections.contact.title'),
    content: (
      <>
        <p>{t('sections.contact.intro')}</p>
        <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
          <dl className="space-y-2">
            <div>
              <dt className="font-semibold text-foreground">
                {t('sections.contact.emailLabel')}
              </dt>
              <dd>
                <a
                  href={`mailto:${getEnvs().VITE_CONTACT_EMAIL}`}
                  className="text-primary hover:underline"
                >
                  {getEnvs().VITE_CONTACT_EMAIL}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </>
    )
  }
]
