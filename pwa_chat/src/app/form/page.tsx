"use client";
import { useRouter } from "next/navigation";
import Accueil from "../../components/Accueil";

export default function FormPage() {
    const router = useRouter();
    return (
        <Accueil onFormEnd={() => router.push("/rooms")} />
    );
}
