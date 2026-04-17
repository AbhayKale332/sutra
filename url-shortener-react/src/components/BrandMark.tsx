import { Link2 } from "lucide-react";

type BrandMarkProps = {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
};

const BrandMark = ({
  className = "",
  iconClassName = "",
  textClassName = "",
}: BrandMarkProps) => {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/14 ring-1 ring-white/20 backdrop-blur-sm ${iconClassName}`.trim()}>
        <Link2 size={20} className="-rotate-45" />
      </span>
      <span className={`font-bold tracking-tight ${textClassName}`.trim()}>Sutra</span>
    </span>
  );
};

export default BrandMark;
