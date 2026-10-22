import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { ComponentProps } from "react";

type FormFieldProps = {
  id: string;
  label: string;
} & ComponentProps<typeof Input>;

export function FormField({ id, label, ...inputProps }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Input id={id} name={id} {...inputProps} />
    </div>
  );
}
