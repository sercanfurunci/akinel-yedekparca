using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Akinel.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProductDiscountPercentage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DiscountPercentage",
                table: "Products",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: true);

            // Backfill: calculate discount percentage from existing CompareAtPrice for legacy products
            migrationBuilder.Sql(@"
                UPDATE ""Products""
                SET ""DiscountPercentage"" = ROUND((1.0 - ""Price"" / ""CompareAtPrice"") * 100, 2)
                WHERE ""CompareAtPrice"" IS NOT NULL
                  AND ""CompareAtPrice"" > ""Price""
                  AND ""Price"" > 0;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DiscountPercentage",
                table: "Products");
        }
    }
}
