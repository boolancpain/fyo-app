import * as NotionSDK from '@notionhq/client';
import { NextResponse } from 'next/server';

// Handle potential ESM/CommonJS interop
const Client = (NotionSDK as any).Client || (NotionSDK as any).default?.Client;

if (!Client) {
    console.error('Failed to find Notion Client in SDK:', NotionSDK);
}

const notion = Client ? new Client({
    auth: process.env.NOTION_SECRET,
}) : null;

const databaseId = process.env.NOTION_DATABASE_ID!;

export async function GET() {
    if (!notion) {
        return NextResponse.json({ error: 'Notion SDK failed to initialize' }, { status: 500 });
    }
    if (!process.env.NOTION_SECRET || !process.env.NOTION_DATABASE_ID) {
        return NextResponse.json({ error: 'Notion configuration is missing' }, { status: 500 });
    }

    try {
        console.log('Notion Client keys:', Object.keys(notion));

        const cleanDatabaseId = databaseId.trim();
        console.log('Querying Notion database:', cleanDatabaseId);

        const response = await (notion as any).databases.query({
            database_id: cleanDatabaseId,
            sorts: [
                {
                    property: '이름',
                    direction: 'ascending',
                },
            ],
        });

        console.log('Notion response received. Result count:', response.results.length);

        if (response.results.length > 0) {
            console.log('Sample properties keys:', Object.keys((response.results[0] as any).properties));
        }

        const accounts = response.results.map((page: any) => {
            const props = page.properties;
            if (!props) return null;

            // Helper to extract text from rich_text or title
            const getText = (propName: string) => {
                const prop = props[propName];
                if (!prop) {
                    console.warn(`Property not found: ${propName}`);
                    return '-';
                }
                const arr = prop.rich_text || prop.title || [];
                return arr.map((item: any) => item.plain_text).join('') || '-';
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
                if (!prop) return 0;
                return prop.number || 0;
            };

            return {
                id: page.id,
                name: getText('이름'),
                enrollDate: getDate('최초가입일'),
                account: getText('계정'),
                pw: getText('비밀번호'),
                years: getNumber('가입년수'),
                lastActivationDate: getDate('최근개통일'),
                contractEndDate: getDate('약정종료일'),
                memo: getText('비고'),
            };
        }).filter(Boolean);

        return NextResponse.json(accounts);
    } catch (error: any) {
        console.error('Detailed Notion API Error:', {
            message: error.message,
            code: error.code,
            status: error.status,
            body: error.body
        });
        return NextResponse.json({
            error: error.message || 'Failed to fetch Notion data',
            details: error.code
        }, { status: 500 });
    }
}
