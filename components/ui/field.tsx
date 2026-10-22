"use client";

import {
  cloneElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FieldControlProps {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
}

export interface FieldProps {
  id?: string;
  label: ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactElement<FieldControlProps>;
}

export function Field({
  id,
  label,
  hint,
  error,
  required = false,
  className,
  children,
}: FieldProps) {
  const generatedId = useId();
  const childProps = children.props;
  const controlId =
    id ?? childProps.id ?? `field-${generatedId.replace(/:/g, "")}`;
  const hintId = hint && !error ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy =
    [childProps["aria-describedby"], hintId, errorId]
      .filter((value): value is string => Boolean(value))
      .join(" ") || undefined;

  const control = cloneElement(children, {
    id: controlId,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : childProps["aria-invalid"],
    "aria-required": required ? true : childProps["aria-required"],
  });

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={controlId} required={required}>
        {label}
      </Label>
      {control}
      {error ? (
        <p id={errorId} role="alert" className="text-caption text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-caption text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
