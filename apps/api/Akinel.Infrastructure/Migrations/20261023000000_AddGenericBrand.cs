using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Akinel.Infrastructure.Migrations
{
    public partial class AddGenericBrand : Migration
    {
        private static readonly Guid GenericBrandId = new Guid("00000000-0000-0000-0000-000000000001");

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Brands",
                columns: new[] { "Id", "Name", "Slug", "LogoUrl", "IsActive", "CreatedAt", "UpdatedAt" },
                values: new object[] {
                    GenericBrandId,
                    "Genel / Bilinmiyor",
                    "genel-bilinmiyor",
                    (string?)null,
                    true,
                    DateTime.UtcNow,
                    DateTime.UtcNow
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Brands",
                keyColumn: "Id",
                keyValue: GenericBrandId);
        }
    }
}
