import ApproachShowPaper from "@/lib/components/ApproachShowPaper";

export default function Page({ params }: { params: { id: string } }) {
    return <ApproachShowPaper id={params.id} />;
}