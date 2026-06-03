import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  label: string;
  required?: boolean;
  error?: string;
  [key: string]: any;
};

export default function NumberField({
  label,
  required,
  error,
  ...props
}: Props) {
  return (
    <div className="space-y-2">
      <Label className="font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <Input
        type="number"
        required={required}
        placeholder={`Enter ${label}`}
        className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
        {...props}
      />
      
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}