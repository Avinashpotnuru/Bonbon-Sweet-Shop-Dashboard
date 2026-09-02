"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type Product,
  type ProductStatus,
} from "@/lib/products-data";

const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required.")
    .max(80, "Product name must be 80 characters or fewer."),
  category: z.string().min(1, "Please select a category."),
  description: z
    .string()
    .max(500, "Description must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
  price: z.coerce
    .number({
      invalid_type_error: "Price must be a number.",
    })
    .min(0.01, "Price must be at least $0.01.")
    .max(99999, "Price is too large (max $99,999)."),
  stock: z.coerce
    .number({
      invalid_type_error: "Stock must be a whole number.",
    })
    .int("Stock must be a whole number.")
    .min(0, "Stock cannot be negative."),
  status: z.enum(["Active", "Draft", "Out of Stock"], {
    message: "Please select a status.",
  }),
  image: z
    .string()
    .url("Please provide a valid image URL.")
    .optional()
    .or(z.literal("")),
});

type ProductFormValues = z.infer<typeof productSchema>;

export type { ProductFormValues };

const statusOptions: ProductStatus[] = ["Active", "Draft", "Out of Stock"];

export function ProductForm({
  open,
  onOpenChange,
  product,
  onSubmit,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  onSubmit: (values: ProductFormValues) => void;
  categories: string[];
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      category: product?.category ?? "",
      description: "",
      price: product?.price ?? undefined,
      stock: product?.stock ?? undefined,
      status: product?.status ?? "Active",
      image: "",
    },
  });

  function onDialogOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset();
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={onDialogOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {product
              ? `Update the details for ${product.name}.`
              : "Fill in the details to add a new product to your inventory."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
          noValidate
        >
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <FieldContent>
              <Input
                id="name"
                placeholder="e.g. Belgian Truffle Collection"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name")}
              />
              {errors.name && (
                <FieldError id="name-error" errors={[{ message: errors.name.message }]} />
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} name={field.name}>
                    <SelectTrigger id="category" aria-invalid={!!errors.category}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <FieldError id="category-error" errors={[{ message: errors.category.message }]} />
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <FieldContent>
              <Textarea
                id="description"
                placeholder="Briefly describe the product..."
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? "description-error" : undefined}
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <FieldError
                  id="description-error"
                  errors={[{ message: errors.description.message }]}
                />
              )}
            </FieldContent>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="price">Price (USD)</FieldLabel>
              <FieldContent>
                <Input
                  id="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  inputMode="decimal"
                  aria-invalid={!!errors.price}
                  aria-describedby={errors.price ? "price-error" : undefined}
                  {...register("price")}
                />
                {errors.price && (
                  <FieldError id="price-error" errors={[{ message: errors.price.message }]} />
                )}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="stock">Stock</FieldLabel>
              <FieldContent>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  inputMode="numeric"
                  aria-invalid={!!errors.stock}
                  aria-describedby={errors.stock ? "stock-error" : undefined}
                  {...register("stock")}
                />
                {errors.stock && (
                  <FieldError id="stock-error" errors={[{ message: errors.stock.message }]} />
                )}
              </FieldContent>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="status">Status</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} name={field.name}>
                    <SelectTrigger id="status" aria-invalid={!!errors.status}>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <FieldError id="status-error" errors={[{ message: errors.status.message }]} />
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="image">Image URL</FieldLabel>
            <FieldContent>
              <Input
                id="image"
                type="url"
                placeholder="https://example.com/image.jpg"
                aria-invalid={!!errors.image}
                aria-describedby={errors.image ? "image-error" : undefined}
                {...register("image")}
              />
              {errors.image ? (
                <FieldError id="image-error" errors={[{ message: errors.image.message }]} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Optional. A URL to the product photo.
                </p>
              )}
            </FieldContent>
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onDialogOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : product
                  ? "Save changes"
                  : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
