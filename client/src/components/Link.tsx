type Props = {
    href: string;
    className?: string;
} & React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;

function Link({ href, className, ...rest }: Props) {
    return <a href={href} {...rest} className={`${className}`}></a>;
}

export default Link;
