import { Label } from "@/components/ui/label"; // Shadcn Label
import { Input } from "@/components/ui/input"; // Shadcn Input

interface Props {
  label: string;
  required?: boolean;
  error?: string;
  [key: string]: any; 
}

export default function DateField({
  label,
  required,
  error,
  ...props 
}: Props) {
  return (
    <div className="space-y-2">
      <Label className="text-slate-700 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <Input
        type="date"
        required={required}
        className={`w-full p-3 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
        {...props} 
      />
      
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}