using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Akinel.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ConvertPriceToOriginalPrice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Convert Price from sale price back to original price for all discounted products.
            // Before this migration: Price = sale price, DiscountPercentage = discount %.
            // After this migration:  Price = original/catalog price, sale price is computed on the fly.
            migrationBuilder.Sql(@"
                UPDATE ""Products""
                SET ""Price"" = ROUND(""Price"" / (1.0 - ""DiscountPercentage"" / 100.0), 2)
                WHERE ""DiscountPercentage"" IS NOT NULL
                  AND ""DiscountPercentage"" > 0
                  AND ""DiscountPercentage"" < 100;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverse: convert original price back to sale price
            migrationBuilder.Sql(@"
                UPDATE ""Products""
                SET ""Price"" = ROUND(""Price"" * (1.0 - ""DiscountPercentage"" / 100.0), 2)
                WHERE ""DiscountPercentage"" IS NOT NULL
                  AND ""DiscountPercentage"" > 0
                  AND ""DiscountPercentage"" < 100;
            ");
        }
    }
}
