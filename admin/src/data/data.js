export const sidebarData = {
  logo: "https://res.cloudinary.com/tmgtqqqg/image/upload/v1785589653/IMG_2488.JPG_qgh8kt.jpg",
  logoAlt: 'Admin Panel',
  links: [
    { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
    { label: 'Courses', href: '/courses', icon: 'BookOpen' },
    { label: 'Students', href: '/students', icon: 'Users' },
    { label: 'Analytics', href: '/analytics', icon: 'BarChart2' },
  ],
  logout: 'Logout',
}

export const dashboardData = {
  stats: [
    { icon: 'Users', label: 'Total Students', key: 'totalStudents' },
    { icon: 'BookOpen', label: 'Total Courses', key: 'totalCourses' },
    { icon: 'IndianRupee', label: 'Total Revenue', key: 'totalRevenue' },
    { icon: 'TrendingUp', label: 'This Month', key: 'thisMonth' },
  ],
}
