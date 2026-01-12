import { NextResponse } from 'next/server';

const NOTION_SECRET = process.env.NOTION_SECRET;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

export async function GET() {
    if (!NOTION_SECRET || !DATABASE_ID) {
        console.error('Missing Notion environment variables');
        return NextResponse.json({ error: 'Notion configuration is missing' }, { status: 500 });
    }

    try {
        const url = `https://api.notion.com/v1/databases/${DATABASE_ID.trim()}/query`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_SECRET}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sorts: [
                    {
                        property: '이름',
                        direction: 'ascending',
                    },
                ],
            }),
            cache: 'no-store', // Disable caching for the API route
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Notion API error response:', errorData);
            throw new Error(errorData.message || 'Failed to fetch from Notion');
        }

        const data = await response.json();
        const results = data.results || [];

        const accounts = results.map((page: any) => {
            const props = page.properties;
            if (!props) return null;

            // Helper to extract text from various Notion types
            const getText = (propName: string) => {
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

            // Helper to extract number
            const getNumber = (propName: string) => {
                const prop = props[propName];
                if (!prop || prop.type !== 'number') return 0;
                return prop.number || 0;
            };

            return {
                id: page.id,
                name: getText('이름'),
                enrollDate: getDate('가입일'),
                account: getText('계정'),
                pw: getText('비밀번호'),
                years: getNumber('가입년수'),
                lastActivationDate: getDate('최근개통일'),
                contractEndDate: getDate('약정종료일'),
                memo: getText('비고'),
            };
        }).filter(Boolean);

        console.log('Processed Accounts:', accounts);


        return NextResponse.json(accounts);
    } catch (error: any) {
        console.error('API Route Error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to fetch Notion data',
        }, { status: 500 });
    }
}
