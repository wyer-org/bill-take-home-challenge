import { toast as sonnerToast } from "sonner";

export interface CustomToastProps {
    id?: string | number;
    title: string;
    description: string;
    button?: {
        label?: string;
        onClick?: () => void;
    };
}

export function CustomToast(props: CustomToastProps) {
    const { title, description, button, id } = props;

    return (
        <div className="flex rounded-lg bg-white shadow-lg ring-1 ring-black/5 w-full md:max-w-[364px] items-center p-4 border border-blue-300">
            <div className="flex flex-1 items-center">
                <div className="w-full">
                    <p className="text-sm font-medium text-gray-900">{title}</p>
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                </div>
            </div>
            <div className="ml-5 shrink-0 rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden">
                {button && (
                    <button
                        className="rounded bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
                        onClick={() => {
                            if (button && button.onClick) button.onClick();
                            sonnerToast.dismiss(id);
                        }}
                    >
                        {button.label || "Close"}
                    </button>
                )}
            </div>
        </div>
    );
}

export function notify(toast: Omit<CustomToastProps, "id">) {
    return sonnerToast.custom((id) => (
        <CustomToast
            id={id}
            title={toast?.title}
            description={toast?.description}
            button={{
                label: toast?.button?.label,
                onClick: () => console.log("Button clicked"),
            }}
        />
    ));
}
