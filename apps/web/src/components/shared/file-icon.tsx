import {
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  FileType,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { FileCategory } from "../../lib/utils";
import { getFileCategory } from "../../lib/utils";

interface FileIconProps {
  mimeType: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8",
};

const colorMap: Record<FileCategory, string> = {
  pdf: "text-red-500",
  document: "text-blue-500",
  spreadsheet: "text-emerald-500",
  image: "text-purple-500",
  text: "text-slate-500",
  other: "text-slate-400",
};

export function FileIcon({ mimeType, size = "md", className }: FileIconProps) {
  const category = getFileCategory(mimeType);
  const iconClass = cn(sizeMap[size], colorMap[category], className);

  switch (category) {
    case "pdf":
      return <FileType className={iconClass} />;
    case "document":
      return <FileText className={iconClass} />;
    case "spreadsheet":
      return <FileSpreadsheet className={iconClass} />;
    case "image":
      return <FileImage className={iconClass} />;
    case "text":
      return <FileText className={iconClass} />;
    default:
      return <File className={iconClass} />;
  }
}
