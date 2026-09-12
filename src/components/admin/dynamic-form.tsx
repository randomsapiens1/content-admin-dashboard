"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm, Controller, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CollectionConfig, FieldDef } from "@/collections/types";
import { buildItemFormSchema, type ItemFormValues } from "@/lib/validation";
import { toSlug } from "@/lib/slug";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ImagePicker } from "@/components/admin/image-picker";
import type { Media } from "@/db/schema";

export interface DynamicFormSubmitResult {
  error?: string;
}

export function DynamicForm({
  collection,
  initialValues,
  mediaItems,
  onSubmit,
  submitLabel = "Save",
}: {
  collection: CollectionConfig;
  initialValues?: ItemFormValues;
  mediaItems: Media[];
  onSubmit: (values: ItemFormValues) => Promise<DynamicFormSubmitResult | void>;
  submitLabel?: string;
}) {
  const schema = buildItemFormSchema(collection);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(schema),
    defaultValues:
      initialValues ??
      ({
        slug: "",
        status: "draft",
        data: Object.fromEntries(
          collection.fields.map((f) => [f.name, f.type === "boolean" ? false : ""])
        ),
      } as ItemFormValues),
  });

  const slugTouched = useRef(Boolean(initialValues));
  const titleFieldName = collection.titleField
    ? (`data.${collection.titleField}` as FieldPath<ItemFormValues>)
    : undefined;
  const titleValue = watch(titleFieldName ?? "slug");

  useEffect(() => {
    if (!titleFieldName || slugTouched.current) return;
    setValue("slug", toSlug(String(titleValue ?? "")));
  }, [titleValue, titleFieldName, setValue]);

  function submit(values: ItemFormValues) {
    setFormError(null);
    startTransition(async () => {
      const result = await onSubmit(values);
      if (result?.error) {
        setFormError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex max-w-2xl flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="slug">Slug</FieldLabel>
          <Input
            id="slug"
            {...register("slug", {
              onChange: () => {
                slugTouched.current = true;
              },
            })}
          />
          <FieldError errors={errors.slug ? [errors.slug] : undefined} />
        </Field>

        <Field>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </FieldGroup>

      <FieldSeparator />

      <FieldGroup>
        {collection.fields.map((field) => (
          <FieldRenderer
            key={field.name}
            field={field}
            control={control}
            register={register}
            error={errors.data?.[field.name as keyof typeof errors.data]}
            mediaItems={mediaItems}
          />
        ))}
      </FieldGroup>

      {formError && <FieldError>{formError}</FieldError>}

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

function FieldRenderer({
  field,
  control,
  register,
  error,
  mediaItems,
}: {
  field: FieldDef;
  control: ReturnType<typeof useForm<ItemFormValues>>["control"];
  register: ReturnType<typeof useForm<ItemFormValues>>["register"];
  error: unknown;
  mediaItems: Media[];
}) {
  // Field names are dynamic per-collection (from config), so they can't be
  // statically known to react-hook-form's generated path union.
  const name = `data.${field.name}` as FieldPath<ItemFormValues>;
  const fieldError = error as { message?: string } | undefined;

  return (
    <Field>
      <FieldLabel htmlFor={name}>
        {field.label}
        {field.required ? " *" : ""}
      </FieldLabel>

      {field.type === "text" && <Input id={name} {...register(name)} />}

      {field.type === "richtext" && (
        <Textarea id={name} rows={8} {...register(name)} />
      )}

      {field.type === "number" && (
        <Input id={name} type="number" {...register(name)} />
      )}

      {field.type === "date" && (
        <Input id={name} type="date" {...register(name)} />
      )}

      {field.type === "boolean" && (
        <Controller
          control={control}
          name={name}
          render={({ field: rhfField }) => (
            <Switch
              checked={Boolean(rhfField.value)}
              onCheckedChange={rhfField.onChange}
            />
          )}
        />
      )}

      {field.type === "select" && (
        <Controller
          control={control}
          name={name}
          render={({ field: rhfField }) => (
            <Select
              value={String(rhfField.value ?? "")}
              onValueChange={rhfField.onChange}
            >
              <SelectTrigger id={name}>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {(field.options ?? []).map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      )}

      {field.type === "image" && (
        <Controller
          control={control}
          name={name}
          render={({ field: rhfField }) => (
            <ImagePicker
              value={String(rhfField.value ?? "")}
              onChange={rhfField.onChange}
              mediaItems={mediaItems}
            />
          )}
        />
      )}

      {field.helpText && <FieldDescription>{field.helpText}</FieldDescription>}
      {fieldError?.message && <FieldError>{fieldError.message}</FieldError>}
    </Field>
  );
}
