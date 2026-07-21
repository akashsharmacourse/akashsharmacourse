export const sidebarData = {
  logo: '/logo.png',
  logoAlt: 'AskAkashSharma',
  links: [
    { label: 'Home', href: '/', icon: 'LayoutDashboard' },
    { label: 'My Courses', href: '/courses', icon: 'BookOpen' },
    { label: 'Support', href: '/support', icon: 'MessageCircle' },
    { label: 'Profile', href: '/profile', icon: 'User' },
  ],
  logout: 'Logout',
}

export const homeData = {
  greeting: 'Welcome back',
  subheading: 'Continue where you left off.',
  statsCards: [
    { icon: 'BookOpen', label: 'Enrolled Courses', key: 'enrolledCourses' },
    { icon: 'CheckCircle', label: 'Completed Chapters', key: 'completedChapters' },
    { icon: 'Clock', label: 'Watch Time', key: 'watchTime' },
    { icon: 'TrendingUp', label: 'Overall Progress', key: 'progress' },
  ],
}

export const liveSessionsData = {
  badge: 'Live Sessions',
  heading: 'Upcoming Sessions',
  subheading: 'Join live sessions with Akash Sir — links will appear here before each session.',
  empty: 'No upcoming sessions scheduled. Check back soon.',
  pastHeading: 'Past Session Recordings',
  pastEmpty: 'No past recordings available yet.',
}

export const supportData = {
  badge: 'Support',
  heading: 'How can we help?',
  subheading: 'Reach out to us via WhatsApp or email — we typically respond within 24 hours.',
  options: [
    {
      icon: 'MessageCircle',
      title: 'WhatsApp Support',
      desc: 'Chat directly with Akash Sir on WhatsApp.',
      cta: 'Chat on WhatsApp',
      href: 'https://wa.me/919650213917',
    },
    {
      icon: 'Mail',
      title: 'Email Support',
      desc: 'Send us an email and we will get back to you.',
      cta: 'Send Email',
      href: 'mailto:akashsharmatrades@gmail.com',
    },
  ],
  faq: [
    {
      q: 'How do I reset my password?',
      a: 'Go to Profile → Change Password. Enter your current password and set a new one.',
    },
    {
      q: 'I cannot see my enrolled course.',
      a: 'Please logout and login again. If the issue persists, contact support on WhatsApp.',
    },
    {
      q: 'Can I download the videos?',
      a: 'No. Videos are protected and can only be watched inside the dashboard.',
    },
  ],
}
