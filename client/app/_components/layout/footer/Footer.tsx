import Link from 'next/link'
import { BiEuro } from 'react-icons/bi'
import { BiHomeAlt2 } from 'react-icons/bi'
import { BiCalendarAlt } from 'react-icons/bi'

const Footer = () => {
  return (
    // Footer: Visible on devices less wider than "md" breakpoint
    <div className='fixed bottom-0 left-0 right-0 flex h-16 w-screen items-center bg-teal-50 text-white shadow-lg md:hidden'>
      <div className='flex w-full items-center justify-between px-6'>
        <Link href={'/'}>
          <div className='flex items-center justify-center rounded-full text-primary transition-transform duration-300 hover:scale-110'>
            <BiHomeAlt2 className='h-7 w-7' />
          </div>
        </Link>
        <Link href={'/calendar'}>
          <div className='relative flex -translate-y-8 items-center justify-center'>
            <BiCalendarAlt className='z-10 h-12 w-12 rounded-full bg-primary p-2 shadow-lg shadow-primary transition-transform duration-300 hover:scale-110' />
            <div className='absolute inset-0 z-0 h-16 w-16 -translate-x-2 -translate-y-2 rounded-full bg-teal-50 '></div>
          </div>
        </Link>
        <Link href={'/expense'}>
          <div className='flex items-center justify-center transition-transform duration-300 hover:scale-110'>
            <BiEuro className='h-8 w-8 text-primary' />
          </div>
        </Link>
      </div>
    </div>
  )
}

export { Footer }
