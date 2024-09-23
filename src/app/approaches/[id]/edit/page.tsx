import ApproachEditForm from "@/lib/components/ApproachEditForm";

export default function Page({ params }: { params: { id: string } }) {
    return <ApproachEditForm id={params.id} />;
}