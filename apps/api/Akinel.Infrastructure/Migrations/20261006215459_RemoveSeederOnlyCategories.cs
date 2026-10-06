using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Akinel.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSeederOnlyCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop FKs so we can freely delete without constraint ordering issues
            migrationBuilder.Sql(@"ALTER TABLE ""Products"" DROP CONSTRAINT IF EXISTS ""FK_Products_Categories_CategoryId""");
            migrationBuilder.Sql(@"ALTER TABLE ""Categories"" DROP CONSTRAINT IF EXISTS ""FK_Categories_Categories_ParentCategoryId""");

            // Delete products whose CategoryId is one of the seeder-only parents or their direct children
            migrationBuilder.Sql(@"
DELETE FROM ""Products""
WHERE ""CategoryId"" IN (
  SELECT ""Id"" FROM ""Categories""
  WHERE ""Slug"" IN ('fren-sistemi','elektrik-sistemi','sogutma-sistemi')
     OR ""ParentCategoryId"" IN (
          SELECT ""Id"" FROM ""Categories""
          WHERE ""Slug"" IN ('fren-sistemi','elektrik-sistemi','sogutma-sistemi')
        )
)");

            // Delete direct children of the 3 seeder-only parents
            migrationBuilder.Sql(@"
DELETE FROM ""Categories""
WHERE ""ParentCategoryId"" IN (
  SELECT ""Id"" FROM ""Categories""
  WHERE ""Slug"" IN ('fren-sistemi','elektrik-sistemi','sogutma-sistemi')
)");

            // Delete the 3 seeder-only parent categories
            migrationBuilder.Sql(@"DELETE FROM ""Categories"" WHERE ""Slug"" IN ('fren-sistemi','elektrik-sistemi','sogutma-sistemi')");

            // Restore FK constraints
            migrationBuilder.Sql(@"ALTER TABLE ""Categories"" ADD CONSTRAINT ""FK_Categories_Categories_ParentCategoryId"" FOREIGN KEY (""ParentCategoryId"") REFERENCES ""Categories""(""Id"") ON DELETE RESTRICT");
            migrationBuilder.Sql(@"ALTER TABLE ""Products"" ADD CONSTRAINT ""FK_Products_Categories_CategoryId"" FOREIGN KEY (""CategoryId"") REFERENCES ""Categories""(""Id"") ON DELETE RESTRICT");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
