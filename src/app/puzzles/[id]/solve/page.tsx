import PuzzleSolvePaper from "@/lib/components/PuzzleSolvePaper";

export default function Page({ params }: { params: { id: string } }) {
    return <PuzzleSolvePaper id={params.id} />;
}
