import PuzzleEditForm from '@/lib/components/PuzzleEditForm';

export default function Page({ params }: { params: { id: string } }) {
    return (
        <PuzzleEditForm id={params.id} />
    );
}