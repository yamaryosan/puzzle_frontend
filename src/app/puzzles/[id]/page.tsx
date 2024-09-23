import PuzzleShowPaper from '@/lib/components/PuzzleShowPaper';

type PageParams = {
    id: string;
};

export default function Page({ params }: { params: PageParams }) {
    return (
        <PuzzleShowPaper id={params.id} />
    );
}