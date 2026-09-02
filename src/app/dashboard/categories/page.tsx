import { CategoriesTable } from "@/components/dashboard/categories-table";

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">
          Organize your candy inventory into categories.
        </p>
      </div>
      <CategoriesTable />
    </div>
  );
}
