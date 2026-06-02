import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { ContentManager } from './ContentManager'

export default async function ContentPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  const role = session.user.role
  if (role !== 'ADMIN' && role !== 'PROPERTY_MANAGER') redirect('/admin/dashboard')

  const [contacts, hours, announcements, officeSections, retailSections] = await Promise.all([
    prisma.staffContact.findMany({ orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] }),
    prisma.buildingHours.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.handbookSection.findMany({ where: { handbook: 'OFFICE' }, orderBy: { sortOrder: 'asc' } }),
    prisma.handbookSection.findMany({ where: { handbook: 'RETAIL' }, orderBy: { sortOrder: 'asc' } }),
  ])

  return (
    <ContentManager
      initialContacts={JSON.parse(JSON.stringify(contacts))}
      initialHours={JSON.parse(JSON.stringify(hours))}
      initialAnnouncements={JSON.parse(JSON.stringify(announcements))}
      initialOfficeSections={JSON.parse(JSON.stringify(officeSections))}
      initialRetailSections={JSON.parse(JSON.stringify(retailSections))}
    />
  )
}
