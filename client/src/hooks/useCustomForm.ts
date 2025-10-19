import { useForm, DefaultValues, FieldValues } from "react-hook-form";

export function useCustomForm<T extends FieldValues>(defaultValues?: DefaultValues<T>) {
    return useForm<T>({
        reValidateMode: "onBlur",
        mode: "onBlur",
        defaultValues,
    });
}
