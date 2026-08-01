import React from 'react'


export const metadata = {
    title: 'PayRoll Management',
    description: 'Manage employee payroll, salaries, and compensation',
    keywords: ['payroll', 'salary', 'compensation', 'hr'],
    openGraph: {
        title: 'PayRoll Management',
        description: 'Manage employee payroll, salaries, and compensation',
        type: 'website',
    },
    robots: {
        index: false,
        follow: false,
    },
}

export default async function layout({children}) {
    return (
        <div>{children}</div>
    )
}
