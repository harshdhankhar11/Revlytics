'use server';

import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import prisma from '@/lib/prisma';
import { isValidAmazonUrl, extractAsinFromUrl } from '@/utils/urlValidator';

export async function createAnalysisJob(formData: {
    userProductUrl: string;
    competitorUrls: string[];
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        throw new Error('Unauthorized');
    }

    if (!isValidAmazonUrl(formData.userProductUrl)) {
        throw new Error('Invalid main product URL');
    }

    const validUrls = formData.competitorUrls.filter(url => url.trim());
    for (const url of validUrls) {
        if (!isValidAmazonUrl(url)) {
            throw new Error(`Invalid competitor URL: ${url}`);
        }
    }

    if (validUrls.length === 0) {
        throw new Error('At least one competitor URL is required');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, credits: true, monthlyAnalysisLimit: true, analysisCount: true },
    });

    if (!user) {
        throw new Error('User not found');
    }

    if (user.credits <= 0) {
        throw new Error('Insufficient credits');
    }

    if (user.analysisCount >= user.monthlyAnalysisLimit) {
        throw new Error('Monthly analysis limit reached');
    }

    const userProductAsin = extractAsinFromUrl(formData.userProductUrl);
    const competitorAsins = validUrls
        .map(url => extractAsinFromUrl(url))
        .filter((asin) => asin !== null) as string[];

    const analysisJob = await prisma.analysisJob.create({
        data: {
            userId: user.id,
            userProductUrl: formData.userProductUrl,
            userProductAsin: userProductAsin || '',
            competitorUrls: validUrls,
            competitorAsins,
            status: 'PENDING',
            progress: 0,
        },
    });

    await prisma.user.update({
        where: { id: user.id },
        data: {
            credits: { decrement: 1 },
            analysisCount: { increment: 1 },
        },
    });

    return { analysisJobId: analysisJob.id };
}
