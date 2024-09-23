import CheckAnswer from "@/lib/components/CheckAnswer";

export default function Page({ params }: { params: { id: string } }) {
    return <CheckAnswer id={params.id} />;
}