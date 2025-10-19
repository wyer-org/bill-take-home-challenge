import React from "react";
type Props = {
    name?: string;
    classNname?: string;
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

function FormInput({ name, className = "", ...rest }: Props) {
    return (
        <input
            className={`outline-none w-full border rounded-md flex items-center gap-1 border-gray-200 p-2 focus:border-blue-500 hover:border-blue-300 transition-all transform-all duration-300 ease-in-out disabled:text-gray-400 ${className}`}
            name={name}
            id={name}
            {...rest}
        />
    );
}

export default FormInput;
