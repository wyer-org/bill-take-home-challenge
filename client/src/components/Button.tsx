type Props = {
    text?: string;
    className?: string;
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

function Button({ text = "Button", className = "", ...rest }: Props) {
    return (
        <button
            className={`cursor-pointer border border-gray-400 px-3 py-2 rounded-md hover:text-blue-700 hover:border-blue-700 transition-all duration-200 ${className}`}
            {...rest}
        >
            {text}
        </button>
    );
}

export default Button;
