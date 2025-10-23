"use client";
import Accueil from "../../components/Accueil";
import { useRouter } from "next/navigation";

export default function FormPage() {
    const router = useRouter();

    return (
        <Accueil onFormEnd={() => router.push("/rooms")} />
    );
}
