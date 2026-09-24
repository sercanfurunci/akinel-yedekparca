using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Akinel.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBasketItemSessionIdIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Use IF NOT EXISTS because the index may already exist (created via raw SQL)
            migrationBuilder.Sql(
                @"CREATE INDEX IF NOT EXISTS ""IX_BasketItems_SessionId"" ON ""BasketItems"" (""SessionId"");");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_BasketItems_SessionId",
                table: "BasketItems");
        }
    }
}
