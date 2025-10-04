import { useFetchTests } from "../hooks/useTest";

export default function About() {
    const {
        fetchTests: { data, isLoading },
    } = useFetchTests();

    if (isLoading) return <span>...</span>;
    return <h1>{JSON.stringify(data)}</h1>;
}
