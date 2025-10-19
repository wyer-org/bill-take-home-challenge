import React from "react";

type Props = {
    error?: any;
    position?: "left" | "right" | "center";
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;

const ErrorMessage = ({ position = "left", className = "", error, ...rest }: Props) => {
    const errorMessage =
        typeof error === "string"
            ? error
            : Array.isArray(error?.message)
            ? error.message[0]
            : error?.message;

    if (!errorMessage) return null;

    return (
        <span className={`text-red-400 block w-full text-${position} ${className}`} {...rest}>
            {errorMessage}
        </span>
    );
};

export default ErrorMessage;
