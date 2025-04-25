import { TagIcon } from "lucide-react";

type TagProps = {
    as?: keyof JSX.IntrinsicElements;
    label: string;
    size?: number;
    mini?: boolean;
};

function Tag({ as, label, size = 12, mini = false }: TagProps) {
    const Component = as || "div";

    return (
        <Component
            className={`genre-elem text-nowrap bg-primary-400 py-1
             rounded-full flex items-center gap-1 text-primary-50
            ring-1 ring-primary-600 ${mini ? "w-min px-2" : "px-3"}`}
        >
            {!mini && <TagIcon size={size} style={{ minWidth: size }} />}
            <span className="truncate">{label}</span>
        </Component>
    );
}

export default Tag;
