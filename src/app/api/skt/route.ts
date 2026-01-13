import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';

const notion = new Client({
    auth: process.env.NOTION_SECRET,
});

const DATA_SOURCE_ID = process.env.NOTION_SKT_DATASOURCE_ID;

export async function GET() {
    if (!process.env.NOTION_SECRET || !DATA_SOURCE_ID) {
        console.error('Missing Notion environment variables');
        return NextResponse.json({ error: 'Notion configuration is missing' }, { status: 500 });
    }

    try {
        const response = await (notion as any).dataSources.query({
            data_source_id: DATA_SOURCE_ID.trim(),
            sorts: [
                {
                    property: 'expirationDt',
                    direction: 'ascending',
                },
            ],
        });

        const results = response.results || [];

        const accounts = await Promise.all(results.map(async (page: any) => {
            const props = page.properties;
            if (!props) return null;

            // Helper to extract text from various Notion types
            const getText = async (propName: string) => {
                const prop = props[propName];
                if (!prop) return '-';

                const type = prop.type;
                switch (type) {
                    case 'title':
                    case 'rich_text':
                        return prop[type].map((item: any) => item.plain_text).join('') || '-';
                    case 'select':
                    case 'status':
                        return prop[type]?.name || '-';
                    case 'multi_select':
                        return prop.multi_select.map((item: any) => item.name).join(', ') || '-';
                    case 'email':
                    case 'phone_number':
                    case 'url':
                        return prop[type] || '-';
                    default:
                        return '-';
                }
            };

            // Helper to extract date
            const getDate = (propName: string) => {
                const prop = props[propName];
                if (!prop || !prop.date) return '-';
                return prop.date.start ? prop.date.start.replace(/-/g, '/') : '-';
            };

            const signupDt = getDate('signupDt');

            // Calculate full years (man-years) based on signupDt
            let years = 0;
            if (signupDt !== '-') {
                const today = new Date();
                const signupDate = new Date(signupDt);

                if (!isNaN(signupDate.getTime())) {
                    years = today.getFullYear() - signupDate.getFullYear();
                    const m = today.getMonth() - signupDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < signupDate.getDate())) {
                        years--;
                    }
                }
            }

            return {
                id: page.id,
                icon: page.icon?.type === 'emoji' ? page.icon.emoji : null,
                name: await getText('nameTo'),
                service: await getText('service'),
                signupDt: signupDt,
                account: await getText('account'),
                pwd: await getText('pwd'),
                years: years,
                activationDt: getDate('activationDt'),
                expirationDt: getDate('expirationDt'),
                memo: await getText('memo'),
            };
        }));

        const filteredAccounts = accounts.filter(Boolean);
        return NextResponse.json(filteredAccounts);
    } catch (error: any) {
        console.error('API Route Error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to fetch Notion data',
        }, { status: 500 });
    }
}
