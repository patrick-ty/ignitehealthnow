import Image from 'next/image'
import Link from 'next/link'

type AuthShellProps = {
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
  topLinkHref?: string
  topLinkLabel?: string
}

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  topLinkHref,
  topLinkLabel,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#9E9E9E]/10">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-10 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-stretch">
        <aside className="hidden flex-col justify-between rounded-2xl border border-[#9E9E9E]/30 bg-[#FFFFFF] p-10 shadow-sm lg:flex">
          <div className="space-y-10">
            <div className="flex items-center">
              <Image
                src="/brand/logo-primary.jpeg"
                alt="Ignite Health Now"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-[#212121]">
                Track your health with clarity.
              </h1>
              <p className="mt-4 text-sm text-[#9E9E9E]">
                A private, professional space for your health history, habits, and insights.
              </p>
            </div>
            <div className="space-y-4 text-sm text-[#212121]">
              <div className="rounded-xl border border-[#9E9E9E]/30 bg-[#FFFFFF] p-4">
                <p className="font-medium">Secure by design</p>
                <p className="mt-1 text-sm text-[#9E9E9E]">
                  Your profile data is encrypted and protected.
                </p>
              </div>
              <div className="rounded-xl border border-[#9E9E9E]/30 bg-[#FFFFFF] p-4">
                <p className="font-medium">Personalized journey</p>
                <p className="mt-1 text-sm text-[#9E9E9E]">
                  Build habits and track your progress over time.
                </p>
              </div>
            </div>
          </div>
          <div className="text-xs text-[#9E9E9E]">
            By continuing, you agree to our policies and privacy commitments.
          </div>
        </aside>

        <div className="flex items-center">
          <div className="w-full rounded-2xl border border-[#9E9E9E]/30 bg-[#FFFFFF] p-8 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center lg:hidden">
                <Image
                  src="/brand/logo-primary.jpeg"
                  alt="Ignite Health Now"
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                />
              </div>
              {topLinkHref && topLinkLabel ? (
                <Link
                  href={topLinkHref}
                  className="text-xs font-medium text-[#007ACC] hover:underline"
                >
                  {topLinkLabel}
                </Link>
              ) : (
                <span aria-hidden />
              )}
            </div>
            <h2 className="text-2xl font-semibold text-[#212121]">{title}</h2>
            <p className="mt-2 text-sm text-[#9E9E9E]">{subtitle}</p>
            <div className="mt-8 space-y-6">{children}</div>
            {footer && <div className="mt-8 text-sm text-[#9E9E9E]">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
