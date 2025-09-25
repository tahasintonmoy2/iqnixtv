import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, CheckCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const bannerVariant = cva(
  "border text-center p-4 text-sm flex items-center mb-4",
  {
    variants: {
      variant: {
        warning: "bg-yellow-600/30 border-yellow-600 text-yellow-500 rounded-lg w-full",
        success: "bg-green-600/30 border-green-700 text-green-600 rounded-lg w-full",
      },
    },
    defaultVariants: {
      variant: "warning",
    },
  }
);

const iconVariant = cva("", {
  variants: {
    variant: {
      warning: "text-yellow-600",
      success: "text-green-600",
    },
  },
  defaultVariants: {
    variant: "warning",
  },
});

type BackgroundVariantsProps = VariantProps<typeof bannerVariant>;
type IconVariantsProps = VariantProps<typeof iconVariant>;

interface BannerProps extends BackgroundVariantsProps, IconVariantsProps {
  label: string;
  className?: string;
}

const iconMap = {
  warning: AlertTriangle,
  success: CheckCircle,
};

const Banner = ({ variant, label, className }: BannerProps) => {
  const Icon = iconMap[variant || "warning"];

  return (
    <div className={cn(bannerVariant({ variant }), className)}>
      <Icon className={cn("size-8 lg:size-6 mr-2", iconVariant({ variant }))} />
      {label}
    </div>
  );
};

export default Banner;
