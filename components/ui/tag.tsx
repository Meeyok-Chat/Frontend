import { cn } from "@/lib/utils";

interface TagProps {
  className?: string;
  type: "Individual" | "Group";
}

export default function Tag({ className, type }: TagProps) {
  return (
    <p
      className={cn(
        "text-xs px-1 py-0.5 rounded select-none",
        type === "Group"
          ? "bg-blue-100 text-blue-800"
          : "bg-green-100 text-green-800",
        className
      )}
    >
      {type === "Individual" ? "DM" : type === "Group" ? "Group" : ""}
    </p>
  );
}
