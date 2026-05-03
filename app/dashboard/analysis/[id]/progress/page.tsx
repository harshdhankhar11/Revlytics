import { ProgressMonitor } from '@/components/dashboard/NewAnalysis/ProgressMonitor';

export const metadata = {
    title: 'Analysis Progress | Revlytics',
    description: 'Monitor your market analysis progress',
};

export default async function ProgressPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ProgressMonitor analysisId={id} />;
}
