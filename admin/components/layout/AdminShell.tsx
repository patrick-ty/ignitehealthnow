'use client'

import { usePathname } from 'next/navigation'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import AdvocateLauncher from '@/components/advocate/AdvocateLauncher'

export default function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen bg-page text-body">
      <AdminSidebar email={email} />
      <div className="flex min-h-screen w-full flex-col lg:pl-60">
        <AdminHeader pathname={pathname} email={email} />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
      <AdvocateLauncher />
    </div>
  )
}
